#!/usr/bin/env python3
"""Verify this current evidence without assigning a global ledger or changing old receipts."""
import csv,gzip,hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
BASE='f829dd3dba2ad8a5dbb0d0d9eb584be83f428f2e'
sha=lambda b:hashlib.sha256(b).hexdigest()
read=lambda n:json.loads((OUT/n).read_text())
old=json.loads((ROOT/'docs/audit/checkpoints/project-status-8fc4324/evidence.json').read_text())
registry={r['signature_id']:r for r in csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry)==1589
for row in read('input-integrity.json')['sources']:
 assert sha((ROOT/row['path']).read_bytes())==row['actual_sha256']==row['expected_sha256']
for row in old['current_receipts']:
 assert sha((ROOT/row['receipt']).read_bytes())==row['receipt_sha256']
identity=read('application-identity.json');assert identity['tested_revision']==BASE
for file,digest in identity['application_files'].items():
 assert sha((ROOT/file).read_bytes())==digest
 assert sha(subprocess.check_output(['git','show',BASE+':'+file],cwd=ROOT))==digest
assert sha(json.dumps(identity['application_files'],sort_keys=True,separators=(',',':')).encode())==identity['identity_sha256']
bindings=old['next_steps'][0]['signature_bindings'];expected={r['signature'] for r in bindings}
receipts=[json.loads(f.read_text()) for f in OUT.glob('receipt-*.json')]
assert len(receipts)==10 and {r['signature'] for r in receipts}==expected
source=read('b071-source-contracts.json');assert source['exact_ten_bindings']==bindings and len(source['rows'])==16
for b in bindings:
 original=registry[b['signature']];assert b['gap'] in json.loads(original['finding_ids']) and b['sf'] in json.loads(original['source_fact_ids'])
 receipt=next(r for r in receipts if r['signature']==b['signature']);assert receipt['status']=='PASS' and receipt['classification']=='CURRENT_REVALIDATION'
 assert (receipt['gap'],receipt['sf'],receipt['component_owner'],receipt['canonical_keys'])==(b['gap'],b['sf'],b['owner'],b['keys'])
 assert receipt['tested_revision']==BASE and receipt['global_resolved_open']=='UNKNOWN' and receipt['P2_credit']==0
 assert receipt['historical_closure_reconstructed'] is False
results=read('gate-results.json')['results']
for r in results:
 data=(OUT/r['log']).read_bytes();assert sha(data)==r['log_sha256'];assert sha(gzip.decompress(data))==r['output_sha256']
 assert r['tested_revision']==BASE
initial=[r for r in results if r['status']!='PASS'];assert len(initial)==1
assert initial[0]['label']=='targeted-document-fact-normalization' and initial[0]['exit_code']==1
assert 'MODULE_NOT_FOUND' in gzip.decompress((OUT/initial[0]['log']).read_bytes()).decode()
manifest=read('test-manifest.json');assert manifest==sorted(str(f.relative_to(ROOT)) for f in (ROOT/'tests').glob('*.test.mjs'))
full=[r for r in results if r['label'].startswith('full-')];assert len(full)==len(manifest)==145
assert sorted(r['command'][-1] for r in full)==manifest
assert all(r['status']=='PASS' and r['tap']['tests']==r['tap']['pass'] for r in full)
rem=read('remediation-manifest.json');assert rem==[f for f in manifest if 'remediation' in Path(f).name or Path(f).name=='b043-status-parser.test.mjs']
assert len(rem)==47
summary=read('validation-summary.json');assert summary['fullsuite']['tests']==summary['fullsuite']['pass']==sum(r['tap']['tests'] for r in full)==3955
assert summary['remediation']['tests']==sum(r['tap']['tests'] for r in full if r['command'][-1] in rem)==1804
for label in ['typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']:
 r=next(r for r in results if r['label']==label);assert r['status']=='PASS' and r['exit_code']==0
 if label=='eslint':assert r['errors']==0
 if label=='http-pdf-runtime':assert r['runtime']['result']=='PASS' and len(r['runtime']['checks'])==22
