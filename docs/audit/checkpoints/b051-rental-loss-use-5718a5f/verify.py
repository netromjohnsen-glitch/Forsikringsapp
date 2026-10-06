#!/usr/bin/env python3
"""Verify the bounded current B051 candidate, original bindings, receipts and retained history."""
import csv,gzip,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];OUT=Path(__file__).resolve().parent
BASE='5718a5fdcfe669d6afd11d4c27fe3a45ed24c175'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda p:json.loads((OUT/p).read_text())
registry={r['signature_id']:r for r in csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())};assert len(registry)==1589
old=json.loads((ROOT/'docs/audit/checkpoints/rv02-b071-b051-f829dd3/checkpoint.json').read_text());assert old['documented_campaign_count']==26 and old['HARNESS_AUTONOMY_V1']['used']==5
prior=read('prior-receipts.json');assert len(prior)==26 and {r['signature'] for r in prior}==set(old['documented_campaign_signatures'])
for r in prior:assert sha((ROOT/r['path']).read_bytes())==r['sha256'],r['path']
# Check every prior receipt package's immutable checksums, without pretending its historical app identity validates new catalog text.
for package in {Path(r['path']).parent for r in prior}:
 checksum=ROOT/package/'SHA256SUMS'
 assert checksum.exists(),package
 for line in checksum.read_text().splitlines():
  digest,file=line.split('  ',1)
  assert not Path(file).is_absolute() and '..' not in Path(file).parts
  source_path=ROOT/file if file.startswith('docs/') else ROOT/package/file
  if file in ['docs/development-agent/current-project-status.md','docs/development-agent/start.md']:
   assert package==Path('docs/audit/checkpoints/rv02-b071-b051-f829dd3')
   historical=subprocess.check_output(['git','show',BASE+':'+file],cwd=ROOT)
   assert sha(historical)==digest,file
  else:assert sha(source_path.read_bytes())==digest,file
for r in read('prior-input-integrity.json')['sources']:assert sha((ROOT/r['path']).read_bytes())==r['expected_sha256']==r['actual_sha256']
auth=read('authorization.json');assert auth['baseline']==BASE and len(auth['signatures'])==5
for s in auth['signatures']:
 assert s['original_binding']==registry[s['signature']]
 assert s['original_binding']['final_batch_id']=='B-051' and int(s['original_binding']['P2_occurrences'])==0
 for e in s['original_source_evidence']:assert sha((ROOT/e['artifact']).read_bytes())==e['sha256']
