#!/usr/bin/env python3
"""Verify the current five-signature completion and immutable prior evidence."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = '19ce85d5b762612e6ecfeb972b4b82c7832f69b7'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda n: json.loads((OUT / n).read_text())
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
old = json.loads((ROOT / 'docs/audit/checkpoints/b051-garden-completion-64dd3cb/checkpoint.json').read_text())
assert old['documented_campaign_count'] == 34 and old['HARNESS_AUTONOMY_V1']['used'] == 16
prior = read('prior-receipts.json')
assert len(prior) == len({r['signature'] for r in prior}) == 34
assert {r['signature'] for r in prior} == set(old['documented_campaign_signatures'])
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256'], r['path']
for path, digest in read('historical-artifact-hashes.json').items():
    assert sha((ROOT / path).read_bytes()) == digest, path
resume = read('resume-input-integrity.json')
assert resume['head'] == resume['remote_main'] == BASE and resume['staged'] == 0
for path, digest in resume['stopped_package_files'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
for path, digest in resume['candidate']['candidate_files'].items():
    if path == 'tests/remediation-b-051-events-buildings.test.mjs':
        assert sha(gzip.decompress((OUT / 'before-test-corrections.test.mjs.gz').read_bytes())) == digest
    else:
        assert sha((ROOT / path).read_bytes()) == digest, path
proof = read('historical-checksum-proof.json')
assert proof['status'] == 'PASS' and proof['prior_receipt_count'] == 34
for r in proof['historical_mutable_file_verifications']:
    if 'verified_historical_revision' in r:
        blob = subprocess.check_output(['git', 'show', r['verified_historical_revision'] + ':' + r['file']], cwd=ROOT)
    else:
        blob = gzip.decompress((ROOT / r['verified_original_candidate_snapshot']).read_bytes())
    assert sha(blob) == r['manifest_sha256'], r['file']
auth = read('authorization.json')
assert auth['baseline_revision'] == BASE and len(auth['original_signatures']) == 5
sigs = {s['signature'] for s in auth['original_signatures']}
assert sigs == {'49adf65854171146', '416dfaab0492ce1b', 'bb47646cd8b17f20', '86992ec620da2894', '7ba0298883905c58'}
assert sum(len(s['original_source_evidence']) for s in auth['original_signatures']) == 9
for s in auth['original_signatures']:
    assert s['original_binding'] == registry[s['signature']]
    assert registry[s['signature']]['final_batch_id'] == 'B-051'
    for e in s['original_source_evidence']:
        assert sha((ROOT / e['artifact']).read_bytes()) == e['sha256']
subprocess.run(['node', str(OUT / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
delta = read('catalog-delta.json')
assert delta['status'] == 'PASS' and len(delta['changes']) == 6
assert delta['entirely_unchanged_components'] == 316 and delta['protected_raw_facts'] == 4152
roots = read('harness-roots.json')
assert len(roots) == 2 and {r['id'] for r in roots} == set(auth['authorized_corrections'])
for i, r in enumerate(roots):
    assert r['corrected'] is True and r['production_unchanged'] is True
    assert r['campaign_before'] == 16 + i and r['campaign_after'] == 17 + i
    assert r['ordinary_limit'] == 12 and r['scope_used'] == i + 1 and r['scope_limit'] == 6
    assert r['values_scope_selection_document_priority_provenance_unchanged'] is True
identity = read('application-identity.json')
assert identity['tested_baseline'] == BASE
for path, digest in identity['application_files'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
assert sha(json.dumps(identity['application_files'], sort_keys=True, separators=(',', ':')).encode()) == identity['identity_sha256']
results = read('gate-results.json')['results']
for r in results:
    blob = (OUT / r['log']).read_bytes()
    assert sha(blob) == r['log_sha256'] and sha(gzip.decompress(blob)) == r['output_sha256']
    assert r['tested_revision'] == BASE and r['status'] == 'PASS' and r['exit_code'] == 0
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
full = [r for r in results if r['label'].startswith('full-')]
assert len(full) == len(manifest) == 148
assert sorted(r['command'][-1] for r in full) == manifest
assert all(r['tap']['pass'] == r['tap']['tests'] and r['tap']['fail'] == r['tap']['skipped'] == r['tap']['cancelled'] == 0 for r in full)
rem = read('remediation-manifest.json')
assert len(rem) == 50 and rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
summary = read('validation-summary.json')
for name, selected in [('fullsuite', full), ('remediation', [r for r in full if r['command'][-1] in rem])]:
    assert summary[name]['files'] == len(selected)
    assert summary[name]['tests'] == summary[name]['pass'] == sum(r['tap']['tests'] for r in selected)
for label in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']:
    r = next(r for r in results if r['label'] == label)
    assert r['status'] == 'PASS' and r['exit_code'] == 0
    if label == 'eslint':
        assert r['errors'] == 0
    if label == 'http-pdf-runtime':
        assert r['runtime']['result'] == 'PASS'
receipts = list(OUT.glob('receipt-*.json'))
assert len(receipts) == 5
for path in receipts:
    r = json.loads(path.read_text())
    assert r['status'] == 'PASS' and r['signature'] in sigs
    s = next(s for s in auth['original_signatures'] if s['signature'] == r['signature'])
    assert r['GAP_SF_bindings'] == [{'GAP': e['finding_id'], 'SF': e['source_fact_id'], 'product_identity': e['product_identity']} for e in s['original_source_evidence']]
    assert r['tested_baseline'] == BASE and r['candidate_identity_sha256'] == identity['identity_sha256']
    assert r['global_resolved_open'] == 'UNKNOWN' and r['P2_credit'] == 0
cp = read('checkpoint.json')
assert cp['documented_campaign_count'] == 39
assert len(set(cp['documented_campaign_signatures'])) == 39
assert set(cp['documented_campaign_signatures']) == {r['signature'] for r in prior} | sigs
assert cp['holds_unchanged'] == old['holds_unchanged']
assert cp['historical_only'] == old['historical_only']
assert cp['historical_DEFER_SAFE_signatures'] == old['historical_DEFER_SAFE_signatures']
assert cp['global_resolved_open'] == 'UNKNOWN' and cp['HARNESS_AUTONOMY_V1']['used'] == 18
partition = read('b051-partition.json')
assert set(partition['exact_original_signatures']) == {k for k, r in registry.items() if r['final_batch_id'] == 'B-051'}
parts = [partition[k] for k in ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']]
assert [len(p) for p in parts] == [13, 22, 2, 2]
assert len(set(x for p in parts for x in p)) == 39
assert set(partition['completed_current_receipts']) == set(old['current_B051_completed_signatures']) | sigs
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    assert sha((ROOT / path).read_bytes()) == digest, path
for path in [OUT / 'README.md', ROOT / 'docs/development-agent/current-project-status.md', ROOT / 'docs/development-agent/start.md']:
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if not target.startswith(('http:', 'https:', '#')):
            assert (path.parent / target.split('#')[0]).exists(), (path, target)
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('B051 events COMPLETE integrity PASS: five receipts, 39 exact documented; prior34 unchanged; budget18/12 scope2/6; global UNKNOWN')
