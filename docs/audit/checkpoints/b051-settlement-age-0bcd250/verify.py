#!/usr/bin/env python3
"""Verify current source-backed receipts and immutable historical evidence."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = '0bcd250944853607a01066c2c9566bed0c7118af'
PRIOR = OUT.parent / 'b051-craftsmanship-completion-0cedd98'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda n: json.loads((OUT / n).read_text())
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
exact = {'0f7980d6139daa2e', '4971fe7dbeac3649', '6080e5e5a6bb3c63', 'ce381a27b7435bec'}
auth = read('authorization.json')
assert auth['baseline_revision'] == BASE
assert {r['signature_id'] for r in auth['signatures']} == exact
for r in auth['signatures']:
    assert r == registry[r['signature_id']]
for entry in auth['preflight_entries']:
    assert entry['original_binding'] == registry[entry['signature']]
    assert len(entry['original_source_evidence']) == 2
    for source in entry['original_source_evidence']:
        assert source['finding_id'] in json.loads(entry['original_binding']['finding_ids'])
        assert source['source_fact_id'] in json.loads(entry['original_binding']['source_fact_ids'])
        assert sha((ROOT / source['artifact']).read_bytes()) == source['sha256']
prior = read('prior-receipts.json')
assert len(prior) == len({r['signature'] for r in prior}) == 44
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256']
    receipt = json.loads((ROOT / r['path']).read_text())
    assert receipt['status'] == 'PASS' and receipt['signature'] == r['signature']
for path, digest in read('historical-artifact-hashes.json').items():
    assert sha((ROOT / path).read_bytes()) == digest, path
identity = read('application-identity.json')
for path, digest in identity['application_files'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
assert sha(json.dumps(identity['application_files'], sort_keys=True, separators=(',', ':')).encode()) == identity['identity_sha256']
assert read('harness-roots.json') == []
results = read('gate-results.json')['results']
assert results and all(r['status'] == 'PASS' and r['exit_code'] == 0 and r['tested_revision'] == BASE for r in results)
for r in results:
    log = (OUT / r['log']).read_bytes()
    assert sha(log) == r['log_sha256'] and sha(gzip.decompress(log)) == r['output_sha256']
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
full = [r for r in results if r['label'].startswith('full-')]
assert len(full) == len(manifest) == 150
assert sorted(r['command'][-1] for r in full) == manifest
assert all(r['tap']['fail'] == r['tap']['cancelled'] == r['tap']['skipped'] == 0 for r in full)
rem = read('remediation-manifest.json')
assert rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
assert len(rem) == 52
summary = read('validation-summary.json')
assert summary['status'] == 'PASS'
for name, selected in [('fullsuite', full), ('remediation', [r for r in full if r['command'][-1] in rem]), ('targeted', [r for r in results if r['label'].startswith('targeted-closure-')])]:
    assert summary[name]['files'] == len(selected)
    for k in ['tests', 'pass', 'fail', 'cancelled', 'skipped']:
        assert summary[name][k] == sum(r['tap'][k] for r in selected)
assert next(r for r in results if r['label'] == 'targeted-closure-remediation-b-051-settlement-age')['tap']['pass'] == 195
for label in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']:
    assert len([r for r in results if r['label'] == label]) == 1
assert next(r for r in results if r['label'] == 'eslint')['errors'] == 0
assert next(r for r in results if r['label'] == 'http-pdf-runtime')['runtime']['result'] == 'PASS'
subprocess.run(['node', str(OUT / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
delta = read('catalog-delta.json')
assert delta['entirely_unchanged_components'] == 317 and delta['protected_raw_facts'] == 4150 and delta['other_products_unchanged'] == 202
assert len(delta['changes']) == 8 and all(c['owner'] == 'gjensidigeHusStandard' for c in delta['changes'])
receipts = [json.loads(p.read_text()) for p in OUT.glob('receipt-*.json')]
assert len(receipts) == 4 and {r['signature'] for r in receipts} == exact
for r in receipts:
    assert r['status'] == 'PASS' and r['tested_baseline'] == BASE
    assert r['original_binding'] == registry[r['signature']]
    assert r['candidate_identity_sha256'] == identity['identity_sha256']
    assert r['global_resolved_open'] == 'UNKNOWN' and r['P2_credit'] == 0
cp = read('checkpoint.json')
assert cp['documented_campaign_count'] == len(set(cp['documented_campaign_signatures'])) == 48
assert set(cp['documented_campaign_signatures']) == exact | {r['signature'] for r in prior}
prior_cp = json.loads((PRIOR / 'checkpoint.json').read_text())
for field in ['historical_only', 'holds_unchanged', 'historical_DEFER_SAFE_signatures']:
    assert cp[field] == prior_cp[field]
assert cp['HARNESS_AUTONOMY_V1']['used'] == 20 and cp['HARNESS_AUTONOMY_V1']['scope_used'] == 0
assert cp['global_resolved_open'] == 'UNKNOWN'
partition = read('b051-partition.json')
assert set(partition['exact_original_signatures']) == {s for s, r in registry.items() if r['final_batch_id'] == 'B-051'}
sets = [set(partition[k]) for k in ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']]
assert list(map(len, sets)) == [22, 13, 2, 2]
assert sum(map(len, sets)) == len(set.union(*sets)) == 39
assert set.union(*sets) == set(partition['exact_original_signatures'])
assert sets[0] == set(prior_cp['current_B051_completed_signatures']) | exact
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    assert sha((ROOT / path).read_bytes()) == digest, path
expected = read('expected-files.json')
assert len(expected) == len(set(expected))
assert set(identity['application_files']).issubset(expected)
assert set(expected) == set(identity['application_files']) | {'docs/development-agent/current-project-status.md'} | {str(p.relative_to(ROOT)) for p in OUT.rglob('*') if p.is_file()}
for path in OUT.glob('*.md'):
    assert b'\r' not in path.read_bytes()
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if not target.startswith(('http:', 'https:', '#')):
            assert (path.parent / target.split('#')[0]).exists(), target
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('Completion integrity PASS:4 exact new receipts,44 immutable prior receipts,48 unique documented signatures; B05122/13/2/2; budget20/12 scope0; global UNKNOWN')
