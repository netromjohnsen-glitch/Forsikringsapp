#!/usr/bin/env python3
"""Verify current completion, preserved initial stoppoint and immutable prior receipts."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
PRIOR=OUT.parent/'b051-settlement-age-0bcd250'
BASE='69c71dcc48258ba52f33a77a54126f1f065d7d7c'
read=lambda n:json.loads((OUT/n).read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
registry={r['signature_id']:r for r in csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry)==1589
exact={'292dacd4533926fd','b3b964a9c6105360','ed99577218e2302b'}
auth=read('authorization.json');assert auth['baseline_revision']==BASE
assert {r['signature_id'] for r in auth['signatures']}==exact
for row in auth['signatures']:assert row==registry[row['signature_id']]
for entry in auth['preflight_entries']:
 assert entry['original_binding']==registry[entry['signature']]
 assert len(entry['original_source_evidence'])==2
 for source in entry['original_source_evidence']:
  assert source['finding_id'] in json.loads(entry['original_binding']['finding_ids'])
  assert source['source_fact_id'] in json.loads(entry['original_binding']['source_fact_ids'])
  assert sha((ROOT/source['artifact']).read_bytes())==source['sha256']
prior=read('prior-receipts.json');assert len(prior)==len({x['signature'] for x in prior})==48
for row in prior:
 assert sha((ROOT/row['path']).read_bytes())==row['sha256']
 receipt=json.loads((ROOT/row['path']).read_text());assert receipt['status']=='PASS' and receipt['signature']==row['signature']
for inventory in ['historical-artifact-hashes.json','initial-candidate-artifact-hashes.json']:
 for path,digest in read(inventory).items():assert sha((ROOT/path).read_bytes())==digest,path
identity=read('final-application-identity.json');initial=read('application-identity.json')
assert set(identity['application_files'])==set(auth['authorized_application_files'])
for path,digest in identity['application_files'].items():assert sha((ROOT/path).read_bytes())==digest,path
assert sha(json.dumps(identity['application_files'],sort_keys=True,separators=(',',':')).encode())==identity['identity_sha256']
assert identity['prior_candidate_identity_sha256']==initial['identity_sha256']
assert [p for p,h in identity['application_files'].items() if h!=initial['application_files'][p]]==['tests/remediation-b-051-recovery-benefits.test.mjs']
# Works before/after staging and after the atomic commit without claiming a different revision was tested.
assert sha(subprocess.check_output(['git','diff',BASE,'--','lib/gjensidige-hus-catalog.ts'],cwd=ROOT))==identity['production_diff_sha256']
roots=read('final-harness-roots.json');assert len(roots)==1 and roots[0]['root']=='PLUS_PUBLIC_ORDER_PAGE_CONTINUATION'
assert roots[0]['HARNESS_AUTONOMY_V1']=={'before':20,'after':21,'ordinary_limit':12,'scope_before':0,'scope_after':1,'scope_limit':6,'explicit_named_exception':True,'other_capacity':0}
assert read('harness-roots.json')==[] # original uncorrected attempt remains historical
results=read('final-gate-results.json')['results']
assert results and all(r['status']=='PASS' and r['exit_code']==0 and r['tested_revision']==BASE and r['candidate_identity_sha256']==identity['identity_sha256'] for r in results)
assert len(results)==len({r['label'] for r in results})==181
for row in results:
 log=(OUT/row['log']).read_bytes();assert sha(log)==row['log_sha256'] and sha(gzip.decompress(log))==row['output_sha256']
manifest=read('final-test-manifest.json');assert manifest==sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
full=[r for r in results if r['label'].startswith('full-')];assert len(full)==len(manifest)==151
assert sorted(r['command'][-1] for r in full)==manifest
assert all(r['tap']['fail']==r['tap']['cancelled']==r['tap']['skipped']==0 for r in full)
rem=read('final-remediation-manifest.json');assert rem==[p for p in manifest if 'remediation' in Path(p).name or Path(p).name=='b043-status-parser.test.mjs'];assert len(rem)==53
summary=read('completion-validation-summary.json');assert summary['status']=='PASS'
for name,rs in [('fullsuite',full),('remediation',[r for r in full if r['command'][-1] in rem]),('targeted',[r for r in results if r['label'].startswith('targeted-closure-')])]:
 assert summary[name]['files']==len(rs)
 for k in ['tests','pass','fail','cancelled','skipped']:assert summary[name][k]==sum(r['tap'][k] for r in rs)
assert summary['new_gate']=={'tests':115,'pass':115,'fail':0,'cancelled':0,'skipped':0}
for label in ['typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']:assert len([r for r in results if r['label']==label])==1
assert next(r for r in results if r['label']=='eslint')['errors']==0
assert next(r for r in results if r['label']=='http-pdf-runtime')['runtime']['result']=='PASS'
assert summary['HTTP_PDF_runtime_checks']==22
lint=read('final-lint-difference.json');assert lint['errors']==0 and lint['new_warnings']==lint['removed_warnings']==[]
assert lint['previous_warnings']==lint['current_warnings']==27
subprocess.run(['node',str(OUT/'catalog-audit.mjs')],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
delta=read('catalog-delta.json');assert delta['entirely_unchanged_components']==317 and delta['protected_raw_facts']==4155 and delta['other_products_unchanged']==202
assert len(delta['changes'])==3 and all(x['owner']=='gjensidigeHusStandard' for x in delta['changes'])
receipts=[json.loads(p.read_text()) for p in OUT.glob('receipt-*.json')];assert len(receipts)==3 and {r['signature'] for r in receipts}==exact
for row in receipts:
 assert row['status']=='PASS' and row['tested_baseline']==BASE and row['original_binding']==registry[row['signature']]
 assert row['candidate_identity_sha256']==identity['identity_sha256']
 assert row['global_resolved_open']=='UNKNOWN' and row['P2_credit']==0
cp=read('completion-checkpoint.json');previous=json.loads((PRIOR/'checkpoint.json').read_text())
assert cp['documented_campaign_count']==len(set(cp['documented_campaign_signatures']))==51
assert set(cp['documented_campaign_signatures'])==exact|{x['signature'] for x in prior}
for field in ['historical_only','holds_unchanged','historical_DEFER_SAFE_signatures']:assert cp[field]==previous[field]
assert cp['HARNESS_AUTONOMY_V1']['used']==21 and cp['HARNESS_AUTONOMY_V1']['scope_used']==1 and cp['global_resolved_open']=='UNKNOWN'
partition=read('completion-b051-partition.json')
assert set(partition['exact_original_signatures'])=={s for s,r in registry.items() if r['final_batch_id']=='B-051'}
sets=[set(partition[k]) for k in ['completed_current_receipts','source_clear_no_current_receipt','revalidation_candidates','holds']]
assert list(map(len,sets))==[25,10,2,2]
assert sum(map(len,sets))==len(set.union(*sets))==39
assert set.union(*sets)==set(partition['exact_original_signatures'])
assert sets[0]==set(previous['current_B051_completed_signatures'])|exact
assert sets[2:]==[set(json.loads((PRIOR/'b051-partition.json').read_text())[k]) for k in ['revalidation_candidates','holds']]
# Original failed attempt and checksums are preserved, while final inventory covers all new evidence.
for inventory in ['SHA256SUMS','FINAL_SHA256SUMS']:
 entries=[]
 for line in (OUT/inventory).read_text().splitlines():
  digest,path=line.split('  ',1);assert not Path(path).is_absolute() and '..' not in Path(path).parts
  assert sha((ROOT/path).read_bytes())==digest,path;entries.append(path)
 assert len(entries)==len(set(entries))
 if inventory=='FINAL_SHA256SUMS':assert set(entries)=={str(p.relative_to(ROOT)) for p in OUT.rglob('*') if p.is_file() and p.name!='FINAL_SHA256SUMS'}
expected=read('expected-files.json');assert len(expected)==len(set(expected))
assert set(expected)==set(identity['application_files'])|{'docs/development-agent/current-project-status.md'}|{str(p.relative_to(ROOT)) for p in OUT.rglob('*') if p.is_file()}
for p in [*OUT.glob('*.md'),ROOT/'docs/development-agent/current-project-status.md']:
 assert b'\r' not in p.read_bytes()
 for target in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if not target.startswith(('http:','https:','#')):assert (p.parent/target.split('#')[0]).exists(),(p,target)
staged=subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=ROOT).decode().split('\0')[:-1]
if staged:assert len(staged)==len(expected) and set(staged)==set(expected)
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
subprocess.run(['git','diff','--cached','--check'],cwd=ROOT,check=True)
print('Completion integrity PASS:3 current receipts,48 immutable prior receipts,51 unique documented signatures; B05125/10/2/2; budget21/12 scope1/6; global UNKNOWN; final candidate and both diff checks.')
