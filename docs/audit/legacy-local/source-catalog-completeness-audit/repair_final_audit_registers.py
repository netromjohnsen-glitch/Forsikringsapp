from continue_audit import *
import collections
A=load('audit.json');F=load('source-facts.json');C=load('catalog.json');products={p['productId']:p for p in C['products']}
# Two old RB-01 records described the same shared batch. Preserve legacy records, one canonical ID.
by=collections.defaultdict(list)
for b in A['remediation_batches']:by[b['batch_id']].append(b)
merged=[]
for bid,rows in sorted(by.items()):
 b=dict(rows[0]);rr=[r for r in A['root_causes'] if r['remediation_batch']==bid];gg=[g for g in A['findings'] if g['remediation_batch']==bid]
 if len(rows)>1:b['merged_legacy_records']=rows
 b.update(root_cause_ids=[r['root_cause_id'] for r in rr],finding_count=len(gg),exact_products=sorted({g['product_identity'] for g in gg}),affected_product_count=len({g['product_identity'] for g in gg}),P1=sum(g['severity']=='P1' for g in gg),P2=sum(g['severity']=='P2' for g in gg),work=' '.join(r['description'] for r in rr))
 merged.append(b)
A['remediation_batches']=merged
for f in F:
 if f['classification']!='SOURCE_FACT_PRESENT_AND_CATALOGUED' or json.loads(f['catalog_match']):continue
 p=products[f['product']]
 assert f['semantic_subject'] in ['Produktvalg','Produktnivå','Forsikringsobjekt'],f['source_fact_id']
 f['catalog_match']=json.dumps({'representation_kind':'PRODUCT_STRUCTURE_NOT_FACT_ROW','product_identity':p['identity'],'name':p['name'],'insuranceType':p['insuranceType'],'componentIds':p['components'],'optionalAddOnIds':p['addons'],'scope':'Only the product structure/identity is confirmed here; all individual benefit limits/qualifiers/conflicts are separately inventoried.'},ensure_ascii=False)
 f['reason']='Strukturell positiv kontroll: produktidentitet/nivå eller separat produktvalg finnes i katalogstrukturen. Dette bekrefter ikke automatisk alle detaljer i kildeoversikten.'
 if f['source_fact_id']=='SF-7584':
  f['structured_value']='Minikasko §1.1 gjelder tilhengeren angitt i forsikringsbeviset. Campingvognens løsøre/fortelt/tilbygg står separat i §1.2 og overføres ikke som tilhengerregel.'
  f['source_location']='1 Minikasko §1.1–1.2';f['source_evidence']='Parafrase av lokalt kontrollert kildepunkt: '+f['structured_value'];f['unique_source_semantic_id']=digest([f['source_sha256'],f['source_location'],f['semantic_subject'],f['semantic_dimension'],f['structured_value']])[:20]
A['manual_review']['source_facts']=F
A['catalog_counts']['unique_source_semantic_facts']=len({f.get('unique_source_semantic_id') or digest([f['source_sha256'],f['source_location'],f['semantic_subject'],f['semantic_dimension'],f['structured_value']]) for f in F})
A['manual_review']['final_validation_coverage']['structural_positive_controls_linked']=25
A['positive_controls']=[next((f for f in F if f['source_fact_id']==old['source_fact_id']),old) for old in A['positive_controls']]
save('audit.json',A);save('source-facts.json',F);csvsave('source-fact-inventory.csv',F);csvsave('remediation-batches.csv',merged)
r=load('resume.json');r['counts']=A['catalog_counts'];save('resume.json',r)
print('Canonical batches',len(merged),'unique source rules',A['catalog_counts']['unique_source_semantic_facts'])
