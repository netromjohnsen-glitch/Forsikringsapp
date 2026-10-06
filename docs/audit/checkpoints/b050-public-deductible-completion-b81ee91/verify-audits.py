#!/usr/bin/env python3
"""Exact PUBLIC_DEDUCTIBLE source, registry, isolation and prior receipt audit."""
import csv,gzip,hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];OUT=Path(__file__).resolve().parent
BASE='b81ee91e8693dc7962040219768283a2270cfea6'
sha=lambda b:hashlib.sha256(b).hexdigest()
registry=list(csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open()))
assert len(registry)==len({r['signature_id'] for r in registry})==1589
r=next(r for r in registry if r['signature_id']=='f8bd15c89bc0dbd6')
assert json.loads(r['finding_ids'])==['GAP-2872'] and json.loads(r['source_fact_ids'])==['SF-4021'] and r['final_batch_id']=='B-050'
expected={'gjensidige-dog-treatment-terms.pdf':'8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6','gjensidige-dog-product.html':'fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58'}
manifest=json.loads((ROOT/'catalog/sources/boat-pet/manifest.json').read_text())['documents']
for filename,h in expected.items():
 m=next(m for m in manifest if m['filename']==filename)
 assert m['sha256']==h==sha((ROOT/m['localPath']).read_bytes())
 assert m['providerId']=='gjensidige' and m['insuranceTypes']==['hund'] and m['agreementScope']=='ordinary'
before=json.loads(gzip.decompress((OUT/'catalog-before.json.gz').read_bytes()))
after=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {productCatalog} from './lib/product-catalog.ts';process.stdout.write(JSON.stringify(productCatalog));"],cwd=ROOT))
(OUT/'catalog-after.json.gz').write_bytes(gzip.compress(json.dumps(after,ensure_ascii=False).encode(),mtime=0))
for k in before:
 if k!='facts':assert before[k]==after[k],k
assert list(before['facts'])==list(after['facts'])
pid='gjensidige-hund-behandling';allowed=['dyr.veterinar.egenandel.fast','dyr.veterinar.egenandel.prosent','dyr.veterinar.egenandel.periode']
changed=[k for k in before['facts'] if before['facts'][k]!=after['facts'][k]];assert changed==[pid]
assert [f for f in after['facts'][pid] if f['key'] not in allowed]==[f for f in before['facts'][pid] if f['key'] not in allowed]
assert len(after['facts'][pid])==len(before['facts'][pid])+2
assert all(sum(f['key']==k for f in after['facts'][pid])==1 for k in allowed)
for f in after['facts'][pid]:
 if f['key'] not in allowed:continue
 assert f['source']['documentId']=='boat-pet:gjensidige:hund:product' and f['source']['page']==1 and f['source']['section']=='Hva er egenandelen? – Behandling'
 assert f['qualificationSource']['documentId']=='boat-pet:gjensidige:hund:treatment' and f['qualificationSource']['page']==8
 assert f['source']['company']==f['qualificationSource']['company']=='Gjensidige'
 assert f['source']['agreementScope']==f['qualificationSource']['agreementScope']=='ordinary'
 assert f['source']['version']==f['qualificationSource']['version']==''
old=next(f for f in before['facts'][pid] if f['key']==allowed[0]);new=next(f for f in after['facts'][pid] if f['key']==allowed[0])
assert {k:v for k,v in old.items() if k not in ['value','source','deductibleClassification']}=={k:v for k,v in new.items() if k not in ['value','source','deductibleClassification','qualificationSource']}
c=json.loads(subprocess.check_output(['git','show',BASE+':docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json'],cwd=ROOT))
assert len(c['campaign_members'])==12
for m in c['campaign_members']:assert sha((ROOT/m['receipt']).read_bytes())==m['receipt_sha256']
# Whole frozen source tree, engines, guards, registries and previous audits are unchanged.
changes=subprocess.check_output(['git','diff','--name-only',BASE],cwd=ROOT).decode().splitlines()
allowed_files=['lib/boat-pet-catalog.ts','tests/remediation-b-050.test.mjs','tests/boat-pet-catalog.test.mjs']
assert all(f in allowed_files or f.startswith(('docs/audit/checkpoints/b050-public-deductible-completion-b81ee91/','docs/audit/checkpoints/development-agent-ef5b0bc/','docs/development-agent/')) for f in changes),changes
report={'status':'PASS','baseline':BASE,'signature':'f8bd15c89bc0dbd6','gap_ids':['GAP-2872'],'sf_ids':['SF-4021'],'source_hashes':expected,'changed_components':changed,'allowed_keys':allowed,'unchanged_components':len(before['facts'])-1,'metadata_and_sources_unchanged':True,'prior_12_receipts_unchanged':[m['signature'] for m in c['campaign_members']],'shared_fixes_and_frozen_sources_unchanged':True,'global_resolved_open':'UNKNOWN'}
(OUT/'source-reverse-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS: exact signature/bindings, two frozen hashes, three deductible keys, 317 untouched components, metadata/sources/12 receipts/engines preserved')
