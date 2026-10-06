#!/usr/bin/env python3
"""Check the exact garden completion candidate without rewriting historical evidence."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = '64dd3cb12116c725b600e53af7da1f13fa9cf3bf'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda name: json.loads((OUT / name).read_text())
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
old = json.loads((ROOT / 'docs/audit/checkpoints/b051-rental-loss-use-5718a5f/checkpoint.json').read_text())
assert old['documented_campaign_count'] == 31 and old['HARNESS_AUTONOMY_V1']['used'] == 11
prior = read('prior-receipts.json')
assert len(prior) == 31 and {r['signature'] for r in prior} == set(old['documented_campaign_signatures'])
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256'], r['path']
resume = read('resume-input-integrity.json')
assert resume['head'] == resume['remote_main'] == BASE and resume['staged'] == 0
for f, h in resume['prior_package_files'].items():
    assert sha((ROOT / f).read_bytes()) == h, f
for f, h in read('historical-artifact-hashes.json').items():
    assert sha((ROOT / f).read_bytes()) == h, f
# A stopped package remains stopped. Its original candidate is retained verbatim in snapshots.
for f, reference in resume['candidate_files_before_corrections'].items():
    h = reference['sha256']
    snapshot = OUT / reference['snapshot']
    assert sha(gzip.decompress(snapshot.read_bytes())) == h, f
    if f != 'tests/remediation-b-051-garden.test.mjs':
        assert sha((ROOT / f).read_bytes()) == h, f
historical = read('historical-checksum-proof.json')
assert historical['status'] == 'PASS' and historical['prior_receipt_count'] == 31
historical_refs = {(r['package'], r['file'], r['manifest_sha256']): r for r in historical['historical_mutable_file_verifications']}
for package in {str(Path(r['path']).parent) for r in prior}:
    for line in (ROOT / package / 'SHA256SUMS').read_text().splitlines():
        digest, f = line.split('  ', 1)
        assert not Path(f).is_absolute() and '..' not in Path(f).parts
        path = ROOT / f if f.startswith(('docs/', 'lib/', 'tests/')) else ROOT / package / f
        if sha(path.read_bytes()) != digest:
            r = historical_refs[(package, f, digest)]
            blob = subprocess.check_output(['git', 'show', r['verified_historical_revision'] + ':' + f], cwd=ROOT)
            assert sha(blob) == digest, f
auth = read('authorization.json')
assert auth['baseline'] == BASE and len(auth['signatures']) == 3
for s in auth['signatures']:
    assert s['original_binding'] == registry[s['signature']]
    assert registry[s['signature']]['final_batch_id'] == 'B-051'
    for e in s['original_source_evidence']:
        assert sha((ROOT / e['artifact']).read_bytes()) == e['sha256']
subprocess.run(['node', str(OUT / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
roots = read('harness-roots.json')
assert len(roots) == 5 and {r['id'] for r in roots} == {r['id'] for r in auth['five_authorized_roots']}
for i, r in enumerate(roots):
    assert r['scope_used'] == i + 1 and r['scope_limit'] == 6
    assert r['campaign_before'] == 11 + i and r['campaign_after'] == 12 + i
    assert r['ordinary_campaign_limit'] == 12 and r['production_change'] is False
    assert r['production_semantics_values_scope_selection_document_priority_provenance_unchanged'] is True
assert read('planned-contract-updates.json')['budget_charge'] == 0
identity = read('application-identity.json')
assert identity['tested_baseline'] == BASE
for f, h in identity['application_files'].items():
    assert sha((ROOT / f).read_bytes()) == h, f
assert sha(json.dumps(identity['application_files'], sort_keys=True, separators=(',', ':')).encode()) == identity['identity_sha256']
results = read('gate-results.json')['results']
for r in results:
    data = (OUT / r['log']).read_bytes()
    assert sha(data) == r['log_sha256'] and sha(gzip.decompress(data)) == r['output_sha256']
    assert r['tested_revision'] == BASE and r['status'] == 'PASS' and r['exit_code'] == 0
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
full = [r for r in results if r['label'].startswith('full-')]
assert len(full) == len(manifest) == 147 and sorted(r['command'][-1] for r in full) == manifest
assert all(r['tap']['pass'] == r['tap']['tests'] and r['tap']['fail'] == r['tap']['skipped'] == r['tap']['cancelled'] == 0 for r in full)
rem = read('remediation-manifest.json')
assert rem == [f for f in manifest if 'remediation' in Path(f).name or Path(f).name == 'b043-status-parser.test.mjs']
assert len(rem) == 49
summary = read('validation-summary.json')
for name, selected in [('fullsuite', full), ('remediation', [r for r in full if r['command'][-1] in rem])]:
    assert summary[name]['files'] == len(selected)
    assert summary[name]['tests'] == summary[name]['pass'] == sum(r['tap']['tests'] for r in selected)
for label in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']:
    r = next(r for r in results if r['label'] == label)
    assert r['status'] == 'PASS' and r['exit_code'] == 0
    if label == 'eslint':
        assert r['errors'] == 0 and r['warnings'] == 26
    if label == 'http-pdf-runtime':
        assert r['runtime']['result'] == 'PASS' and len(r['runtime']['checks']) == 22
receipts = [json.loads(f.read_text()) for f in OUT.glob('receipt-*.json')]
assert len(receipts) == 3 and {r['signature'] for r in receipts} == {s['signature'] for s in auth['signatures']}
for r in receipts:
    s = next(s for s in auth['signatures'] if s['signature'] == r['signature'])
    assert r['classification'] == 'SOURCE_BACKED_COMPLETION' and r['status'] == 'PASS'
    assert r['GAP_SF_bindings'] == [{'GAP': e['finding_id'], 'SF': e['source_fact_id'], 'product_identity': e['product_identity']} for e in s['original_source_evidence']]
    assert r['tested_baseline'] == BASE and r['candidate_identity_sha256'] == identity['identity_sha256']
    assert r['global_resolved_open'] == 'UNKNOWN' and r['P2_credit'] == 0 and r['historical_closure_reconstructed'] is False
checkpoint = read('checkpoint.json')
assert checkpoint['documented_campaign_count'] == 34
assert set(checkpoint['documented_campaign_signatures']) == set(old['documented_campaign_signatures']) | {r['signature'] for r in receipts}
assert checkpoint['global_resolved_open'] == 'UNKNOWN' and checkpoint['historical_only'] == old['historical_only']
assert checkpoint['historical_DEFER_SAFE_signatures'] == old['historical_DEFER_SAFE_signatures']
assert checkpoint['holds_unchanged'] == old['holds_unchanged']
assert checkpoint['HARNESS_AUTONOMY_V1']['used'] == 16 and checkpoint['HARNESS_AUTONOMY_V1']['scope_used'] == 5
partition = read('b051-partition.json')
sets = [set(partition[k]) for k in ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']]
assert [len(s) for s in sets] == [8, 27, 2, 2]
assert sum(map(len, sets)) == len(set.union(*sets)) == 39
preflight = json.loads((ROOT / 'docs/audit/checkpoints/rv02-b071-b051-f829dd3/b051-preflight.json').read_text())
assert set.union(*sets) == set(preflight['exact_signatures'])
for file in [OUT / 'README.md', OUT / 'authorization.md', ROOT / 'docs/development-agent/current-project-status.md', ROOT / 'docs/development-agent/start.md']:
    for url in re.findall(r'\]\(([^)]+)\)', file.read_text()):
        if '://' not in url and not url.startswith('#'):
            assert (file.parent / url.split('#')[0]).exists(), (file, url)
listed = []
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    digest, f = line.split('  ', 1)
    assert sha((ROOT / f).read_bytes()) == digest, f
    listed.append(f)
expected = read('publish-files.json')
assert set(expected) == set(listed) | {str((OUT / 'SHA256SUMS').relative_to(ROOT))}
assert len(expected) == len(set(expected))
assert all(f.startswith(str(OUT.relative_to(ROOT)) + '/') or f in resume['prior_package_files'] or f in auth['allowed_project_files'] for f in expected)
print('B051 garden COMPLETE integrity PASS: 3 receipts, 34 unique documented; 317 components/4156 facts and prior31 receipts preserved; global UNKNOWN')
