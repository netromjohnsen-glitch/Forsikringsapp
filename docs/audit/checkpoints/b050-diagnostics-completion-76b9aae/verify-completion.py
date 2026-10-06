#!/usr/bin/env python3
"""Read-only current completion integrity; historical failures remain evidence."""
import csv
import hashlib
import json
import subprocess
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
load = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
BASE = '76b9aae7c49a924ec1fc7edd1d9b49eb43b485da'
expected = {'7b2587a3bbc0c772': ('GAP-2876', 'SF-4027'), 'b5792662cc2fa9f8': ('GAP-2884', 'SF-4036')}
summary = load(OUT / 'summary.json')
assert summary['status'] == 'PASS'
assert set(summary['signatures']) == set(expected)
records = load(OUT / 'gate-results.json')['results']
by_label = {r['label']: r for r in records}
full = [r for r in records if r['label'].startswith('full-')]
manifest = load(OUT / 'test-manifest.json')
rem_manifest = load(OUT / 'remediation-manifest.json')
assert len(full) == len(manifest) == summary['fullsuite_files']
assert {r['command'][-1] for r in full} == set(manifest)
assert all(r['status'] == 'PASS' and r['exit_code'] == 0 and r['tap'].get('fail', 0) == 0 for r in full)
assert sum(r['tap']['tests'] for r in full) == summary['fullsuite_tests']
rem = [r for r in full if r['command'][-1] in rem_manifest]
assert len(rem) == len(rem_manifest) == summary['remediation_files']
assert sum(r['tap']['tests'] for r in rem) == summary['remediation_tests']
required = ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check', 'single-source-recovery-provenance']
assert all(by_label[k]['status'] == 'PASS' and by_label[k]['exit_code'] == 0 for k in required)
assert by_label['eslint']['errors'] == 0
assert by_label['http-pdf-runtime']['runtime']['result'] == 'PASS'
assert len(by_label['http-pdf-runtime']['runtime']['checks']) == summary['http_pdf_runtime_checks']
for r in records:
    log = OUT / r['log']
    assert sha(log) == r['log_sha256'], r['log']
for sig, (gap, sf) in expected.items():
    r = load(OUT / ('receipt-' + sig + '.json'))
    assert r['status'] == 'PASS' and r['signature'] == sig
    assert r['gap_ids'] == [gap] and r['sf_ids'] == [sf]
    assert r['tested_base_revision'] == BASE
    assert r['candidate_identity'] == summary['tested_candidate_identity']
    assert r['gate_results_sha256'] == sha(OUT / 'gate-results.json')
    assert r['source_reverse_audit_sha256'] == sha(OUT / 'final-source-reverse-audit.json')
    for f, digest in r['files_sha256'].items():
        assert sha(ROOT / f) == digest, f
    diff = subprocess.check_output(['git', 'diff', BASE, '--', *r['files_sha256']], cwd=ROOT)
    assert hashlib.sha256(diff).hexdigest() == r['diff_sha256']
    for source in r['sources']:
        assert sha(ROOT / 'catalog/sources/boat-pet' / source['filename']) == source['sha256']
cp = load(ROOT / 'docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json')
assert cp['global_current_resolved'] == cp['global_current_open'] == 'UNKNOWN'
assert len(cp['campaign_members']) == len({r['signature'] for r in cp['campaign_members']}) == cp['documented_unique_count'] == 15
for member in cp['campaign_members']:
    assert sha(ROOT / member['receipt']) == member['receipt_sha256'], member['signature']
prior = load(OUT / 'campaign-signatures.json')['prior_thirteen_receipt_hashes']
assert len(prior) == 13
for f, digest in prior.items():
    assert sha(ROOT / f) == digest
    assert (ROOT / f).read_bytes() == subprocess.check_output(['git', 'show', BASE + ':' + f], cwd=ROOT)
for f, digest in cp['evidence_sha256'].items():
    assert sha(ROOT / f) == digest, f
ledger = list(csv.DictReader((OUT / 'prospective-root-ledger.csv').open()))
assert len(ledger) == len({r['root_id'] for r in ledger}) == 19
assert int(ledger[-1]['used_campaign_count']) == cp['future_campaign']['used'] == 19
policy = load(OUT / 'campaign-policy.json')
assert policy['campaign_used'] == 19 and policy['campaign_limit'] == 12
assert policy['semantic_scope_used'] == policy['semantic_scope_limit'] == 2
assert cp['historical_reported']['mechanical'] == '19/16'
assert cp['historical_reported']['semantic'] == '10/8'
assert not cp['historical_reported']['fully_reconstructed']
for f in ['lib/coverage-fact-semantics.ts', 'scripts/verify-analysis-http.mjs']:
    assert (ROOT / f).read_bytes() == subprocess.check_output(['git', 'show', BASE + ':' + f], cwd=ROOT)
for line in (OUT / 'SHA256SUMS').read_text().splitlines():
    digest, name = line.split('  ', 1)
    assert sha(OUT / name) == digest, name
assert not subprocess.check_output(['git', 'diff', BASE, '--', 'catalog/sources', '.env', 'railway.json', 'railway.toml', 'docs/audit/legacy-local'], cwd=ROOT)
subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
print('PASS: two completion receipts, exact15 campaign signatures, prior13 unchanged,19 unique roots, source/log/checksum/candidate integrity and diff gates')
