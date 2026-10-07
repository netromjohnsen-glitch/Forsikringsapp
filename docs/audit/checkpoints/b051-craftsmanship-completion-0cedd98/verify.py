#!/usr/bin/env python3
"""Verify current completion and retained failure history without rewriting it."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
OLD = OUT.parent / 'b051-craftsmanship-0cedd98'
BASE = '0cedd98cc3ae1e885902aba585ef65054985c5e5'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda n: json.loads((OUT / n).read_text())
auth = json.loads((OLD / 'authorization.json').read_text())
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
exact = {'46e94bcf464af845', '2113807ceb290224', 'af150eab853a1648', '239b00779349f2fd', '57c775ac935fb504'}
assert {s['signature'] for s in auth['signatures']} == exact
for s in auth['signatures']:
    assert s['original_binding'] == registry[s['signature']]
    for e in s['original_source_evidence']:
        assert e['finding_id'] in json.loads(registry[s['signature']]['finding_ids'])
        assert e['source_fact_id'] in json.loads(registry[s['signature']]['source_fact_ids'])
for path, digest in auth['source_hashes'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
before = read('resume-integrity.json')
helper = str((OLD / 'expected-catalog.mjs').relative_to(ROOT))
original_helper = gzip.decompress((OUT / 'before-expected-catalog.mjs.gz').read_bytes())
assert sha(original_helper) == before['previous_packet_files'][helper]
for path, digest in before['previous_packet_files'].items():
    assert sha(original_helper if path == helper else (ROOT / path).read_bytes()) == digest, path
for path, digest in before['preserved_candidate_files'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
for path, digest in json.loads((OLD / 'historical-artifact-hashes.json').read_text()).items():
    assert sha((ROOT / path).read_bytes()) == digest, path
for line in (OLD / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    assert sha(original_helper if path == helper else (ROOT / path).read_bytes()) == digest, path
prior = json.loads((OLD / 'prior-receipts.json').read_text())
assert len(prior) == len({r['signature'] for r in prior}) == 39
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256']
    receipt = json.loads((ROOT / r['path']).read_text())
    assert receipt['status'] == 'PASS' and receipt['signature'] == r['signature']
identity = read('application-identity.json')
for path, digest in identity['application_files'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
assert sha(json.dumps(identity['application_files'], sort_keys=True, separators=(',', ':')).encode()) == identity['identity_sha256']
proof = read('representation-correction-proof.json')
assert proof['status'] == 'PASS' and proof['raw_own_productCode'] and proof['raw_productCode_is_undefined']
assert proof['raw_fields'] == proof['snapshot_fields'] + ['productCode']
assert proof['all_other_fields_equal'] and proof['strict_whole_rows_equal']
roots = read('harness-roots.json')
assert [r['campaign_before'] for r in roots] == [18, 19]
assert [r['campaign_after'] for r in roots] == [19, 20]
assert all(r['corrected'] and r['ordinary_limit'] == 12 for r in roots)
results = read('gate-results.json')['results']
assert results and all(r['status'] == 'PASS' and r['exit_code'] == 0 and r['tested_revision'] == BASE for r in results)
for r in results:
    log = (OUT / r['log']).read_bytes()
    assert sha(log) == r['log_sha256'] and sha(gzip.decompress(log)) == r['output_sha256']
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
full = [r for r in results if r['label'].startswith('full-')]
assert len(full) == len(manifest) == 149
assert sorted(r['command'][-1] for r in full) == manifest
assert all(r['tap']['fail'] == r['tap']['cancelled'] == r['tap']['skipped'] == 0 for r in full)
rem = read('remediation-manifest.json')
assert rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
summary = read('validation-summary.json')
assert summary['status'] == 'PASS'
for name, selected in [('fullsuite', full), ('remediation', [r for r in full if r['command'][-1] in rem])]:
    assert summary[name]['files'] == len(selected)
    for k in ['tests', 'pass', 'fail', 'cancelled', 'skipped']:
        assert summary[name][k] == sum(r['tap'][k] for r in selected)
assert next(r for r in results if r['label'] == 'targeted-closure-remediation-b-051-craftsmanship')['tap']['pass'] == 93
assert next(r for r in full if r['command'][-1] == 'tests/supporting-terms.test.mjs')['tap']['pass'] == 45
for label in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']:
    assert len([r for r in results if r['label'] == label]) == 1
assert next(r for r in results if r['label'] == 'eslint')['errors'] == 0
subprocess.run(['node', str(OLD / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
receipts = [json.loads(p.read_text()) for p in OUT.glob('receipt-*.json')]
assert len(receipts) == 5 and {r['signature'] for r in receipts} == exact
for r in receipts:
    assert r['status'] == 'PASS' and r['tested_baseline'] == BASE
    assert r['original_binding'] == registry[r['signature']]
    assert r['candidate_identity_sha256'] == identity['identity_sha256']
    assert r['global_resolved_open'] == 'UNKNOWN' and r['P2_credit'] == 0
cp = read('checkpoint.json')
assert cp['documented_campaign_count'] == len(set(cp['documented_campaign_signatures'])) == 44
assert set(cp['documented_campaign_signatures']) == exact | {r['signature'] for r in prior}
prior_cp = json.loads((ROOT / 'docs/audit/checkpoints/b051-events-completion-19ce85d/checkpoint.json').read_text())
for field in ['historical_only', 'holds_unchanged', 'historical_DEFER_SAFE_signatures']:
    assert cp[field] == prior_cp[field]
assert cp['HARNESS_AUTONOMY_V1']['used'] == 20 and cp['HARNESS_AUTONOMY_V1']['scope_used'] == 2
assert cp['global_resolved_open'] == 'UNKNOWN'
partition = read('b051-partition.json')
assert set(partition['exact_original_signatures']) == {s for s, r in registry.items() if r['final_batch_id'] == 'B-051'}
sets = [set(partition[k]) for k in ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']]
assert list(map(len, sets)) == [18, 17, 2, 2]
assert set.union(*sets) == set(partition['exact_original_signatures'])
assert sum(map(len, sets)) == len(set.union(*sets)) == 39
assert sets[0] == set(prior_cp['current_B051_completed_signatures']) | exact
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    assert sha((ROOT / path).read_bytes()) == digest, path
expected = read('expected-files.json')
assert len(expected) == len(set(expected))
for path in OUT.glob('*.md'):
    assert b'\r' not in path.read_bytes()
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if not target.startswith(('http:', 'https:', '#')):
            assert (path.parent / target.split('#')[0]).exists(), target
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('Completion integrity PASS:5 exact new receipts,39 immutable prior receipts,44 unique documented signatures; budget20/12 scope2/6; global UNKNOWN')
