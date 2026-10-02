from pathlib import Path
p=Path('/tmp/source-catalog-completeness-audit/refresh_checkpoint.py');s=p.read_text()
s=s.replace(" for p in a['product_coverage']:",""" proven_statuses={'UNSUPPORTED_CONFIRMED','CATALOG_FACT_NOT_SUPPORTED_BY_SOURCE','CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE','CATALOG_FACT_SEMANTICALLY_MISMAPPED'}
 proven_classes={'CATALOG_FACT_NOT_SUPPORTED_BY_SOURCE','CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE','CATALOG_FACT_SEMANTICALLY_MISMAPPED','SEMANTICALLY_MISMAPPED'}
 existing_claims={x['catalog_claim_id'] for x in a['unsupported_catalog_claims']['proven']}
 for claim in support:
  if claim['support_status'] in proven_statuses and claim['catalog_claim_id'] not in existing_claims:
   a['unsupported_catalog_claims']['proven'].append(dict(claim));existing_claims.add(claim['catalog_claim_id'])
 for p in a['product_coverage']:""",1)
s=s.replace("x['support_status']=='UNSUPPORTED_CONFIRMED'","x['support_status'] in proven_statuses")
s=s.replace("json.loads(x['product_identity'])[1]==fam['family'].lower()","x['product_identity'] in {p['product_identity'] for p in a['product_coverage'] if p['insurance_type']==fam['family']}")
s=s.replace("z['classification']=='CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE'","z['classification'] in proven_classes")
anchor=" save('audit.json',a);r['family_checkpoints']=a['family_results'];save('resume.json',r)"
replacement=""" # Persist all required resume aliases and exact identities without losing prior fields.
 r.update(repo_head=a['metadata']['head'],partially_reviewed_products=r.get('partially_reviewed',[]),not_started_products=r.get('not_started',[]),partially_reviewed_addons=r.get('partial_addons',[]),remaining_addons=[x['addon_id'] for x in a['addon_coverage'] if not x['fully_audited']],source_hashes_already_parsed=r.get('parsed_source_hashes',[]),source_inventories_completed=[x['product_identity'] for x in a['product_coverage'] if x['full_product_inventory_complete']],deep_reviews_completed=r.get('deep_reviews',[]),finding_validation_state={x['finding_id']:x.get('validation_state','MANUALLY_VALIDATED' if x.get('manual_validation') else 'CANDIDATE') for x in g})
 complete=[x for x in a['manual_review']['products'] if x['full_product_inventory_complete']]
 r['last_completed_product']=complete[-1]['product_identity'] if complete else None
 r['last_completed_family']=next((x['family'] for x in reversed(a['family_results']) if x.get('family_checkpoint')=='COMPLETE'),None)
 r['current_family']=r.get('next_family');r['current_product']=r.get('next_product')
 nextp=next((x for x in a['product_coverage'] if x['product_id']==r.get('next_product')),None)
 if nextp:r['next_exact_product_identity']=nextp['product_identity']
 r['source_inventories_on_disk']=sorted(x.name for x in O.glob('*independent-inventory.json'))
 r['remaining_reverse_source_support_checks']=[x['product_identity'] for x in a['product_coverage'] if x['source_support_status']!='REVERSE_REVIEW_COMPLETE']
 fresh=read('continuation-2026-10-01-baseline.json')['resume']['counts']
 r['progress_since_current_allocation']={k:c[k]-fresh.get(k,0) for k in ['products_fully_audited','addons_fully_audited','manual_source_fact_occurrences','findings']}
 save('audit.json',a);r['family_checkpoints']=a['family_results'];save('resume.json',r)"""
assert anchor in s;s=s.replace(anchor,replacement)
p.write_text(s)
