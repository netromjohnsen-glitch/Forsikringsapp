#!/usr/bin/env python3
"""Integrity check of a preserved blocked candidate; never a closure gate."""
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


def read(name):
    return json.loads((OUT / name).read_text())


def sha(data):
    return hashlib.sha256(data).hexdigest()


assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip() == BASE
assert not subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=ROOT)
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
auth = read('authorization.json')
expected = {'403c9b3f0e9aa19f': [('GAP-2082', 'SF-2985'), ('GAP-2136', 'SF-3069')],
            '6ceaaaf84f1dc597': [('GAP-2095', 'SF-3004'), ('GAP-2150', 'SF-3087')],
            'a7561c0d03ede572': [('GAP-2083', 'SF-2986'), ('GAP-2137', 'SF-3070')]}
assert auth['baseline'] == BASE
assert {s['signature'] for s in auth['signatures']} == set(expected)
for s in auth['signatures']:
    assert s['original_binding'] == registry[s['signature']]
    assert s['original_binding']['final_batch_id'] == 'B-051'
    assert [(e['finding_id'], e['source_fact_id']) for e in s['original_source_evidence']] == expected[s['signature']]
    for e in s['original_source_evidence']:
        assert sha((ROOT / e['artifact']).read_bytes()) == e['sha256']
        assert json.loads(e['product_identity'])[2] == 'ordinary'
for f, h in read('historical-artifact-hashes.json').items():
    assert sha((ROOT / f).read_bytes()) == h, f
prior = read('prior-receipts.json')
assert len(prior) == len({r['signature'] for r in prior}) == 31
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256'], r['path']
old = json.loads((ROOT / 'docs/audit/checkpoints/b051-rental-loss-use-5718a5f/checkpoint.json').read_text())
checkpoint = read('checkpoint.json')
assert set(checkpoint['documented_campaign_signatures']) == set(old['documented_campaign_signatures']) == {r['signature'] for r in prior}
assert checkpoint['documented_campaign_count'] == 31 and checkpoint['global_resolved_open'] == 'UNKNOWN'
for field in ['historical_only', 'holds_unchanged', 'historical_DEFER_SAFE_signatures', 'current_B051_completed_signatures']:
    assert checkpoint[field] == old[field], field
assert not list(OUT.glob('receipt-*.json'))
assert read('harness-roots.json') == []
assert checkpoint['HARNESS_AUTONOMY_V1']['used'] == 11 and checkpoint['HARNESS_AUTONOMY_V1']['scope_used'] == 0
assert read('blocker.json')['root_count'] == 5 and read('blocker.json')['roots_corrected'] == 0
assert read('planned-contract-updates.json')['budget_charge'] == 0
identity = read('preserved-candidate-identity.json')
for f, h in identity['files'].items():
    assert sha((ROOT / f).read_bytes()) == h, f
assert set(subprocess.check_output(['git', 'diff', '--name-only'], cwd=ROOT).decode().splitlines()) == set(identity['changed_tracked_files'])
assert set(identity['files']) <= set(auth['allowed_project_files'])
subprocess.run(['node', str(OUT / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
results = read('gate-results.json')['results']
for r in results:
    data = (OUT / r['log']).read_bytes()
    assert sha(data) == r['log_sha256'] and sha(gzip.decompress(data)) == r['output_sha256']
    assert r['tested_revision'] == BASE
    if r['status'] != 'PASS':
        assert r['command'][-1] == 'tests/remediation-b-051-garden.test.mjs'
        assert r['tap'] == {'tests': 23, 'pass': 9, 'fail': 14, 'cancelled': 0, 'skipped': 0}
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
full = [r for r in results if r['label'].startswith('full-')]
assert len(full) == len(manifest) == 147
assert sorted(r['command'][-1] for r in full) == manifest
rem = read('remediation-manifest.json')
assert rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
summary = read('validation-summary.json')
for group, selected in [('fullsuite', full), ('remediation', [r for r in full if r['command'][-1] in rem])]:
    assert summary[group]['tests'] == sum(r['tap']['tests'] for r in selected)
    assert summary[group]['pass'] == sum(r['tap']['pass'] for r in selected)
    assert summary[group]['fail'] == sum(r['tap']['fail'] for r in selected) == 14
assert summary['ESLint'] == {'errors': 0, 'warnings': 26, 'baseline_warnings': 26, 'new_warnings': 0}
for f in OUT.glob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)', f.read_text()):
        if '://' not in link and not link.startswith('#'):
            assert (f.parent / link.split('#')[0]).exists(), (f, link)
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    h, f = line.split('  ', 1)
    assert sha((ROOT / f).read_bytes()) == h, f
print('PARTIAL/BLOCKED integrity PASS;31priorreceipts unchanged,3unclosed signatures;0corrections;no publication authority after failed gates')
