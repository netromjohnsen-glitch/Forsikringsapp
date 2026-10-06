#!/usr/bin/env python3
"""Read-only integrity checks for this PARTIAL checkpoint; never grants closure."""
import csv
import gzip
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
def sha(data):
    return hashlib.sha256(data).hexdigest()
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def main():
    checkpoint = json.loads((HERE / 'checkpoint.json').read_text())
    assert checkpoint['status'] == 'PARTIAL_RECOVERY — NOT_AUTHORITATIVE_EXECUTION_LEDGER'
    assert checkpoint['fresh_current_resolved_set'] is None
    subprocess.run(['git', 'merge-base', '--is-ancestor', checkpoint['revision'], 'HEAD'], cwd=ROOT, check=True)
    assert not git('diff', checkpoint['revision'], 'HEAD', '--', '.', ':!docs/audit/checkpoints/g2-recovery-36d7694').strip(), 'Only recovery documentation may advance this checkpoint'
    assert not git('diff', '--cached', '--name-only').strip(), 'Staged files must remain empty'
    registry = list(csv.DictReader((ROOT / checkpoint['registry']).open()))
    by_id = {row['signature_id']: row for row in registry}
    assert len(registry) == len(by_id) == 1589
    ledger = list(csv.DictReader((HERE / 'partial-ledger.csv').open()))
    assert len(ledger) == len({r['signature_id'] for r in ledger}) == 1589
    archived = set(checkpoint['historical_baseline']['resolved_signatures'])
    historical_holds = {r['signature_id'] for r in registry if r['disposition'] == 'DEFER_SAFE'}
    assert len(archived) == 22 and len(historical_holds) == 21
    assert not archived & historical_holds
    for row in ledger:
        original = by_id[row['signature_id']]
        for field in ['finding_ids', 'source_fact_ids', 'products', 'final_batch_id']:
            assert row[field] == original[field]
        assert row['current_execution_status'] == 'NOT_RECOVERED'
        assert (row['historical_resolved'] == 'true') == (row['signature_id'] in archived)
        assert (row['historical_defer_safe'] == 'true') == (row['signature_id'] in historical_holds)
    for path, expected in checkpoint['preserved_candidate']['sha256'].items():
        assert sha((ROOT / path).read_bytes()) == expected, 'Candidate changed: ' + path
    assert sha(git('diff', '--binary', '--', *checkpoint['preserved_candidate']['sha256'])) == checkpoint['preserved_candidate']['diff_sha256']
    original_dirty = set(git('diff', '--name-only').decode().splitlines())
    assert original_dirty == set(checkpoint['preserved_candidate']['sha256']), 'Unexpected tracked changes'
    for entry in json.loads((HERE / 'evidence-manifest.json').read_text())['files']:
        data = git('show', entry['git_revision'] + ':' + entry['path']) if entry.get('git_revision') else (ROOT / entry['path']).read_bytes()
        assert sha(data) == entry['sha256'], 'Evidence mismatch: ' + entry['path']
    count = 0
    for entry in csv.DictReader((ROOT / 'docs/audit/legacy-local/MANIFEST.csv').open()):
        data = (ROOT / entry['repo_archive_path']).read_bytes()
        assert len(data) == int(entry['archive_bytes'])
        assert sha(data) == entry['archive_sha256']
        raw = gzip.decompress(data) if entry['repo_archive_path'].endswith('.gz') else data
        assert len(raw) == int(entry['original_bytes'])
        assert sha(raw) == entry['original_sha256']
        count += 1
    matrix = list(csv.DictReader((HERE / 'evidence-matrix.csv').open()))
    assert len(matrix) == len({r['signature_id'] for r in matrix}) == 1589
    from collections import Counter
    categories = Counter(r['evidence_category'] for r in matrix)
    summary = json.loads((HERE / 'matrix-summary.json').read_text())
    assert dict(categories) == summary['category_counts']
    assert summary['complete_current_closure_receipts'] == 0
    for row in matrix:
        assert row['current_execution_status'] == 'NOT_RECOVERED'
        for field in ['finding_ids', 'source_fact_ids', 'final_batch_id']:
            assert row[field] == by_id[row['signature_id']][field]
    packets = json.loads((HERE / 'revalidation-packets.json').read_text())
    assert packets['status'] == 'PROPOSAL_NOT_EXECUTED'
    for group in packets['groups']:
        assert len(group['signatures']) == len(set(group['signatures']))
        assert all(s in by_id for s in group['signatures'])
    assert set(packets['groups'][0]['signatures']) == set(checkpoint['conversation_checkpoint']['b050_resolved'])
    assert checkpoint['preserved_candidate']['scope_signature'] not in packets['groups'][0]['signatures']
    assert checkpoint['reported_budget']['manual_exception']['used'] is False
    assert checkpoint['reported_budget']['mechanical_used'] == 19
    assert checkpoint['reported_budget']['semantic_used'] == 10
    subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
    print(json.dumps({'status': 'PASS_PARTIAL_CHECKPOINT_INTEGRITY_ONLY', 'registry_unique': len(by_id),
        'historical_resolved': len(archived), 'historical_holds': len(historical_holds),
        'archive_entries_verified': count, 'candidate_unchanged': True, 'staged': 0,
        'current_execution_accounting': 'NOT_RECOVERED', 'application_gates': 'NOT_RUN'}, indent=2))

if __name__ == '__main__':
    main()
