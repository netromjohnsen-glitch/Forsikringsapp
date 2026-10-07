#!/usr/bin/env python3
"""Integrity of a stopped candidate; this never grants closure/publication."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = '0cedd98cc3ae1e885902aba585ef65054985c5e5'
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda n: json.loads((OUT / n).read_text())
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip() == BASE
assert not subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=ROOT)
auth = read('authorization.json')
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
assert {s['signature'] for s in auth['signatures']} == {
    '46e94bcf464af845', '2113807ceb290224', 'af150eab853a1648', '239b00779349f2fd', '57c775ac935fb504'}
for s in auth['signatures']:
    assert s['original_binding'] == registry[s['signature']]
    assert s['original_binding']['root_cause_id'] == '["RC-027"]'
    assert len(s['original_source_evidence']) == 1
for path, digest in auth['source_hashes'].items():
    assert sha((ROOT / path).read_bytes()) == digest
prior = read('prior-receipts.json')
assert len(prior) == len({r['signature'] for r in prior}) == 39
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256'], r['path']
    receipt = json.loads((ROOT / r['path']).read_text())
    assert receipt['signature'] == r['signature'] and receipt['status'] == 'PASS'
for path, digest in read('historical-artifact-hashes.json').items():
    assert sha((ROOT / path).read_bytes()) == digest, path
identity = read('application-identity.json')
for path, digest in identity['application_files'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
assert sha(json.dumps(identity['application_files'], sort_keys=True, separators=(',', ':')).encode()) == identity['identity_sha256']
assert sha(subprocess.check_output(['git', 'diff', '--binary'], cwd=ROOT)) == read('candidate-diff.json')['tracked_diff_sha256']
changed = subprocess.check_output(['git', 'diff', '--name-only'], cwd=ROOT).decode().splitlines()
assert set(changed).issubset(auth['approved_files'])
subprocess.run(['node', str(OUT / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
proof = read('representation-blocker-proof.json')
for name in ['events_effective_json_differences', 'B050_json_row_differences']:
    assert len(proof[name]) == 1
    d = proof[name][0]
    assert d['path'].endswith('.qualificationSource.productCode')
    assert d['actual_has'] is False and d['expected_has'] is True and d['expected_is_undefined'] is True
assert proof['correction_performed'] is False
results = read('gate-results.json')['results']
for r in results:
    blob = (OUT / r['log']).read_bytes()
    assert sha(blob) == r['log_sha256'] and sha(gzip.decompress(blob)) == r['output_sha256']
    assert r['tested_revision'] == BASE
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
full = [r for r in results if r['label'].startswith('full-')]
assert len(full) == len(manifest) == 149
assert sorted(r['command'][-1] for r in full) == manifest
assert all(r['tap']['cancelled'] == r['tap']['skipped'] == 0 for r in full)
assert sum(r['tap']['fail'] for r in full) == 4
assert {r['command'][-1] for r in full if r['status'] == 'FAIL'} == {
    'tests/remediation-b-050.test.mjs', 'tests/remediation-b-051-events-buildings.test.mjs'}
rem = read('remediation-manifest.json')
assert rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
summary = read('validation-summary.json')
for name, selected in [('fullsuite', full), ('remediation', [r for r in full if r['command'][-1] in rem])]:
    assert summary[name]['files'] == len(selected)
    for metric in ['tests', 'pass', 'fail', 'skipped', 'cancelled']:
        assert summary[name][metric] == sum(r['tap'][metric] for r in selected)
assert summary['status'] == 'BLOCKED_NOT_COMPLETE' and summary['targeted']['pass'] == 93
assert next(r for r in full if r['command'][-1] == 'tests/supporting-terms.test.mjs')['tap']['pass'] == 45
roots = read('harness-roots.json')
assert len(roots) == 1 and roots[0]['campaign_before'] == 18 and roots[0]['campaign_after'] == 19
assert roots[0]['corrected'] is True and roots[0]['ordinary_limit'] == 12
cp = read('checkpoint.json')
assert cp['documented_campaign_count'] == len(set(cp['documented_campaign_signatures'])) == 39
assert set(cp['documented_campaign_signatures']) == {r['signature'] for r in prior}
old = json.loads((ROOT / 'docs/audit/checkpoints/b051-events-completion-19ce85d/checkpoint.json').read_text())
for field in ['historical_only', 'holds_unchanged', 'historical_DEFER_SAFE_signatures', 'current_B051_completed_signatures']:
    assert cp[field] == old[field]
assert cp['HARNESS_AUTONOMY_V1']['used'] == 19 and cp['global_resolved_open'] == 'UNKNOWN'
assert cp['publication_allowed'] is False and cp['new_completion_receipts'] == []
assert not list(OUT.glob('receipt-*.json'))
assert read('blocker.json')['correction_performed'] is False
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    assert sha((ROOT / path).read_bytes()) == digest, path
for path in [OUT / 'README.md', OUT / 'harness-correction-proof.md']:
    assert b'\r' not in path.read_bytes()
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if not target.startswith(('http:', 'https:', '#')):
            assert (path.parent / target.split('#')[0]).exists()
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('Stopped-candidate integrity PASS; closure/publication BLOCKED;39 prior receipts unchanged; budget19/12 scope1/6; global UNKNOWN')
