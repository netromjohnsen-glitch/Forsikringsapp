import {car, term, parsed, batches} from './pilot-quality.mjs';
import {normalizeDocumentFacts} from '../../lib/document-fact-normalization.ts';
import {consolidateInsuranceRecords} from '../../lib/insurance-object-consolidation.ts';
import {enrichConsolidatedInsurance} from '../../lib/catalog-enrichment.ts';
import {mergeBatchResults} from '../../lib/analysis-merge.ts';
import {sanitizeAnalysisDocumentForClient} from '../../lib/analysis-output.ts';
import {comparisonTermIdentities} from '../../lib/insurance-normalization.ts';
import {groupInsurances, groupTerms} from '../../lib/comparison.ts';

export function deterministicCars(decorated = false) {
  return [car(), car('Pluss')].map(record => ({...record,
    company: decorated ? 'Gjensidige Forsikring ASA' : 'Gjensidige',
    importantTerms: record.importantTerms.map(item => {
      if (!decorated || !item.canonicalKey?.startsWith('premie.')) return item;
      const amount = Number(item.value.replace(' kr', ''));
      const value = new Intl.NumberFormat('nb-NO').format(amount).replaceAll('\u00a0', ' ');
      return {...item, value: item.canonicalKey === 'premie.total'
        ? `kr ${value} etter rabatter, inklusive trafikkforsikringsavgift`
        : item.canonicalKey === 'premie.ekskl_tfa'
          ? `${value} kr per år, eksklusive trafikkforsikringsavgift` : `${value} kr årlig`};
    }),
  }));
}

// Local/test-only trace. Never imported by production or sent to telemetry.
export function totalskadeTrace(side, value = '15 000 km', reverseCompletion = false) {
  const raw = car();
  raw.importantTerms[0] = term('Totalskadegaranti – kilometer', value, 'nyverdi.km');
  raw.importantTerms.push(term('Totalskadegaranti – alder', '1 år', 'nyverdi.alder'));
  const extracted = parsed([raw]).insurances[0];
  const first = {...extracted, importantTerms: normalizeDocumentFacts(extracted)};
  const repeated = {...first, importantTerms: normalizeDocumentFacts(first)};
  const results = batches([raw, structuredClone(raw)], side);
  const ordered = reverseCompletion ? results.toReversed() : results;
  const consolidated = consolidateInsuranceRecords(ordered.flatMap(r => r.agreement.documentRecords))[0].record;
  const enriched = enrichConsolidatedInsurance(consolidated.company, consolidated, consolidated.importantTerms);
  const merged = mergeBatchResults(ordered, side, false);
  const sanitized = sanitizeAnalysisDocumentForClient(merged);
  const client = sanitized.insuranceData.insurances[0];
  const entries = record => comparisonTermIdentities(record.importantTerms, {insuranceType: record.type})
    .filter(item => item.key === 'nyverdi.km').map(({term}) => ({value: term.value, origin: term.coverageOrigin ?? 'document'}));
  const group = groupInsurances([client], [client], null)[0];
  const comparison = groupTerms(group, null).find(item => item.key === 'nyverdi.km');
  return {stages: {
    extraction: extracted.importantTerms.filter(t => t.canonicalKey === 'nyverdi.km' || t.key === 'nyverdi.km').map(t => ({value: t.value, origin: 'document'})),
    firstNormalization: entries(first), repeatedNormalization: entries(repeated),
    consolidation: entries(consolidated), catalogEnrichment: entries(enriched),
    effectiveResolution: entries(merged.insuranceData.insurances[0]), sanitizer: entries(client),
    comparison: [{value: comparison.first, origin: comparison.firstSourceOrigins[0]?.origin}],
  }, client, comparison};
}
