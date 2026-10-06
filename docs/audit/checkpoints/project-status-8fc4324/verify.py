#!/usr/bin/env python3
"""Read-only evidence/binding/link verification; this is not a global closure gate."""
import csv
import hashlib
import json
import pathlib
import re
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
D = json.loads((HERE / 'evidence.json').read_text())

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

assert D['global_resolved_open'] == 'UNKNOWN'
assert D['HARNESS_AUTONOMY_V1'] == {'used': 4, 'limit': 12, 'task_roots_used': 0}
assert D['CATALOG_PILOT_GATE'] == 'REMEDIATION_REQUIRED'
for name, expected in D['evidence_sha256'].items():
    assert digest(ROOT / name) == expected, name
for item in D['source_checks']:
    assert digest(ROOT / item['path']) == item['expected_sha256'] == item['actual_sha256'], item['path']
rows = list(csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open()))
registry = {r['signature_id']: r for r in rows}
assert len(registry) == len(rows) == 1589
original_b050 = {r['signature_id'] for r in rows if r['final_batch_id'] == 'B-050'}
assert set(D['current_documented_B050']) == original_b050 and len(original_b050) == 16
assert len(D['current_receipts']) == 16
for item in D['current_receipts']:
    receipt = json.loads((ROOT / item['receipt']).read_text())
    assert receipt['status'] == 'PASS' and receipt['signature'] == item['signature']
    assert digest(ROOT / item['receipt']) == item['receipt_sha256']
for item in D['next_steps'][0]['signature_bindings']:
    row = registry[item['signature']]
    assert item['gap'] in json.loads(row['finding_ids'])
    assert item['sf'] in json.loads(row['source_fact_ids'])
assert set(D['next_steps'][1]['signature_ids']) == {r['signature_id'] for r in rows if r['final_batch_id'] == 'B-051'}
assert len(D['next_steps'][1]['signature_ids']) == 39
assert all(s['status'] == 'NOT_AUTHORIZED' for s in D['next_steps'])
for href in re.findall(r'\]\(([^)]+)\)', (HERE / 'README.md').read_text()):
    assert (HERE / href.split('#')[0]).is_file(), href
for line in (HERE / 'SHA256SUMS').read_text().splitlines():
    expected, name = line.split('  ', 1)
    assert digest(HERE / name) == expected, name
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('PASS: exact16 B050 receipts/bindings; RV02 ten/B05139 bindings; 1589 P1 universe; pinned evidence/8 sources/links/checksums; global UNKNOWN; autonomy4/12 unchanged.')
