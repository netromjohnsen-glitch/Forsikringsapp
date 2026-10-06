#!/usr/bin/env python3
"""Receipt integrity, current candidate identity and exact complete gate denominator."""
import csv,gzip,hashlib,json,re,subprocess
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda p:json.loads(Path(p).read_text())
for line in (OUT/'SHA256SUMS').read_text().splitlines():
 digest,path=line.split('  ',1);assert sha((ROOT/path).read_bytes())==digest,path
ident=load(OUT/'candidate-identity.json')
for f,h in ident['files_sha256'].items():assert sha((ROOT/f).read_bytes())==h,f
# After publication use Git history to locate the application commit; receipts
# retain the tested base and exact file content, without self-referential SHA claims.
assert subprocess.run(['git','merge-base','--is-ancestor',ident['tested_base_revision'],'HEAD'],cwd=ROOT).returncode==0
manifest=load(OUT/'test-manifest.json');actual=sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
assert actual==manifest['all_test_files'] and len(actual)==145
expected=[f for f in actual if re.search(r'/(?:nito-remediation|remediation)-',f) or f=='tests/b043-status-parser.test.mjs']
assert expected==manifest['remediation_test_files'] and len(expected)==47
results=load(OUT/'gate-results.json')['results'];full=[r for r in results if r['label'].startswith('full-')]
assert len(full)==145 and sorted(r['command'][-1] for r in full)==actual
for r in results:
 assert sha((OUT/r['log']).read_bytes())==r['log_sha256'],r['label']
 assert sha(gzip.decompress((OUT/r['log']).read_bytes()))==r['output_sha256'],r['label']
for r in full:
 assert r['status']=='PASS' and r['exit_code']==0 and r['tap']['fail']==0
 assert r['candidate_identity']==ident['candidate_identity'] and r['files_sha256']==ident['files_sha256']
assert sum(r['tap']['pass'] for r in full)==3919
assert sum(r['tap']['pass'] for r in full if r['command'][-1] in expected)==1775
for label in ['typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check','source-reverse-audit']:
 r=next(r for r in results if r['label']==label);assert r['status']=='PASS' and r['candidate_identity']==ident['candidate_identity']
assert next(r for r in results if r['label']=='eslint')['errors']==0
assert len(next(r for r in results if r['label']=='http-pdf-runtime')['runtime']['checks'])==22
scope=load(OUT/'authorization.json')['scope'];members=load(OUT/'campaign-signature-set.json')['members'];assert len(members)==len({m['signature'] for m in members})==12
for sig,(gap,sf) in scope.items():
 r=load(OUT/f'receipt-{sig}.json');assert r['status']=='PASS' and r['signature']==sig
 assert r['gap_ids']==[gap] and r['sf_ids']==[sf] and r['candidate_files_sha256']==ident['files_sha256']
 assert r['gate_results_sha256']==sha((OUT/'gate-results.json').read_bytes())
 assert r['source_reverse_audit_sha256']==sha((OUT/'source-reverse-audit.json').read_bytes())
for m in members:assert sha((ROOT/m['receipt']).read_bytes())==m['receipt_sha256']
policy=load(OUT/'campaign-policy.json');assert policy['scope_used']==3 and policy['campaign_used']==9 and policy['campaign_limit']==12
assert policy['historical_mechanical_reported']=='19/16' and policy['historical_semantic_reported']=='10/8' and not policy['later_scope_authorized']
roots=list(csv.DictReader((OUT/'prospective-root-ledger.csv').open()));assert len(roots)==len({r['root_id'] for r in roots})==9
assert load(OUT/'summary.json')['global_current_resolved']=='UNKNOWN'
assert load(OUT/'source-reverse-audit.json')['unchanged_components']==317
for doc in [OUT/'README.md']:
 for target in re.findall(r'\]\(([^)]+)\)',doc.read_text()):assert (doc.parent/target).is_file(),target
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
print('PASS: four new receipts, 12 exact campaign signatures, 145/3919 suite, 47/1775 remediation, complete logs/candidate/source integrity, 22 runtime checks; budgets 3/3 and 9/12; global UNKNOWN')
