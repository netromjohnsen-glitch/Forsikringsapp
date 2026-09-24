import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createProductionTrace } from '../lib/production-trace-server.ts';
import { sanitizeTraceEvent } from '../lib/production-trace.ts';
import { enrichBatch, mergeBatchResults } from '../lib/analysis-merge.ts';
import { planExtractionBatches } from '../lib/analysis-batching.ts';
import { analyzePdfBatches } from '../lib/pdf-analysis-pipeline.ts';
import { createAnalysisTelemetry } from '../lib/analysis-telemetry.ts';
import { sanitizeAnalysisDocumentForClient } from '../lib/analysis-output.ts';
import { PdfSecurityError } from '../lib/pdf-upload-security.ts';
import { groupInsurances, createDifferences } from '../lib/comparison.ts';
import { portfolioPrice } from '../lib/portfolio-price-presentation.ts';
import { car, parsed } from './helpers/pilot-quality.mjs';

const canary = 'PRIVATE_PIPELINE_CANARY';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const collect = (enabled = true, sink) => {
  const traceId = randomUUID(), lines = [];
  const trace = createProductionTrace(traceId, enabled, sink ?? (line => lines.push(line)));
  return { traceId, trace, lines };
};
const eventsOf = lines => lines.map(line => JSON.parse(line));
function extractionRecord(product, localIndex = 1, variant = 0) {
  const record = car(product);
  record.coverageSummary = canary;
  record.documentIndices = [localIndex];
  record.objectIdentifiers = record.objectIdentifiers.map(identifier => ({ ...identifier, value: `ZZ${variant}${product === 'Kasko' ? '1001' : '1002'}`, documentIndices: [localIndex] }));
  record.importantTerms = record.importantTerms.map(term => ({ ...term, documentIndices: [localIndex] }));
  return record;
}
function snapshotResult(documents) {
  const groups = groupInsurances(...documents.map(document => document.insuranceData.insurances), null);
  return { documents, groups, differences: createDifferences(...documents, groups, null), prices: documents.map(document => portfolioPrice(document)) };
}
async function runPipeline({ enabled = true, crossBatch = false, shuffledCompletion = false, sink, variant = 0, partial = false, extractionFailure = false } = {}) {
  const { traceId, trace, lines } = collect(enabled, sink);
  const count = crossBatch ? 4 : 2;
  const sides = ['existing', 'offer'].map(side => ({
    side,
    files: Array.from({ length: count }, (_, index) => ({ name: `${canary}_${side}_${index}.pdf`, data: Buffer.from(JSON.stringify({ side, index })) })),
  }));
  const progress = [], extractionCalls = [], completion = [];
  const telemetry = createAnalysisTelemetry(randomUUID());
  let active = 0, peak = 0;
  const result = await analyzePdfBatches({
    sides, controller: new AbortController(), telemetry, trace, emit: event => progress.push(event),
    parse: async file => {
      const identity = JSON.parse(file.data.toString());
      if (partial && identity.side === 'existing' && identity.index === 1) throw new PdfSecurityError(422, 'invalid_pdf', canary);
      return { text: `${canary} Safe synthetic text `.repeat(crossBatch ? 2500 : 2), pages: 1, parseMs: 1, textMs: 1 };
    },
    extract: async batch => {
      extractionCalls.push(batch.batchIndex);
      peak = Math.max(peak, ++active);
      if (shuffledCompletion) await delay(batch.batchIndex % 2 ? 1 : 12);
      else await delay(1);
      active--;
      completion.push(batch.batchIndex);
      if (extractionFailure && batch.batchIndex === 1) throw new Error(canary);
      const records = batch.documents.map((doc, index) => {
        const isKasko = doc.side === 'existing' ? doc.documentIndex % 2 === 0 : doc.documentIndex % 2 === 1;
        const record = extractionRecord(isKasko ? 'Kasko' : 'Pluss', index + 1, variant);
        if (doc.side === 'offer') record.company = 'Gjensidige Forsikring ASA';
        return record;
      });
      return parsed(records);
    },
  });
  const documents = ['existing', 'offer'].map(side => mergeBatchResults(shuffledCompletion ? result.results.toReversed() : result.results, side, result.partialSuccess, trace));
  const sanitized = documents.map(document => sanitizeAnalysisDocumentForClient(document));
  const refs = documents.map((document, index) => trace?.final(index === 0 ? 'existing' : 'offer', document.insuranceData.insurances, sanitized[index].insuranceData.insurances));
  trace?.flush();
  return { traceId, result, snapshot: snapshotResult(sanitized), refs, lines, progress, extractionCalls, completion, peak };
}

test('server collector is disabled explicitly and rejects invalid or customer-derived request IDs', () => {
  assert.equal(createProductionTrace(randomUUID(), false), undefined);
  for (const id of [canary, 'object_0', '00000000-0000-0000-0000-000000000000', `${randomUUID()}_${canary}`]) assert.equal(createProductionTrace(id, true), undefined);
});