final_lint=next(r for r in results if r['label']=='publication-eslint');assert final_lint['status']=='PASS'
assert sum(r['errorCount'] for r in json.loads(gzip.decompress((OUT/final_lint['log']).read_bytes())))==0
assert next(r for r in results if r['label']=='targeted-recovered-remediation-b-071')['tap']['pass']==97
assert summary['build_exception_used'] is False
roots=read('harness-roots.json');assert len(roots)==1
assert roots[0]['scope_used']==1 and roots[0]['scope_limit']==6 and roots[0]['campaign_before']==old['HARNESS_AUTONOMY_V1']['used']==4
assert roots[0]['campaign_after']==5 and roots[0]['campaign_limit']==12
assert sha((OUT/'run-gates.py').read_bytes())==roots[0]['after_sha256']
checkpoint=read('checkpoint.json');assert checkpoint['HARNESS_AUTONOMY_V1']['used']==5 and checkpoint['global_resolved_open']=='UNKNOWN'
assert set(checkpoint['documented_campaign_signatures'])==set(old['current_documented_B050'])|expected and len(checkpoint['documented_campaign_signatures'])==26
assert checkpoint['historical_only']==old['historical_only'] and checkpoint['historical_DEFER_SAFE_signatures']==old['historical_DEFER_SAFE_signatures']
assert checkpoint['holds_unchanged']==old['holds_unchanged']
pref=read('b051-preflight.json');original=old['next_steps'][1]
assert set(pref['exact_signatures'])==set(original['signature_ids']) and len(pref['signatures'])==39
assert sum(len(r['original_source_evidence']) for r in pref['signatures'])==69
assert all(r['original_binding']==registry[r['signature']] and r['implementation_authorized'] is False for r in pref['signatures'])
assert pref['original_dependencies']==['B-007','B-020'] and pref['signatures_closed']==[] and pref['B051_budget_consumed']==0
assert len(pref['positive_controls'])==53 and pref['proposed_next_packet']['status']=='NOT_AUTHORIZED'
assert len(pref['proposed_next_packet']['exact_signatures'])==5
inspection=json.loads(gzip.decompress((OUT/'catalog-inspection.json.gz').read_bytes()))
assert len(inspection['probes'])==40 and inspection['related_hus_coverages']==[]
for r in inspection['probes']:
 assert r['addOnIds']==[]
 if r['input_value'] is not None:
  term=next(t for t in r['terms'] if t['key']==r['key']);assert term['value']==r['input_value'] and term['coverageOrigin']=='document'
  assert term['source']=={'documentId':'synthetic-rv02-hus-customer','filename':'synthetic-customer.pdf','termsNumber':'Synthetic evidence','effectiveFrom':'','page':2,'section':'Avtalte vilkår','company':'Gjensidige','url':'https://example.invalid/synthetic'}
for r in inspection['comparisons']:
 if r['first']==r['second']:assert r['result']['differenceCount']==0
 reverse=next(z for z in inspection['comparisons'] if z['first']==r['second'] and z['second']==r['first'])
 for a in [v for s in r['result']['sections'] for v in s['rows']]:
  b=next(z for s in reverse['result']['sections'] for z in s['rows'] if z['key']==a['key']);assert a['first']==b['second'] and a['second']==b['first']
for f in [OUT/'README.md',OUT/'b051-preflight.md',ROOT/'docs/development-agent/current-project-status.md',ROOT/'docs/development-agent/start.md']:
 for url in re.findall(r'\]\(([^)]+)\)',f.read_text()):
  if '://' not in url and not url.startswith('#'):assert (f.parent/url.split('#')[0]).exists(),(f,url)
listed=[]
for line in (OUT/'SHA256SUMS').read_text().splitlines():
 digest,file=line.split('  ',1);assert sha((ROOT/file).read_bytes())==digest;listed.append(file)
expected_files=read('publish-files.json');assert set(listed)==set(expected_files)-{str((OUT/'SHA256SUMS').relative_to(ROOT))}
assert len(expected_files)==len(set(expected_files))
assert all(f.startswith(str(OUT.relative_to(ROOT))+'/') or f in ['docs/development-agent/start.md','docs/development-agent/current-project-status.md'] for f in expected_files)
assert set(str(f.relative_to(ROOT)) for f in OUT.iterdir() if f.is_file())<=set(expected_files)
for command in [['git','diff','--check'],['git','diff','--cached','--check']]:subprocess.run(command,cwd=ROOT,check=True)
print('PASS: ten current B071 receipts,145/47 full manifests, current gates/source/identity;16oldB050 receipts/holds/history preserved;39B051 bindings/69 evidence/53controls; HARNESS5/12; checksums/links/diffs.')
