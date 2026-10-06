#!/usr/bin/env python3
"""Verify exact current completion evidence, without substituting historical gates."""
import csv,gzip,hashlib,json,re,subprocess
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda p:json.loads(p.read_text())
for line in (OUT/'SHA256SUMS').read_text().splitlines():
 h,p=line.split('  ',1);assert sha(ROOT/p)==h,p
receipt=load(OUT/'receipt-f8bd15c89bc0dbd6.json');assert receipt['status']=='PASS'
assert receipt['signature']=='f8bd15c89bc0dbd6' and receipt['gap_ids']==['GAP-2872'] and receipt['sf_ids']==['SF-4021']
assert receipt['global_resolved_open']=='UNKNOWN' and receipt['P2_credit']==0
for p,h in receipt['candidate_files_sha256'].items():assert sha(ROOT/p)==h,p
results=load(OUT/'gate-results.json')['results'];manifest=load(OUT/'test-manifest.json')
full=[r for r in results if r['label'].startswith('final-full-')]
assert len(full)==len(manifest['all_test_files'])==145
assert {r['command'][-1] for r in full}==set(manifest['all_test_files'])
for r in results:
 assert sha(OUT/r['log'])==r['log_sha256']
 assert hashlib.sha256(gzip.decompress((OUT/r['log']).read_bytes())).hexdigest()==r['output_sha256']
for r in full+[r for r in results if r['label'] in ['final-typegen','final-typescript','final-eslint','final-production-build','final-http-pdf-runtime','final-diff-check']]:
 assert r['status']=='PASS' and r['exit_code']==0,r['label']
 assert r['candidate_identity']==receipt['tested_candidate_identity'],r['label']
 assert r['files_sha256']==receipt['candidate_files_sha256']
 assert r.get('tap',{}).get('fail',0)==0 and r.get('tap',{}).get('skipped',0)==0
assert sum(r['tap']['pass'] for r in full)==receipt['gate_summary']['fullsuite_tests']
rem=[r for r in full if r['command'][-1] in manifest['remediation_test_files']]
assert len(rem)==47 and 'tests/b043-status-parser.test.mjs' in manifest['remediation_test_files']
assert sum(r['tap']['pass'] for r in rem)==receipt['gate_summary']['remediation_tests']
assert next(r for r in results if r['label']=='final-eslint')['errors']==0
assert next(r for r in results if r['label']=='final-http-pdf-runtime')['runtime']['result']=='PASS'
policy=load(OUT/'campaign-policy.json');assert policy['scope_used']==2 and policy['campaign_used']==11 and policy['scope_limit']==3 and policy['campaign_limit']==12
roots=list(csv.DictReader((OUT/'prospective-root-ledger.csv').open()));assert len(roots)==len({r['root_id'] for r in roots})==11
for r in roots:
 p=Path(r['equivalence_evidence']);assert (ROOT/p if str(p).startswith('docs/') else OUT/p).exists()
assert policy['historical_mechanical_reported']=='19/16' and policy['historical_semantic_reported']=='10/8'
assert not policy['historic_20_exception']['used'] and not policy['later_scope_authorized']
before=load(ROOT/'docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json')
assert before['documented_unique_count']==13 and before['global_current_resolved']==before['global_current_open']=='UNKNOWN'
base=json.loads(subprocess.check_output(['git','show',receipt['tested_base_revision']+':docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json'],cwd=ROOT))
assert len(base['campaign_members'])==12
for m in base['campaign_members']:assert sha(ROOT/m['receipt'])==m['receipt_sha256']
review=load(OUT/'source-review.json')
for kind in ['website','treatment']:
 entry=review[kind];assert sha(ROOT/'catalog/sources/boat-pet'/entry['filename'])==entry['sha256']
pages=subprocess.check_output(['pdftotext','-layout',str(ROOT/'catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf'),'-']).decode().split('\f')
for p in review['treatment']['pages']:assert p['text']==pages[p['pdf_page']-1]
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
print('PASS: current final 145/47 file manifests, actual closure gate logs and candidate identity, exact one completion, 12 preserved receipts, source excerpts/hashes, policy 2/3 and 11/12, global UNKNOWN')