test('enrichBatch and mergeBatchResults outputs are identical with trace enabled or absent', () => {
  const batches = planExtractionBatches(['existing', 'offer'].map(side => ({ side, documentIndex: 0, text: 'Synthetic text', pages: 1 })));
  const agreement = parsed([extractionRecord('Kasko'), extractionRecord('Pluss')]);
  const baseline = batches.map(batch => ({ batch, agreement: enrichBatch(agreement, batch, createAnalysisTelemetry(randomUUID())) }));
  const { trace, lines } = collect();
  const observed = batches.map(batch => {
    trace.batch(batch);
    const result = enrichBatch(agreement, batch, createAnalysisTelemetry(randomUUID()), trace);
    trace.assignment(batch, agreement.insurances);
    return { batch, agreement: result };
  });
  assert.deepEqual(observed, baseline);
  for (const side of ['existing', 'offer']) assert.deepEqual(mergeBatchResults(observed, side, false, trace), mergeBatchResults(baseline, side, false));
  trace.flush();
  assert.ok(eventsOf(lines).some(event => event.stage === 'catalog'));
  assert.ok(eventsOf(lines).some(event => event.stage === 'consolidation'));
});

test('full PDF batching trace ON/OFF preserves results, coverage, prices, progress and extraction call count', async () => {
  const off = await runPipeline({ enabled: false });
  const on = await runPipeline();
  assert.deepEqual(on.result, off.result);
  assert.deepEqual(on.snapshot, off.snapshot);
  assert.deepEqual(on.progress, off.progress);
  assert.deepEqual(on.extractionCalls, off.extractionCalls);
  assert.equal(on.extractionCalls.length, 2);
  assert.equal(on.peak, 2);
  assert.equal(off.lines.length, 0);
  const events = eventsOf(on.lines);
  for (const stage of ['document', 'extraction', 'normalization', 'product', 'catalog', 'effective', 'consolidation', 'coverage', 'sanitizer', 'complete']) assert.ok(events.some(event => event.stage === stage), stage);
  assert.equal(events.at(-1).observerFailures, 0);
  assert.equal(events.at(-1).droppedEvents, 0);
});

test('asynchronous and cross-batch consolidation preserves anonymous document, object and batch links', async () => {
  const baseline = await runPipeline({ enabled: false, crossBatch: true });
  const result = await runPipeline({ crossBatch: true, shuffledCompletion: true });
  assert.deepEqual(result.snapshot, baseline.snapshot);
  assert.equal(result.extractionCalls.length, 8);
  assert.notDeepEqual(result.completion, result.extractionCalls);
  assert.equal(result.peak, 2);
  const events = eventsOf(result.lines);
  const documents = events.filter(event => event.stage === 'document');
  const extracted = events.filter(event => event.stage === 'extraction');
  const consolidated = events.filter(event => event.stage === 'consolidation' && event.accepted);
  assert.equal(new Set(documents.map(event => event.docRef)).size, 8);
  assert.equal(new Set(extracted.map(event => event.batchRef)).size, 8);
  assert.equal(extracted.length, 8);
  assert.equal(new Set(extracted.map(event => event.objectRef)).size, 8);
  assert.equal(consolidated.length, 4);
  assert.equal(events.filter(event => event.stage === 'repeated_normalization').length, 8);
  for (const extraction of extracted) {
    assert.ok(extraction.documentRefs.every(ref => documents.some(document => document.docRef === ref && document.batchRef === extraction.batchRef && document.side === extraction.side)));
    const assignment = documents.find(document => document.objectRefs?.includes(extraction.objectRef));
    assert.equal(assignment.extractedObjects, 1);
    assert.equal(assignment.batchRef, extraction.batchRef);
  }
  for (const consolidatedObject of consolidated) {
    assert.equal(consolidatedObject.inputRefs.length, 2);
    const inputs = extracted.filter(event => consolidatedObject.inputRefs.includes(event.objectRef));
    assert.equal(inputs.length, 2);
    assert.ok(inputs.every(event => event.side === consolidatedObject.side));
    assert.deepEqual(consolidatedObject.documentRefs.toSorted(), [...new Set(inputs.flatMap(event => event.documentRefs))].toSorted());
    assert.ok(events.some(event => event.stage === 'sanitizer' && event.objectRef === consolidatedObject.objectRef));
    assert.ok(result.refs.flat().includes(consolidatedObject.objectRef));
  }
  assert.equal(events.at(-1).observerFailures, 0);
});

