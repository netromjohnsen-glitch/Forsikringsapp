import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import {createTraceTicket, validateTraceTicket} from '../lib/production-trace-ticket.ts';
import {createPilotSession, PILOT_COOKIE_NAME} from '../lib/pilot-access.ts';
import {clientTraceEvents} from '../lib/production-trace.ts';
import {POST} from '../app/api/analysis-trace/route.ts';
import {pipeline} from './helpers/pilot-quality.mjs';
import {deterministicCars} from './helpers/pilot-determinism.mjs';
import {groupInsurances, groupTerms, createDifferences} from '../lib/comparison.ts';
import {portfolioPrice} from '../lib/portfolio-price-presentation.ts';
import {vehiclePrices, isVehiclePriceKey} from '../lib/vehicle-price-presentation.ts';
import {isMotorVehicleType} from '../lib/insurance-normalization.ts';
import {presentImportantDifferences, sortDetailedTerms} from '../lib/comparison-presentation.ts';

const envKeys = ['PILOT_TRACE_ENABLED', 'PILOT_ACCESS_CODE', 'PILOT_SESSION_SECRET'];
const previous = new Map(envKeys.map(key => [key, process.env[key]]));
test.before(() => {
  process.env.PILOT_TRACE_ENABLED = 'true';
  process.env.PILOT_ACCESS_CODE = 'synthetic-pilot-code-only';
  process.env.PILOT_SESSION_SECRET = 'synthetic-receipt-secret-not-for-deployment-2026';
});
test.after(() => {
  for (const [key, value] of previous) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

const documents = [pipeline(deterministicCars(), 'existing'), pipeline(deterministicCars(true), 'offer')];
const groups = groupInsurances(...documents.map(document => document.insuranceData.insurances), null);
const differences = createDifferences(...documents, groups, null);
const presentedDifferences = presentImportantDifferences(differences, groups, null);
const details = groups.map(group => ({group, terms: sortDetailedTerms(groupTerms(group, null)).filter(term => !(isMotorVehicleType(group.key) && isVehiclePriceKey(term.key)))}));
const priceInputs = [[], []];
const portfolioPrices = documents.map((document, side) => portfolioPrice(document, 0, (objectIndex, input) => priceInputs[side].push({objectIndex, input})));
function receipt() {
  const traceId = randomUUID();
  const ticket = createTraceTicket(traceId);
  const context = {traceId, ticket, objectRefs: {left: ['object_0', 'object_1'], right: ['object_2', 'object_3']}};
  const events = clientTraceEvents({documents, groups, differences, presentedDifferences, details, portfolioPrices, priceInputs, priceBranches: ['portfolio', 'portfolio'], context});
  assert.ok(events.length > 0);
  return {traceId, ticket, events};
}
function request(body, headers = {}) {
  return new Request('https://pilot.example/api/analysis-trace', {
    method: 'POST', headers: {
      'content-type': 'application/json', origin: 'https://pilot.example',
      cookie: `${PILOT_COOKIE_NAME}=${createPilotSession()}`, ...headers,
    }, body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
async function capture(run) {
  const logs = [], original = console.info;
  console.info = (...args) => logs.push(args);
  try { return {response: await run(), logs}; } finally { console.info = original; }
}

test('trace ticket is runtime gated, bound to a random trace ID and short-lived', () => {
  const traceId = randomUUID(), ticket = createTraceTicket(traceId);
  assert.ok(validateTraceTicket(traceId, ticket));
  assert.equal(validateTraceTicket(randomUUID(), ticket), false);
  assert.equal(validateTraceTicket(traceId, `${ticket}x`), false);
  assert.equal(createTraceTicket('synthetic-customer-object'), null);
  const now = Date.now;
  try { Date.now = () => now() + 6 * 60_000; assert.equal(validateTraceTicket(traceId, ticket), false); }
  finally { Date.now = now; }
  process.env.PILOT_TRACE_ENABLED = 'TRUE';
  assert.equal(createTraceTicket(traceId), null);
  assert.equal(validateTraceTicket(traceId, ticket), false);
  process.env.PILOT_TRACE_ENABLED = 'true';
});
test('authenticated same-origin receipt logs only strict client events and rejects replay', async () => {
  const body = receipt();
  const {response, logs} = await capture(() => POST(request(body)));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(logs.length, body.events.length);
  for (const [index, log] of logs.entries()) {
    assert.equal(log[0], 'ANALYSIS_TRACE');
    assert.deepEqual(JSON.parse(log[1]), {traceId: body.traceId, phase: 'client', sequence: index, ...body.events[index]});
  }
  assert.doesNotMatch(JSON.stringify(logs), /synthetic-receipt-secret|synthetic-pilot-code|ZZ10001|ZZ10002|12457|14 786|200 000|Gjensidige Forsikring ASA/);
  assert.equal((await POST(request(body))).status, 409);
});
test('receipt endpoint requires enabled flag, session and same origin', async () => {
  const body = receipt();
  assert.equal((await POST(request(body, {cookie: ''}))).status, 401);
  assert.equal((await POST(request(body, {origin: 'https://other.example'}))).status, 403);
  assert.equal((await POST(request(body, {'content-type': 'text/plain'}))).status, 415);
  process.env.PILOT_TRACE_ENABLED = 'false';
  assert.equal((await POST(request(body))).status, 404);
  process.env.PILOT_TRACE_ENABLED = 'true';
});
test('receipt rejects raw fields, customer values, token mismatches and server-stage impersonation without logging', async () => {
  const body = receipt();
  const variants = [
    {...body, documents: []}, {...body, ticket: `${body.ticket}x`},
    {...body, events: [{...body.events[0], value: '12345 kr'}]},
    {...body, events: [{...body.events[0], filename: 'synthetic-private.pdf'}]},
    {...body, events: [{...body.events[0], objectRef: 'ZZ10001'}]},
    {...body, events: [{...body.events[0], stage: 'extraction'}]},
    {...body, events: [{...body.events[0], customer: 'Synthetic Person'}]},
  ];
  for (const variant of variants) {
    const {response, logs} = await capture(() => POST(request(variant)));
    assert.equal(response.status, 400);
    assert.equal(logs.length, 0);
  }
});
test('receipt bounds event counts and bytes even without a content-length header', async () => {
  const body = receipt();
  assert.equal((await POST(request({...body, events: Array(257).fill({stage: 'client_result'})}))).status, 400);
  assert.equal((await POST(request(' '.repeat(256 * 1024 + 1)))).status, 413);
  assert.equal((await POST(request(body, {'content-length': String(256 * 1024 + 1)}))).status, 413);
  assert.equal((await POST(request('{bad json'))).status, 400);
});
test('receipt closes a stalled authenticated body after its bounded read deadline', async () => {
  let cancelled = false;
  const stalled = new ReadableStream({cancel() {cancelled = true;}});
  const pending = new Request('https://pilot.example/api/analysis-trace', {
    method: 'POST', duplex: 'half', body: stalled,
    headers: {'content-type': 'application/json', origin: 'https://pilot.example', cookie: `${PILOT_COOKIE_NAME}=${createPilotSession()}`},
  });
  const original = globalThis.setTimeout;
  globalThis.setTimeout = (callback, duration, ...args) => original(callback, Math.min(duration, 1), ...args);
  try {
    const {response, logs} = await capture(() => POST(pending));
    assert.equal(response.status, 408);
    assert.equal(cancelled, true);
    assert.equal(logs.length, 0);
  } finally {globalThis.setTimeout = original;}
});
test('actual comparison sends projected diagnostics only after current generation guard and never retries', () => {
  const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /clientTraceEvents\(\{ documents: \[first, second\], groups, differences: rawDifferences, presentedDifferences: differences, details: detailRows, portfolioPrices, priceInputs, priceBranches, context: traceContext \}\)/);
  assert.match(source, /!isTraceCurrent\?\.\(traceGeneration\).*traceSignal\?\.aborted.*tracedResponse\.current === traceContext\.traceId/);
  assert.match(source, /if \(!events\.length \|\| !isTraceCurrent\(traceGeneration\) \|\| traceSignal\?\.aborted\) return/);
  assert.match(source, /body: JSON\.stringify\(\{ traceId: traceContext\.traceId, ticket: traceContext\.ticket, events \}\)/);
  assert.match(source, /traceRequest\.current\?\.abort\(\)/);
  assert.match(source, /setTimeout\(abort, 5_000\)/);
  assert.equal((source.match(/fetch\("\/api\/analysis-trace"/g) ?? []).length, 1);
});
test('executed comparison effect ignores stale/cancelled results, sends once and aborts receipt on cancellation', async () => {
  const source = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('function Comparison({');
  const end = source.indexOf('  const safeObjectSet', start);
  assert.ok(start >= 0 && end > start);
  const comparison = source.slice(start, end) + '\n return {groups,differences,portfolioPrices,priceBranches};\n}';
  const javascript = ts.transpileModule(comparison, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
  const effects = [], calls = [], traced = {current: null};
  const dependencies = {
    useMemo: fn => fn(), useRef: () => traced, useEffect: fn => effects.push(fn), useState: value => [value, () => undefined],
    groupInsurances, groupTerms, createDifferences, presentImportantDifferences, sortDetailedTerms, portfolioPrice, vehiclePrices, isVehiclePriceKey, isMotorVehicleType, clientTraceEvents,
    measureComparisonWork: (_label, fn) => fn(),
    fetch: (_url, options) => {calls.push(options); return Promise.resolve({ok: true});},
    setTimeout: () => 1, clearTimeout: () => undefined,
  };
  const Comparison = new Function(...Object.keys(dependencies), javascript + '\nreturn Comparison;')(...Object.values(dependencies));
  const body = receipt(), controller = new AbortController();
  const context = {traceId: body.traceId, ticket: body.ticket, objectRefs: {left: ['object_0','object_1'],right: ['object_2','object_3']}};
  let current = false;
  const props = {first: documents[0], second: documents[1], matchingPlan: null, traceContext: context, traceGeneration: 2, isTraceCurrent: () => current, traceSignal: controller.signal};
  const baseline = Comparison({...props, traceContext: undefined}); effects.splice(0).forEach(fn => fn());
  assert.deepEqual(Comparison(props), baseline); effects.splice(0).forEach(fn => fn());
  assert.equal(calls.length, 0);
  current = true;
  assert.deepEqual(Comparison(props), baseline); effects.splice(0).forEach(fn => fn());
  assert.equal(calls.length, 1);
  assert.deepEqual(Object.keys(JSON.parse(calls[0].body)).sort(), ['events', 'ticket', 'traceId']);
  Comparison(props); effects.splice(0).forEach(fn => fn());
  assert.equal(calls.length, 1);
  controller.abort(); assert.equal(calls[0].signal.aborted, true);
  const next = {...props, traceContext: {...context, traceId: randomUUID()}};
  Comparison(next); effects.splice(0).forEach(fn => fn());
  assert.equal(calls.length, 1);
  await Promise.resolve();
});