assert set(auth['allowed_catalog_owners'])=={'gjensidigeHusStandard','gjensidigeHusRental'}
subprocess.run(['node',str(OUT/'catalog-audit.mjs')],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
roots=read('harness-roots.json');assert len(roots)<=6 and len({r['id'] for r in roots})==len(roots)
for i,r in enumerate(roots):assert r['scope_used']==i+1 and r['campaign_before']==5+i and r['campaign_after']==6+i and r['campaign_limit']==12
assert 5+len(roots)<=12
for p in read('b050-compatibility-proof.json'):assert sha((ROOT/p['path']).read_bytes())==p['sha256']
identity=read('application-identity.json');assert identity['tested_baseline']==BASE
for f,h in identity['application_files'].items():assert sha((ROOT/f).read_bytes())==h,f
assert sha(json.dumps(identity['application_files'],sort_keys=True,separators=(',',':')).encode())==identity['identity_sha256']
if '--preflight' in sys.argv:
 print('B051 bindings/sources/26previousreceipts/candidate/isolation/harness-integrity PASS');sys.exit(0)
results=read('gate-results.json')['results']
for r in results:
 data=(OUT/r['log']).read_bytes();assert sha(data)==r['log_sha256'] and sha(gzip.decompress(data))==r['output_sha256']
 assert r['tested_revision']==BASE
 # Earlier diagnosed harness/environment attempts remain as history, not closure evidence.
 if r['status']!='PASS':assert r['label'] in ['targeted-recovered-remediation-b-051','targeted-final-remediation-b-051','targeted-verified-remediation-b-050']
manifest=read('test-manifest.json');assert manifest==sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
full=[r for r in results if r['label'].startswith('full-')];assert len(full)==len(manifest) and sorted(r['command'][-1] for r in full)==manifest
assert all(r['status']=='PASS' and r['tap']['pass']==r['tap']['tests'] and r['tap'].get('skipped',0)==0 for r in full)
rem=read('remediation-manifest.json');assert rem==[p for p in manifest if 'remediation' in Path(p).name or Path(p).name=='b043-status-parser.test.mjs']
summary=read('validation-summary.json')
for label,selected in [('fullsuite',full),('remediation',[r for r in full if r['command'][-1] in rem])]:
 assert summary[label]['files']==len(selected) and summary[label]['tests']==summary[label]['pass']==sum(r['tap']['tests'] for r in selected)
for label in ['typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']:
 r=next(r for r in results if r['label']==label);assert r['status']=='PASS' and r['exit_code']==0
 if label=='eslint':assert r['errors']==0
 if label=='http-pdf-runtime':assert r['runtime']['result']=='PASS' and len(r['runtime']['checks'])==22
for r in [x for x in results if x['label'].startswith('targeted-closure-')]:assert r['status']=='PASS'
receipts=[json.loads(f.read_text()) for f in OUT.glob('receipt-*.json')];assert len(receipts)==5
assert {r['signature'] for r in receipts}=={s['signature'] for s in auth['signatures']}
for r in receipts:
 s=next(s for s in auth['signatures'] if s['signature']==r['signature'])
 assert r['classification']=='SOURCE_BACKED_COMPLETION' and r['status']=='PASS'
 assert r['GAP_SF_bindings']==[{'GAP':e['finding_id'],'SF':e['source_fact_id'],'product_identity':e['product_identity']} for e in s['original_source_evidence']]
 assert r['tested_baseline']==BASE and r['candidate_identity_sha256']==identity['identity_sha256']
 assert r['global_resolved_open']=='UNKNOWN' and r['P2_credit']==0 and r['historical_closure_reconstructed'] is False
checkpoint=read('checkpoint.json');assert checkpoint['documented_campaign_count']==31
assert set(checkpoint['documented_campaign_signatures'])==set(old['documented_campaign_signatures'])|{r['signature'] for r in receipts}
assert checkpoint['global_resolved_open']=='UNKNOWN' and checkpoint['historical_only']==old['historical_only'] and checkpoint['historical_DEFER_SAFE_signatures']==old['historical_DEFER_SAFE_signatures']
assert checkpoint['HARNESS_AUTONOMY_V1']['used']==5+len(roots) and checkpoint['HARNESS_AUTONOMY_V1']['scope_used']==len(roots)
assert set(old['holds_unchanged'])<=set(checkpoint['holds_unchanged']) and set(auth['holds'])<=set(checkpoint['holds_unchanged'])
for file in [OUT/'README.md',OUT/'authorization.md',ROOT/'docs/development-agent/current-project-status.md',ROOT/'docs/development-agent/start.md']:
 for url in re.findall(r'\]\(([^)]+)\)',file.read_text()):
  if '://' not in url and not url.startswith('#'):assert (file.parent/url.split('#')[0]).exists(),(file,url)
listed=[]
for line in (OUT/'SHA256SUMS').read_text().splitlines():
 digest,f=line.split('  ',1);assert sha((ROOT/f).read_bytes())==digest,f;listed.append(f)
expected=read('publish-files.json');assert set(expected)==set(listed)|{str((OUT/'SHA256SUMS').relative_to(ROOT))}
assert len(expected)==len(set(expected))
assert all(p.startswith(str(OUT.relative_to(ROOT))+'/') or p in auth['allowed_project_files'] for p in expected)
print('B051 COMPLETE integrity PASS: exact5receipts,31documented unique signatures; global UNKNOWN; holds and26priorreceipts unchanged')