test('server events preserve coverage winner origin and status without exposing raw source facts', async () => {
  const result = await runPipeline();
  const events = eventsOf(result.lines);
  const products = events.filter(event => event.stage === 'product');
  const kasko = products.find(event => event.side === 'left' && event.productId === 'gj-bil-kasko');
  const pluss = products.find(event => event.side === 'left' && event.productId === 'gj-bil-pluss');
  assert.ok(kasko);
  assert.ok(pluss);
  const coverage = objectRef => events.filter(event => event.stage === 'coverage' && event.objectRef === objectRef).at(-1).coverages;
  assert.deepEqual(coverage(kasko.objectRef).find(fact => fact.key === 'leiebil.dekning'), { key: 'leiebil.dekning', status: 'not_selected', origin: 'document', reason: 'explicit_status' });
  assert.deepEqual(coverage(pluss.objectRef).find(fact => fact.key === 'leiebil.dekning'), { key: 'leiebil.dekning', status: 'selected', origin: 'document', reason: 'explicit_status' });
  assert.ok(coverage(kasko.objectRef).some(fact => fact.origin === 'catalog'));
  const catalog = events.filter(event => event.stage === 'catalog' && event.objectRef === kasko.objectRef).at(-1);
  assert.equal(catalog.decisions.find(decision => decision.key === 'nyverdi.km').decision, 'DOCUMENT_PRESENT_SKIP_CATALOG');
  assert.ok(catalog.decisions.some(decision => decision.decision === 'CATALOG_APPLIED'));
  const text = result.lines.join('\n');
  assert.doesNotMatch(text, /PRIVATE|ZZ[0-9]+|15 000|60 000|14786|1478600|2757400|\.pdf|pdf:existing|Gjensidige Forsikring/);
  for (const { traceId, phase, sequence, ...event } of events) {
    assert.equal(traceId, result.traceId);
    assert.equal(phase, 'server');
    assert.ok(Number.isInteger(sequence));
    assert.ok(sanitizeTraceEvent(event));
  }
});

test('simultaneous analyses keep independent trace IDs, counters, scopes and privacy boundaries', async () => {
  const results = await Promise.all([runPipeline({ variant: 1, shuffledCompletion: true }), runPipeline({ variant: 2, shuffledCompletion: true })]);
  assert.notEqual(results[0].traceId, results[1].traceId);
  for (const result of results) {
    const events = eventsOf(result.lines);
    assert.ok(events.every(event => event.traceId === result.traceId));
    assert.equal(events[0].docRef, 'doc_0');
    assert.equal(events.find(event => event.stage === 'extraction').objectRef, 'object_0');
    assert.equal(events.filter(event => event.stage === 'extraction').length, 4);
    assert.equal(events.at(-1).observerFailures, 0);
    assert.doesNotMatch(result.lines.join('\n'), /PRIVATE|ZZ[0-9]+/);
  }
});

test('logging sink failures cannot fail or alter a successful analysis', async () => {
  const baseline = await runPipeline({ enabled: false });
  let attempts = 0;
  const observed = await runPipeline({ sink: () => { attempts++; throw new Error(canary); } });
  assert.deepEqual(observed.result, baseline.result);
  assert.deepEqual(observed.snapshot, baseline.snapshot);
  assert.deepEqual(observed.extractionCalls, baseline.extractionCalls);
  assert.ok(attempts > 1);
});

test('partial unreadable document is traced without replacing missing objects or exposing error text', async () => {
  const baseline = await runPipeline({ enabled: false, partial: true });
  const observed = await runPipeline({ partial: true });
  assert.deepEqual(observed.result, baseline.result);
  assert.deepEqual(observed.snapshot, baseline.snapshot);
  assert.equal(observed.result.partialSuccess, true);
  assert.equal(observed.result.failures.length, 1);
  assert.equal(observed.extractionCalls.length, 2);
  const events = eventsOf(observed.lines);
  assert.equal(events.filter(event => event.stage === 'document' && event.parsed === false).length, 1);
  assert.doesNotMatch(observed.lines.join('\n'), /PRIVATE|invalid_pdf|ZZ[0-9]+/);
});

test('collector buffer has a finite cap and records dropped events without raw input retention', () => {
  const { trace, lines } = collect();
  for (let index = 0; index < 1100; index++) trace.document('existing', 0, true);
  trace.flush();
  const events = eventsOf(lines);
  assert.equal(events.length, 1025);
  assert.equal(events.at(-1).eventCount, 1024);
  assert.equal(events.at(-1).droppedEvents, 76);
  assert.equal(events.at(-1).observerFailures, 0);
});

test('successful PDF parsing followed by extraction failure keeps parsing status true', async () => {
  const baseline = await runPipeline({ enabled: false, crossBatch: true, extractionFailure: true });
  const observed = await runPipeline({ crossBatch: true, extractionFailure: true });
  assert.deepEqual(observed.result, baseline.result);
  assert.deepEqual(observed.snapshot, baseline.snapshot);
  assert.equal(observed.result.failures.length, 1);
  assert.equal(observed.result.failures[0].code, 'extraction_failed');
  const events = eventsOf(observed.lines);
  assert.ok(events.filter(event => event.stage === 'document').every(event => event.parsed === true));
  assert.equal(events.filter(event => event.stage === 'extraction' && event.reason === 'EXTRACTION_FAILED').length, 1);
  assert.doesNotMatch(observed.lines.join('\n'), /PRIVATE|ZZ[0-9]+/);
});
