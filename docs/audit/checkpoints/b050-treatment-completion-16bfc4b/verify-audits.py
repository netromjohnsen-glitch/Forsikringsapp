#!/usr/bin/env python3
"""Exact current source/admission, binding, provenance and reverse audit."""
import csv,gzip,hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];OUT=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
scope=json.loads((OUT/'authorization.json').read_text())['scope']
registry=list(csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open()))
assert len(registry)==1589 and len({r['signature_id'] for r in registry})==1589
for sig,(gap,sf) in scope.items():
 matches=[r for r in registry if r['signature_id']==sig];assert len(matches)==1
 r=matches[0];assert json.loads(r['finding_ids'])==[gap] and json.loads(r['source_fact_ids'])==[sf] and r['final_batch_id']=='B-050'
manifest=json.loads((ROOT/'catalog/sources/boat-pet/manifest.json').read_text())['documents']
expected={'gjensidige-dog-treatment-terms.pdf':'8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6','gjensidige-dog-product.html':'fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58'}
for filename,h in expected.items():
 m=next(m for m in manifest if m['filename']==filename);assert m['sha256']==h
 assert sha((ROOT/m['localPath']).read_bytes())==h
 assert m['providerId']=='gjensidige' and m['insuranceTypes']==['hund'] and m['agreementScope']=='ordinary'
 assert m['url']=='https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring'
before=json.loads(gzip.decompress((OUT/'catalog-before.json.gz').read_bytes()))
cmd=['node','--input-type=module','-e',"import {productCatalog} from './lib/product-catalog.ts';process.stdout.write(JSON.stringify(productCatalog));"]
after=json.loads(subprocess.check_output(cmd,cwd=ROOT))
(OUT/'catalog-after.json.gz').write_bytes(gzip.compress(json.dumps(after,ensure_ascii=False).encode(),mtime=0))
for k in before:
 if k not in ['facts','sources']:assert before[k]==after[k],k
assert set(before['facts'])==set(after['facts'])
changed=[k for k in before['facts'] if before['facts'][k]!=after['facts'][k]];assert changed==['gjensidige-hund-behandling']
pid=changed[0];rows=after['facts'][pid]
allowed=['dyr.veterinar.dekning','dyr.veterinar.begrensning','dyr.medisin.dekning','dyr.tannsykdom.dekning','dyr.tannsykdom.begrensning']
assert [f for f in rows if f['key'] not in allowed]==[f for f in before['facts'][pid] if f['key'] not in allowed]
old=next(f for f in before['facts'][pid] if f['key']=='dyr.veterinar.dekning');new=next(f for f in rows if f['key']==old['key'])
assert {k:v for k,v in old.items() if k not in ['value','source']}=={k:v for k,v in new.items() if k not in ['value','source']}
assert len(rows)==len(before['facts'][pid])+4
assert all(sum(f['key']==k for f in rows)==1 for k in allowed)
sid='boat-pet:gjensidige:hund:treatment';sources=dict(after['sources']);introduced=sources.pop(sid);assert sources==before['sources']
assert introduced=={'id':sid,'filename':'gjensidige-dog-treatment-terms.pdf','providerId':'gjensidige','company':'Gjensidige','insuranceType':'Hund','agreementScope':'ordinary','sourceType':'full_terms','termsNumber':'','effectiveFrom':'','version':'','url':'https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring','sha256':expected['gjensidige-dog-treatment-terms.pdf'],'documentName':''}
uses=[]
for owner,facts in after['facts'].items():
 for f in facts:
  if any(f.get(k,{}).get('documentId')==sid for k in ['source','qualificationSource']):
   assert owner==pid and f['key'] in allowed;uses.append([owner,f['key']])
assert len(uses)==5
checkpoint=json.loads((ROOT/'docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json').read_text())
assert len(checkpoint['campaign_members'])==8
prior=[]
for m in checkpoint['campaign_members']:
 assert sha((ROOT/m['receipt']).read_bytes())==m['receipt_sha256'];prior.append(m['signature'])
assert len(set(prior))==8 and not set(prior)&set(scope)
for f in ['lib/coverage-fact-semantics.ts','tests/liv-reduction-selection-evidence.test.mjs','lib/boat-pet-registry.ts','lib/catalog-enrichment.ts','lib/product-catalog.ts']:
 assert (ROOT/f).read_bytes()==subprocess.check_output(['git','show','16bfc4bd5db0b9dbfa9b8646f4aae902ba5d8d90:'+f],cwd=ROOT),f
assert sha((ROOT/'docs/development-agent/treatment-admission-blocker.md').read_bytes())==json.loads((OUT/'prior-blocker-preservation.json').read_text())['sha256']
report={'status':'PASS','baseline':'16bfc4bd5db0b9dbfa9b8646f4aae902ba5d8d90','source_hashes':expected,'exact_bindings':scope,'changed_components':changed,'allowed_keys':allowed,'unchanged_components':len(before['facts'])-1,'metadata_unchanged':True,'existing_sources_unchanged':True,'introduced_source':introduced,'new_source_uses':uses,'prior_eight_receipts_unchanged':prior,'shared_fixes_unchanged':True,'global_resolved_open':'UNKNOWN'}
(OUT/'source-reverse-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS: two frozen hashes, four exact bindings, five authorized fact rows, 317 unchanged components, all metadata/existing sources/shared fixes/eight receipts preserved')
