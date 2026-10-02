"""Incremental audit-only checkpoint writer. Never writes into the repository."""
from pathlib import Path
import json,csv,hashlib,datetime,collections,subprocess
O=Path('/tmp/source-catalog-completeness-audit'); R=Path('/Users/morten/Documents/forsikringsapp')
def load(f): return json.loads((O/f).read_text())
def save(f,x): (O/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def csvsave(f,rows):
 keys=list(dict.fromkeys(k for row in rows for k in row))
 with (O/f).open('w',newline='') as out:
  w=csv.DictWriter(out,fieldnames=keys);w.writeheader()
  for row in rows:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in row.items()})
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
PRESENT='SOURCE_FACT_PRESENT_AND_CATALOGUED';MISSING='SOURCE_FACT_PRESENT_BUT_MISSING_FROM_CATALOG';COARSE='CATALOG_FACT_TOO_COARSE';CUSTOM='SOURCE_FACT_CUSTOMER_SPECIFIC';ADMIN='NOT_COMPARISON_RELEVANT';REVIEW='REVIEW_REQUIRED'
class Audit:
 def __init__(self):
  self.a=load('audit.json');self.f=load('source-facts.json');self.c=load('catalog.json');self.s=load('corpus.json');self.p={p['productId']:p for p in self.c['products']};self.art={a['path']:a for a in self.s['artifacts']};self.sr={s['id']:s for s in self.s['source_records']}
  self.reg=load('registry-check.json');self.keys={f['key'] for fs in self.c['components'].values() for f in fs}
  self.support=list(csv.DictReader((O/'catalog-fact-support.csv').open()))
  if not (O/'pre-continuation-audit.json').exists():save('pre-continuation-audit.json',self.a)
 def root(self,rid,description,evidence,families,providers,batch,kind='CATALOG_DATA_ONLY',complexity='DATA_ONLY',hard=False):
  found=next((r for r in self.a['root_causes'] if r['root_cause_id']==rid),None)
  if found:return
  self.a['root_causes'].append(dict(root_cause_id=rid,layer=kind,families=families,providers=providers,description=description,evidence=evidence,remediation_batch=batch,remediation_type=kind,complexity=complexity,gpt6_remediation_recommended=hard,confidence='HIGH for observed omission location; causal authoring process not inferred',remediation_authorized=False))
 def fact(self,pid,subject,dimension,value,path,location,classification,keys=None,priority='',reason='',root='',component='',inventory_id='',extra=None):
  p=self.p[pid];art=self.art[path];keys=keys or []
  # Exact-product values are inspected by reviewer before this function is invoked.
  fs=p['facts']+sum(p['addonFacts'].values(),[])
  matches=[f for f in fs if f['key'] in keys]
  unique=(pid,component,path,location,subject,dimension)
  old=next((f for f in self.f if (f['product'],f['component'],f['source_artifact'],f['source_location'],f['semantic_subject'],f['semantic_dimension'])==unique),None)
  if old:return old
  sid=f'SF-{len(self.f)+1:04d}';ident=p['identity']
  f=dict(provider=p['providerId'],insurance_type=p['insuranceType'],scope=p['agreementScope'],product=pid,version=p['version'],component=component,source_artifact=path,source_sha256=art['sha256'],source_location=location,semantic_subject=subject,semantic_dimension=dimension,structured_value=value,fact_status='SOURCE_DOCUMENTED_RULE',advisor_relevance='ADMINISTRATIVE' if classification==ADMIN else 'CORE',catalog_match=json.dumps(matches,ensure_ascii=False),classification=classification,confidence='HIGH',priority=priority,manual_validation=True,catalog_full_fact_count_checked=len(fs),reason=reason,proposed_keys=keys,source_excerpt='',root_cause_id=root if priority else '',audit_review_status='MANUALLY_CHECKED',source_fact_id=sid,product_identity=ident,agreement_scope=p['agreementScope'],product_id=pid,version_unknown=p['version'] is None,catalog_version=p['version'],source_metadata={'manifest_entries':art['manifest_entries'],'runtime_records':[self.sr[s] for s in art['runtime_source_ids']]},source_evidence='Parafrase av lokalt kontrollert kildepunkt: '+value,full_package_review_complete=False,representation_searched_in=['resolved base','inherited components','available optional components','materialized catalog snapshot'],key_support_existing_catalog={k:k in self.keys for k in keys},key_support_existing_type_registry={k:self.reg.get(p['insuranceType']+'|'+k) for k in keys},confidence_scope='Exact source rule and exact product; package closure separately recorded',finding_id='',source_first_inventory_id=inventory_id,validation_state='FINAL',unique_source_semantic_id=digest([art['sha256'],location,subject,dimension,value])[:20])
  if extra:f.update(extra)
  if priority:
   rt=next(r for r in self.a['root_causes'] if r['root_cause_id']==root)
   fid=f'GAP-{len(self.a["findings"])+1:04d}';f['finding_id']=fid
   g=dict(finding_id=fid,signature=digest([p['providerId'],p['insuranceType'],p['agreementScope'],subject,dimension,classification])[:16],provider=p['providerId'],insurance_type=p['insuranceType'],scope=p['agreementScope'],product=pid,version=p['version'],product_identity=ident,component=component,semantic_concept=subject,semantic_dimension=dimension,classification=classification,severity=priority,confidence='HIGH',source_artifact=path,source_hash=art['sha256'],source_location=location,source_evidence=f['source_evidence'],source_urls=list(dict.fromkeys([e['url'] for e in art['manifest_entries'] if e.get('url')]+[self.sr[s]['url'] for s in art['runtime_source_ids'] if self.sr[s].get('url')])),catalog_evidence=matches or {'state':'NO_EQUIVALENT_FOUND_IN_EXACT_PRODUCT','base_and_optional_fact_count':len(fs),'snapshot':'catalog.json','product_identity':ident,'note':'All exact resolved and optional facts manually compared by meaning, not keyword absence.'},advisor_impact=reason,likely_root_cause=rt['description'],root_cause_id=root,remediation_batch=rt['remediation_batch'],remediation_complexity='DATA_ONLY' if keys and all(k in self.keys for k in keys) else 'SMALL_CODE',remediation_type='CATALOG_DATA_ONLY' if keys and all(k in self.keys for k in keys) else 'CANONICAL_MAPPING',pilot_priority='MUST_BEFORE_NITO' if priority in ['P0','P1'] else 'SHOULD_BEFORE_NITO',gpt6_remediation_recommended=False,customer_mode_impact='Missing catalog detail affects fallback; explicit customer facts retain authority. Optional availability is not customer selection.',extraction_extension_required='NOT_PROVEN_REQUIRED',presentation_extension_required='EXISTING_TYPED_DETAIL_OR_SMALL_REGISTRY_EXTENSION',manual_validation=True,source_fact_id=sid,proposed_existing_keys=keys,complete_package_audited=False,validation_state='FINAL',unique_source_semantic_id=f['unique_source_semantic_id'])
   self.a['findings'].append(g)
  self.f.append(f);return f
 def product_review(self,pid,paths,complete,notes,source_first=True):
  p=self.p[pid];entry=next(x for x in self.a['product_coverage'] if x['product_id']==pid)
  entry.update(manual_reviewed=True,semantic_audit_status='COMPLETE' if complete else 'PARTIAL_SEMANTIC_REVIEW',full_product_inventory_complete=complete,source_support_status='REVERSE_REVIEW_COMPLETE' if complete else 'PARTIALLY_CHECKED',manual_review_depth='FULL_DEEP_REVIEW' if complete else 'TARGETED_DOCUMENT_REVIEW',remaining_work='None within inventoried local source package; no online freshness claim.' if complete else notes)
  review=dict(product_identity=p['identity'],product_id=pid,family=p['insuranceType'],provider=p['providerId'],scope=p['agreementScope'],source_artifacts=[Path(x).name for x in paths],source_paths=paths,depth=entry['manual_review_depth'],source_content_beyond_catalog=True,source_first=source_first,reasoning=notes,full_product_inventory_complete=complete)
  self.a['manual_review']['products']=[x for x in self.a['manual_review']['products'] if x['product_id']!=pid]+[review]
  pkg=next(x for x in self.a['source_coverage']['packages'] if x['product_id']==pid)
  pkg.update(manually_reviewed_artifacts=paths,package_status='COMPLETE_WITH_RECORDED_GAPS' if complete else 'PARTIALLY_REVIEWED',complete=complete,candidate_applicability='Exact component/type checked; no automatic cross-product inheritance',review_notes=notes)
  for f in self.f:
   if f['product']==pid:f['full_package_review_complete']=complete
  for g in self.a['findings']:
   if g['product']==pid:g['complete_package_audited']=complete
 def reverse(self,pid,verified_locations):
  p=self.p[pid]
  for claim in self.support:
   if claim['product_identity']!=p['identity']:continue
   key=claim['key']
   if key not in verified_locations:continue
   related=[f for f in self.f if f['product']==pid and key in f['proposed_keys']]
   claim.update(support_status='SUPPORTED_WITH_LOCATION_CORRECTION' if verified_locations[key].get('location_correction') else 'SUPPORTED',full_claim_validated=True,reviewed_source_fact_ids=[f['source_fact_id'] for f in related],manual_reverse_evidence=verified_locations[key],support_scope='Exact claim supported; missing surrounding material dimensions listed separately')
  entry=next(x for x in self.a['product_coverage'] if x['product_id']==pid)
  entry['supported_catalog_fact_count']=sum(x['product_identity']==p['identity'] and str(x['full_claim_validated']).lower()=='true' for x in self.support)
 def checkpoint(self,label,next_family,next_provider,next_product,next_addon=None):
  now=datetime.datetime.now(datetime.timezone.utc).isoformat();a=self.a;F=self.f;G=a['findings'];ps=a['product_coverage'];adds=a['addon_coverage']
  # Preserve original IDs and evidence, refresh derived counts only.
  original=load('continuation-baseline.json')
  assert set(original['finding_ids']).issubset(g['finding_id'] for g in G)
  assert len({g['finding_id'] for g in G})==len(G)
  assert len({f['source_fact_id'] for f in F})==len(F)
  for p in ps:
   rows=[f for f in F if f['product_identity']==p['product_identity']];gs=[g for g in G if g['product_identity']==p['product_identity']];ct=collections.Counter(f['classification'] for f in rows)
   p.update(advisor_relevant_source_fact_count=sum(f['classification'] not in [ADMIN,'SOURCE_ONLY_ACCEPTABLE'] for f in rows),source_fact_occurrence_count=len(rows),represented_fact_count=ct[PRESENT]+ct['SOURCE_FACT_ALREADY_REPRESENTED_BY_PARENT']+ct['SOURCE_FACT_ALREADY_REPRESENTED_BY_CHILDREN'],missing_fact_count=ct[MISSING],too_coarse_count=ct[COARSE],review_count=ct[REVIEW]+ct['SOURCE_AMBIGUOUS'],customer_specific_count=ct[CUSTOM],administrative_count=ct[ADMIN]+ct['SOURCE_ONLY_ACCEPTABLE'])
   for lev in ['P0','P1','P2','P3']:p[lev]=sum(g['severity']==lev for g in gs)
   if gs:p['completeness_status']='MATERIAL_GAPS' if p['P0']+p['P1'] else 'MINOR_GAPS'
   if p['semantic_audit_status']=='PARTIAL':p['semantic_audit_status']='PARTIAL_SEMANTIC_REVIEW'
  for fam in a['family_results']:
   fp=[p for p in ps if p['insurance_type']==fam['family']];fs=[f for f in F if f['insurance_type']==fam['family']];gs=[g for g in G if g['insurance_type']==fam['family']];ct=collections.Counter(f['classification'] for f in fs)
   fam.update(products_fully_audited=sum(p['full_product_inventory_complete'] for p in fp),products_partially_reviewed=sum(p['manual_reviewed'] and not p['full_product_inventory_complete'] for p in fp),products_not_started=sum(not p['manual_reviewed'] for p in fp),sourcefacts=len(fs),advisor_relevant_source_facts=sum(f['classification'] not in [ADMIN,'SOURCE_ONLY_ACCEPTABLE'] for f in fs),represented=ct[PRESENT]+ct['SOURCE_FACT_ALREADY_REPRESENTED_BY_PARENT']+ct['SOURCE_FACT_ALREADY_REPRESENTED_BY_CHILDREN'],missing=ct[MISSING],too_coarse=ct[COARSE],customer_specific=ct[CUSTOM],administrative=ct[ADMIN]+ct['SOURCE_ONLY_ACCEPTABLE'],review=ct[REVIEW]+ct['SOURCE_AMBIGUOUS'])
   for lev in ['P0','P1','P2','P3']:fam[lev]=sum(g['severity']==lev for g in gs)
   fam['family_checkpoint']='PARTIAL' if any(p['manual_reviewed'] for p in fp) else 'NOT_STARTED'
  counts=a['catalog_counts'];counts.update(manual_source_fact_occurrences=len(F),advisor_relevant_source_fact_occurrences=sum(f['classification'] not in [ADMIN,'SOURCE_ONLY_ACCEPTABLE'] for f in F),findings=len(G),unique_finding_signatures=len({g['signature'] for g in G}),unique_source_semantic_facts=len({f.get('unique_source_semantic_id') or digest([f['source_sha256'],f['source_location'],f['semantic_subject'],f['semantic_dimension'],f['structured_value']]) for f in F}),products_fully_audited=sum(p['full_product_inventory_complete'] for p in ps),products_partially_reviewed=sum(p['manual_reviewed'] and not p['full_product_inventory_complete'] for p in ps),products_not_started=sum(not p['manual_reviewed'] for p in ps))
  counts.update(addons_fully_audited=sum(x['fully_audited'] for x in adds),addons_partially_reviewed=sum(not x['fully_audited'] and x['status']!='UNREVIEWED' for x in adds),addons_not_started=sum(x['status']=='UNREVIEWED' for x in adds))
  for fam in a['family_results']:
   aa=[x for x in adds if fam['family'] in x['insurance_type']]
   fam.update(addons_fully_audited=sum(x['fully_audited'] for x in aa),addons_partially_reviewed=sum(not x['fully_audited'] and x['status']!='UNREVIEWED' for x in aa))
  for ad in adds:
   ff=[f for f in F if f['component']==ad['addon_id']];ct=collections.Counter(f['classification'] for f in ff)
   ad.update(advisor_relevant_fact_count=sum(f['classification'] not in [ADMIN,'SOURCE_ONLY_ACCEPTABLE'] for f in ff),represented=ct[PRESENT],missing=ct[MISSING],too_coarse=ct[COARSE],customer_specific=ct[CUSTOM])
  for lev in ['P0','P1','P2','P3']:counts[lev]=sum(g['severity']==lev for g in G)
  for root in a['root_causes']:
   gs=[g for g in G if g['root_cause_id']==root['root_cause_id']]
   root.update(affected_products=sorted({g['product_identity'] for g in gs}),finding_count=len(gs),unique_signatures=len({g['signature'] for g in gs}),P1=sum(g['severity']=='P1' for g in gs),P2=sum(g['severity']=='P2' for g in gs))
   # Routine source-backed authoring is not an architecture/model escalation.
   root['gpt6_remediation_recommended']=False
   root.setdefault('remediation_type','ADDON' if root['root_cause_id']=='SCRC-004' else 'CATALOG_DATA_ONLY')
   root['legacy_complexity_description']=root.get('legacy_complexity_description',root['complexity'])
   root['complexity']='SMALL_CODE' if root['root_cause_id'] in ['SCRC-003','SCRC-004'] or root['complexity']=='SMALL_CODE' else 'DATA_ONLY'
  # A batch may contain multiple roots; never overwrite a shared batch with last root.
  for bid in sorted({r['remediation_batch'] for r in a['root_causes']}):
   rr=[r for r in a['root_causes'] if r['remediation_batch']==bid];old=next((b for b in a['remediation_batches'] if b['batch_id']==bid),None)
   if old is None:
    old={'batch_id':bid,'status':'PROPOSED_NOT_IMPLEMENTED','protect':['document > catalog','optional != selected','type/provider/scope/version isolation'],'precondition':'Human review; no remediation authorized'};a['remediation_batches'].append(old)
   old.update(root_cause_ids=[r['root_cause_id'] for r in rr],exact_products=sorted({p for r in rr for p in r['affected_products']}),finding_count=sum(r['finding_count'] for r in rr),families=sorted({f for r in rr for f in r['families']}),work=' '.join(r['description'] for r in rr),complexity='SMALL_CODE' if any(r['complexity']=='SMALL_CODE' for r in rr) else 'DATA_ONLY',gpt6_remediation_recommended=False)
  for art in a['source_coverage']['artifacts']:
   rs=[r for r in a['manual_review']['products'] if art['name'] in r['source_artifacts']]
   art['manual_review_product_ids']=sorted({r['product_id'] for r in rs});art['manual_source_fact_count']=sum(f['source_artifact']==art['path'] for f in F)
   art['semantic_review_status']='READ_WITH_EXACT_PRODUCT_CLOSURE' if any(r['full_product_inventory_complete'] for r in rs) else 'PARTIAL_READ_OR_DIMENSION_REVIEW' if rs else 'NOT_REVIEWED'
  a['positive_controls']=[f for f in F if f['classification'] in [PRESENT,CUSTOM,ADMIN]]
  a['manual_review'].update(source_facts=F,count_partial=counts['products_partially_reviewed'],count_complete=counts['products_fully_audited'],minimum24complete_passed=counts['products_fully_audited']>=24 and all(f['products_fully_audited']>=2 for f in a['family_results']))
  a['metadata'].update(timestamp=now,last_checkpoint=label)
  a['source_package_gaps']['unclosed_packages']=[p['product_identity'] for p in ps if not p['full_product_inventory_complete']]
  a['limitations']=[f"Semantic audit remains partial: {counts['products_fully_audited']} products complete, {counts['products_partially_reviewed']} partial, {counts['products_not_started']} not started. Complete means review closure, not absence of catalog gaps.",'Prior limitations retained in pre-continuation-audit.json; online freshness not checked; no private documents or application mutation.','Counts are checked occurrences, not the unknown total corpus semantic denominator. No coverage score inferred.']
  a['quality_self_check']['minimum_complete_deep_reviews']=a['manual_review']['minimum24complete_passed']
  a['quality_self_check']['output_parse_validation']='CHECKPOINT_CONSISTENCY_PASSED_NOT_FULL_AUDIT_COMPLETION'
  for pr in a['provider_diagnostics']:
   pp=[p for p in ps if p['provider']==pr['provider']];pr.update(reviewed_products_partial=sum(p['manual_reviewed'] and not p['full_product_inventory_complete'] for p in pp),reviewed_products_complete=sum(p['full_product_inventory_complete'] for p in pp),findings=sum(g['provider']==pr['provider'] for g in G),status='PARTIAL' if any(p['manual_reviewed'] for p in pp) else 'NOT_REVIEWED')
  for sc in a['scope_diagnostics']:
   pp=[p for p in ps if p['agreement_scope']==sc['scope']];sc.update(partial_review=sum(p['manual_reviewed'] and not p['full_product_inventory_complete'] for p in pp),complete=sum(p['full_product_inventory_complete'] for p in pp))
  save('audit.json',a);save('source-facts.json',F)
  for fn,rows in [('source-fact-inventory.csv',F),('gap-findings.csv',G),('product-ledger.csv',ps),('addon-ledger.csv',adds),('family-summary.csv',a['family_results']),('source-package-summary.csv',a['source_coverage']['packages']),('root-cause-candidates.csv',a['root_causes']),('remediation-batches.csv',a['remediation_batches']),('source-artifact-ledger.csv',a['source_coverage']['artifacts']),('catalog-fact-support.csv',self.support)]:csvsave(fn,rows)
  resume=load('resume.json');resume.update(audit_run_id=a['metadata']['run_id'],last_checkpoint=label,last_checkpoint_at=now,last_completed_product=[p['product_identity'] for p in ps if p['full_product_inventory_complete']][-1] if counts['products_fully_audited'] else None,completed_products=[p['product_identity'] for p in ps if p['full_product_inventory_complete']],partially_reviewed=[p['product_identity'] for p in ps if p['manual_reviewed'] and not p['full_product_inventory_complete']],not_started=[p['product_identity'] for p in ps if not p['manual_reviewed']],all_require_package_closure=a['source_package_gaps']['unclosed_packages'],next_family=next_family,next_provider=next_provider,next_product=next_product,next_addon=next_addon,finding_ids=[g['finding_id'] for g in G],root_cause_ids=[r['root_cause_id'] for r in a['root_causes']],remediation_batch_ids=[b['batch_id'] for b in a['remediation_batches']],family_checkpoints=a['family_results'],counts=counts,parsed_source_hashes=sorted({x['sha256'] for x in self.s['artifacts']}),manual_review_state='audit.json/manual_review and source-facts.json are current; manual-source-facts.json/manual-products.json are prior checkpoint inputs',deep_reviews=[p['product_identity'] for p in ps if p['full_product_inventory_complete']],completed_addons=[x['addon_id'] for x in adds if x['fully_audited']],partial_addons=[x['addon_id'] for x in adds if not x['fully_audited'] and x['status']!='UNREVIEWED'],not_started_addons=[x['addon_id'] for x in adds if x['status']=='UNREVIEWED'],do_not_repeat=['Runtime enumeration or source parsing at unchanged fingerprints','Existing final finding evidence','Complete exact-product reviews','Existing verified false-unknown probes'])
  save('resume.json',resume)
  with (O/'manual-review.md').open('a') as out:
   out.write(f'\n\n## Continuation checkpoint: {label}\n\n{now}\n\n'+json.dumps(counts,ensure_ascii=False,indent=2)+'\n\nExact next: '+next_product+'\n')
  from refresh_checkpoint import refresh
  refresh(integrity=False)
  print(json.dumps({'checkpoint':label,'counts':counts,'next':next_product},ensure_ascii=False,indent=2))
