#!/usr/bin/env python3
"""Documentation-only checkpoint verification; no application execution or closure."""
import csv, hashlib, json, re, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
BASE = 'ef5b0bca3b55a4883f1b74a012233a7d0082b4c9'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def load(path): return json.loads(path.read_text())
def git(*args): return subprocess.check_output(['git', *args], cwd=ROOT).decode()
def main():
    for line in (HERE/'SHA256SUMS').read_text().splitlines():
        digest, path = line.split('  ', 1)
        assert sha(ROOT/path) == digest, path
    c = load(HERE/'checkpoint.json'); inv = load(HERE/'remaining-b050.json'); plan = load(HERE/'plan.json')
    registry_path = ROOT/inv['registry']
    rows = list(csv.DictReader(registry_path.open()))
    registry = {r['signature_id']: r for r in rows}
    assert len(rows) == len(registry) == 1589 and sha(registry_path) == inv['registry_sha256']
    completed = {m['signature'] for m in c['campaign_members']}
    assert completed == {'0a6b5f6f535df685','1f56c194d413f97d','8e9d297cb0d1bd0e','3f4b9eff50404590','5839d2c13e186676','373413bc13517ff4','72170f7dfe5c91b6','8c14a1328e5080cf'}
    assert c['documented_unique_count']==len(completed)==8
    for m in c['campaign_members']:
        receipt = load(ROOT/m['receipt'])
        assert receipt['status'] == 'PASS' and receipt['signature'] == m['signature']
        assert json.loads(registry[m['signature']]['finding_ids']) == receipt['gap_ids']
        assert json.loads(registry[m['signature']]['source_fact_ids']) == receipt['sf_ids']
    remaining = {r['signature'] for r in inv['rows']}
    original = {r['signature_id'] for r in rows if r['final_batch_id']=='B-050'}
    assert len(remaining)==8 and remaining.isdisjoint(completed) and remaining|completed==original
    for r in inv['rows']:
        assert r['original_binding']==registry[r['signature']]
        e=r['original_evidence']
        assert json.loads(registry[r['signature']]['finding_ids'])==e['finding_ids']
        assert json.loads(registry[r['signature']]['source_fact_ids'])==e['source_fact_ids']
        assert sha(ROOT/e['artifact']) == e['sha256'] == r['source_hash_verified']
        assert r['authorization']=='NOT_AUTHORIZED' and r['global_current_status']=='UNKNOWN'
    planned=[s for p in plan['packets'] if p['status']=='NOT_AUTHORIZED' for s in p['signatures']]
    assert len(planned)==len(set(planned))==8 and set(planned)==remaining
    assert all(p['status'] in ['NOT_AUTHORIZED','COMPLETED_PASS'] for p in plan['packets']) and not c['authorized_packets']
    p=load(ROOT/c['future_campaign']['policy'])
    assert p['campaign_used']==c['future_campaign']['used']==6 and p['campaign_limit']==12
    assert p['scope_used']==c['future_campaign']['last_scope_used']==2 and p['scope_limit']==3
    assert p['historical_mechanical_reported']=='19/16' and p['historical_semantic_reported']=='10/8'
    assert not p['historic_20_exception']['used'] and not p['later_scope_authorized']
    roots=list(csv.DictReader((ROOT/c['future_campaign']['root_ledger']).open()))
    assert len(roots)==len({r['root_id'] for r in roots})==6
    assert c['global_current_open']==c['global_current_resolved']=='UNKNOWN'
    assert c['CATALOG_PILOT_GATE']=='REMEDIATION_REQUIRED'
    historical={r['signature_id'] for r in rows if r['disposition']=='DEFER_SAFE'}
    assert len(historical)==21 and set(c['historical_holds']['defer_safe_signatures'])==historical
    assert all(s in registry for s in c['historical_holds']['protected_signatures'])
    for path,digest in c['evidence_sha256'].items(): assert sha(ROOT/path)==digest, path
    for path,digest in c['implementation_files_sha256'].items():
        assert sha(ROOT/path)==digest, path
        if path in ['lib/coverage-fact-semantics.ts','tests/boat-pet-catalog.test.mjs']:
            assert hashlib.sha256(subprocess.check_output(['git','show',f'{BASE}:{path}'],cwd=ROOT)).hexdigest()==digest
    latest=load(ROOT/c['validation_identity']['receipt'])
    assert all(c['implementation_files_sha256'][path]==digest for path,digest in latest['candidate_files_sha256'].items())
    review=load(HERE/'source-review.json')
    for filename, reading in review['readings'].items():
        source=ROOT/'catalog/sources/boat-pet'/filename
        assert sha(source)==reading['source_sha256']
        if filename.endswith('.pdf'):
            pages=subprocess.check_output(['pdftotext','-layout',str(source),'-']).decode().split('\f')
            assert all(pages[p['pdf_page']-1]==p['text'] for p in reading['pages'])
    changed=git('diff','--name-only',BASE).splitlines()
    assert all(path=='AGENTS.md' or path in latest['candidate_files_sha256'] or path.startswith(('docs/development-agent/','docs/audit/checkpoints/development-agent-ef5b0bc/','docs/audit/checkpoints/b050-liv-completion-04534f8/')) for path in changed), changed
    baseline=git('show',f'{BASE}:AGENTS.md')
    assert (ROOT/'AGENTS.md').read_text().startswith(baseline)
    files=[ROOT/'AGENTS.md', *sorted((ROOT/'docs/development-agent').glob('*.md')), HERE/'README.md']
    for file in files:
        for target in re.findall(r'\]\(([^)]+)\)',file.read_text()):
            if target.startswith(('http:', 'https:', '#')): continue
            path=(file.parent/target.split('#')[0]).resolve()
            assert path.is_relative_to(ROOT) and path.exists(), (file,target)
    subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
    print('PASS: doc links, 1589 unique registry rows, exact 8+8 B-050 partition, source/receipt hashes, policy 6/12 and 2/3, 21 historical holds, exact Liv candidate and unchanged shared fixes; global status UNKNOWN')
if __name__=='__main__': main()
