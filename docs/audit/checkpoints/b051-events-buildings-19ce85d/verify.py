#!/usr/bin/env python3
"""Integrity of the stopped candidate, never a PASS-closure or publishing gate."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
read = lambda n: json.loads((OUT / n).read_text())
sha = lambda b: hashlib.sha256(b).hexdigest()
auth = read('authorization.json')
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip() == auth['baseline_revision']
assert not subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=ROOT)
registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
for s in auth['signatures']:
    assert s['original_binding'] == registry[s['signature']]
    for e in s['original_source_evidence']:
        assert sha((ROOT / e['artifact']).read_bytes()) == e['sha256']
assert len(auth['signatures']) == 5 and sum(len(s['original_source_evidence']) for s in auth['signatures']) == 9
prior = read('prior-receipts.json')
assert len(prior) == len({r['signature'] for r in prior}) == 34
for r in prior:
    assert sha((ROOT / r['path']).read_bytes()) == r['sha256'], r['path']
for path, h in read('historical-artifact-hashes.json').items():
    assert sha((ROOT / path).read_bytes()) == h, path
identity = read('candidate-identity.json')
for path, h in identity['candidate_files'].items():
    assert sha((ROOT / path).read_bytes()) == h, path
for path, h in identity['production_functions_unchanged'].items():
    assert sha((ROOT / path).read_bytes()) == h
    assert sha(subprocess.check_output(['git', 'show', auth['baseline_revision'] + ':' + path], cwd=ROOT)) == h
r = read('gate-results.json')['results']
for g in r:
    b = (OUT / g['log']).read_bytes()
    assert sha(b) == g['log_sha256'] and sha(gzip.decompress(b)) == g['output_sha256']
    assert g['tested_revision'] == auth['baseline_revision']
full = [g for g in r if g['label'].startswith('full-')]
manifest = read('test-manifest.json')
assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
assert len(full) == len(manifest) == 148
assert sorted(g['command'][-1] for g in full) == manifest
assert [g['label'] for g in full if g['status'] != 'PASS'] == ['full-remediation-b-051-events-buildings.test']
summary = read('validation-summary.json')
rem = read('remediation-manifest.json')
assert len(rem) == 50 and rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
for label, selected in [('fullsuite', full), ('remediation', [g for g in full if g['command'][-1] in rem])]:
    assert summary[label]['files'] == len(selected)
    for field in ['tests', 'pass', 'fail', 'skipped', 'cancelled']:
        assert summary[label][field] == sum(g['tap'].get(field, 0) for g in selected)
assert summary['completion_receipts_created'] == 0
assert not list(OUT.glob('receipt-*.json'))
assert read('checkpoint.json')['HARNESS_AUTONOMY_V1']['used'] == 16
assert read('planned-contract-updates.json')['charge'] == 0
assert all(not r['corrected'] and r['budget_consumed'] == 0 for r in read('blocker.json')['roots'])
subprocess.run(['node', str(OUT / 'catalog-audit.mjs')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    h, path = line.split('  ', 1)
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    assert sha((ROOT / path).read_bytes()) == h, path
for target in re.findall(r'\]\(([^)]+)\)', (OUT / 'README.md').read_text()):
    assert (OUT / target).exists(), target
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('STOPPED candidate integrity PASS; 34 old receipts unchanged; five pending, zero closure; budget16/12; global UNKNOWN')
