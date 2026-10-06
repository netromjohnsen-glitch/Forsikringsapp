#!/usr/bin/env python3
"""Read-only current B050 rehabilitation completion and preserved historical evidence."""
import csv
import gzip
import hashlib
import json
import subprocess
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
BASE = '25fabe1ba0d4c872a6884f15d56be64b7cc67c72'
SIG = 'c1440948744bfa17'
FILES = ['lib/boat-pet-catalog.ts', 'tests/boat-pet-catalog.test.mjs', 'tests/remediation-b-050.test.mjs']
load = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
git = lambda *args: subprocess.check_output(['git', *args], cwd=ROOT)
summary = load(OUT / 'summary.json')
assert summary['status'] == 'PASS' and summary['signatures'] == [SIG]
records = load(OUT / 'gate-results.json')['results']
latest = {r['label']: r for r in records}
manifest = load(OUT / 'test-manifest.json')
remediation = load(OUT / 'remediation-manifest.json')
full = [r for r in records if r['label'].startswith('full-')]
assert len(manifest) == len(set(manifest)) == len(full) == summary['fullsuite_files']
assert set(manifest) == {r['command'][-1] for r in full}
assert all(r['status'] == 'PASS' and r['exit_code'] == 0 and r['tap']['fail'] == 0 for r in full)
assert sum(r['tap']['tests'] for r in full) == summary['fullsuite_tests']
assert set(remediation).issubset(manifest)
assert set(remediation) == {r['command'][-1] for r in full if 'remediation' in r['command'][-1] or r['command'][-1] == 'tests/b043-status-parser.test.mjs'}
rem = [r for r in full if r['command'][-1] in remediation]
assert len(rem) == summary['remediation_files'] and sum(r['tap']['tests'] for r in rem) == summary['remediation_tests']
for label in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']:
    assert latest[label]['status'] == 'PASS' and latest[label]['exit_code'] == 0, label
assert latest['eslint']['errors'] == 0
assert latest['http-pdf-runtime']['runtime']['result'] == 'PASS'
assert len(latest['http-pdf-runtime']['runtime']['checks']) == summary['http_pdf_runtime_checks']
for r in records:
    assert sha(OUT / r['log']) == r['log_sha256'], r['label']
    assert hashlib.sha256(gzip.decompress((OUT / r['log']).read_bytes())).hexdigest() == r['output_sha256']
    if r['label'].startswith('full-') or r['label'] in ['typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']:
        assert r['candidate_identity'] == summary['tested_candidate_identity'], r['label']
prior = load(OUT / 'prior-fifteen-receipts.json')
assert len(prior) == len({r['signature'] for r in prior}) == 15
for member in prior:
    p = ROOT / member['receipt']
    assert sha(p) == member['receipt_sha256'], member['signature']
    assert p.read_bytes() == git('show', BASE + ':' + member['receipt'])
    receipt = load(p)
    assert receipt['status'] == 'PASS' and receipt['signature'] == member['signature']
registry_path = ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv'
registry = list(csv.DictReader(registry_path.open()))
assert len(registry) == len({r['signature_id'] for r in registry}) == 1589
original = {r['signature_id']: r for r in registry if r['final_batch_id'] == 'B-050'}
assert len(original) == 16
receipt = load(OUT / ('receipt-' + SIG + '.json'))
assert receipt['status'] == 'PASS' and receipt['signature'] == SIG
assert receipt['gap_ids'] == ['GAP-2893'] and receipt['sf_ids'] == ['SF-4045']
assert receipt['original_binding'] == original[SIG]
assert receipt['binding_registry_sha256'] == sha(registry_path)
assert receipt['tested_base_revision'] == BASE
assert receipt['candidate_identity'] == summary['tested_candidate_identity']
assert receipt['gate_results_sha256'] == sha(OUT / 'gate-results.json')
assert receipt['source_reverse_audit_sha256'] == sha(OUT / 'source-reverse-audit.json')
for f, digest in receipt['files_sha256'].items():
    assert sha(ROOT / f) == digest, f
assert set(receipt['files_sha256']) == set(FILES)
assert hashlib.sha256(git('diff', BASE, '--', *FILES)).hexdigest() == receipt['diff_sha256']
assert sha(ROOT / 'catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf') == receipt['sources'][0]['sha256']
audit = load(OUT / 'source-reverse-audit.json')
assert audit['status'] == 'PASS' and audit['original_rows_preserved'] == 13
assert audit['current_rows'] == 14 and audit['other_components_preserved'] == 317 and audit['metadata_unchanged']
assert audit['SC035_SR031'] == 'HELD_UNCHANGED'
campaign = load(OUT / 'campaign-signatures.json')
assert set(campaign['signatures']) == set(original) and len(campaign['signatures']) == 16
assert len({r['signature'] for r in campaign['receipts']}) == len(campaign['receipts']) == 16
for m in campaign['receipts']:
    assert sha(ROOT / m['receipt']) == m['receipt_sha256']
    previous = load(ROOT / m['receipt'])
    gap_ids = previous.get('gap_ids', previous.get('finding_ids'))
    sf_ids = previous.get('sf_ids', previous.get('source_fact_ids'))
    assert gap_ids == json.loads(original[m['signature']]['finding_ids']), m['signature']
    assert sf_ids == json.loads(original[m['signature']]['source_fact_ids']), m['signature']
cp = load(ROOT / 'docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json')
assert cp['global_current_resolved'] == cp['global_current_open'] == 'UNKNOWN'
assert cp['documented_unique_count'] == len(cp['campaign_members']) == 16
assert {m['signature'] for m in cp['campaign_members']} == set(original)
assert cp['historical_reported']['mechanical'] == '19/16' and cp['historical_reported']['semantic'] == '10/8'
assert cp['future_campaign']['used'] == 19 and cp['future_campaign']['limit'] == 12
assert cp['harness_autonomy_v1']['used'] == 4 and cp['harness_autonomy_v1']['limit'] == 12
for f,digest in cp['evidence_sha256'].items():
    assert sha(ROOT / f) == digest, f
holds = {r['signature_id'] for r in registry if r['disposition'] == 'DEFER_SAFE'}
assert len(holds) == 21 and set(cp['historical_holds']['defer_safe_signatures']) == holds
assert 'B-050 SC-035 rehabilitation' in cp['historical_holds']['other_decision_boundaries']
roots = list(csv.DictReader((OUT / 'harness-roots.csv').open()))
assert len(roots) == len({r['root_id'] for r in roots}) == 4
assert [int(r['campaign_used']) for r in roots] == [1,2,3,4]
policy = load(OUT / 'policy.json')
assert policy['scope_used'] == policy['campaign_used'] == 4 and policy['scope_limit'] == 6 and policy['campaign_limit'] == 12
assert policy['historical_campaign_used'] == 19 and policy['historical_campaign_limit'] == 12
assert policy['diagnostics_semantic_used'] == policy['diagnostics_semantic_limit'] == 2
for f in ['lib/coverage-fact-semantics.ts','lib/coverage-status.ts','lib/insurance-normalization.ts','lib/document-fact-normalization.ts','lib/catalog-enrichment.ts','lib/boat-pet-registry.ts','scripts/verify-analysis-http.mjs','docs/development-agent/workflow.md','docs/audit/checkpoints/b050-diagnostics-integrity-3c5e869/publish.py']:
    assert (ROOT / f).read_bytes() == git('show', BASE + ':' + f), f
assert not git('diff', BASE, '--', 'catalog/sources', 'docs/audit/legacy-local', '.env', 'railway.json', 'railway.toml')
for folder in [OUT, ROOT / 'docs/audit/checkpoints/development-agent-ef5b0bc']:
    for line in (folder / 'SHA256SUMS').read_text().splitlines():
        digest, name = line.split('  ',1)
        assert sha(folder / name) == digest, name
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
subprocess.run(['git','diff','--cached','--check'],cwd=ROOT,check=True)
print('PASS: current rehabilitation receipt, exact16 B050 bindings, preserved15 receipts, complete gates/checksums, autonomy4/12, historical19/12 and SC035 unchanged, globalUNKNOWN')
