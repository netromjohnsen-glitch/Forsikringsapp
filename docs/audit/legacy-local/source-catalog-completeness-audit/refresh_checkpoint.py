from pathlib import Path
import json,csv,collections,hashlib,datetime,subprocess
O=Path('/tmp/source-catalog-completeness-audit');R=Path('/Users/morten/Documents/forsikringsapp')
def read(n):return json.loads((O/n).read_text())
def save(n,v):(O/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def csvsave(n,rows):
 keys=list(dict.fromkeys(k for r in rows for k in r))
 with (O/n).open('w',newline='') as fh:
  w=csv.DictWriter(fh,fieldnames=keys);w.writeheader()
  for r in rows:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v for k,v in r.items()})
def refresh(integrity=False):
 a=read('audit.json');f=read('source-facts.json');g=a['findings'];c=a['catalog_counts'];r=read('resume.json');b=read('continuation-baseline.json');support=list(csv.DictReader((O/'catalog-fact-support.csv').open()))
 proven_statuses={'UNSUPPORTED_CONFIRMED','CATALOG_FACT_NOT_SUPPORTED_BY_SOURCE','CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE','CATALOG_FACT_SEMANTICALLY_MISMAPPED'}
 proven_classes={'CATALOG_FACT_NOT_SUPPORTED_BY_SOURCE','CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE','CATALOG_FACT_SEMANTICALLY_MISMAPPED','SEMANTICALLY_MISMAPPED'}
 existing_claims={x['catalog_claim_id'] for x in a['unsupported_catalog_claims']['proven']}
 for claim in support:
  if claim['support_status'] in proven_statuses and claim['catalog_claim_id'] not in existing_claims:
   a['unsupported_catalog_claims']['proven'].append(dict(claim));existing_claims.add(claim['catalog_claim_id'])
 for p in a['product_coverage']:
  cs=[x for x in support if x['product_identity']==p['product_identity']]
  p['unsupported_candidate_count']=sum(x['support_status']=='UNSUPPORTED_CANDIDATE' for x in cs)
  p['unsupported_confirmed_count']=sum(x['support_status'] in proven_statuses for x in cs)
  p['supported_catalog_fact_count']=sum(str(x['full_claim_validated']).lower()=='true' for x in cs)
 for fam in a['family_results']:
  fs=[x for x in f if x['insurance_type']==fam['family']];gs=[x for x in g if x['insurance_type']==fam['family']];cs=[x for x in support if x['product_identity'] in {p['product_identity'] for p in a['product_coverage'] if p['insurance_type']==fam['family']}]
  fam.update(mismapped=sum(x['classification']=='CATALOG_FACT_SEMANTICALLY_MISMAPPED' for x in fs),structural=sum(x['classification']=='STRUCTURAL_MAPPING_GAP' for x in fs),unsupported_catalog_claims_proven=sum(x['support_status'] in proven_statuses for x in cs),unsupported_candidates=sum(x['support_status']=='UNSUPPORTED_CANDIDATE' for x in cs))
  fam['family_status']='GAPS_FOUND' if gs else 'PARTIAL_NO_GAPS_YET' if fam['products_partially_reviewed'] else 'NOT_REVIEWED'
 # Exact source conflicts, not merely the initial checkpoint's four-item research queue.
 q=a['source_research_queue'];existing={x.get('conflict_id') for x in q}
 for s in a['source_conflicts']:
  if s['id'] in existing:continue
  q.append(dict(queue_id=f'SRQ-{len(q)+1:03}',conflict_id=s['id'],product=s.get('product','exact products in '+s['family']),reason=s['claim'],local_work_first=s.get('action','Complete exact applicability review'),external_source_needed_if_unresolved='Official clarification of exact version/product/condition; no source downloaded in this audit',downloaded=False))
 a['source_research_queue']=q
 for x in a['unsupported_catalog_claims']['proven']:
  x['source_fact_ids']=[z['source_fact_id'] for z in f if z['product_identity']==x['product_identity'] and z['classification'] in proven_classes and x['key'] in z['proposed_keys']]
  x['finding_ids']=[z['finding_id'] for z in g if z['product_identity']==x['product_identity'] and z['classification'] in proven_classes and x['key'] in z['proposed_existing_keys']]
 # Persist all required resume aliases and exact identities without losing prior fields.
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
 save('audit.json',a);r['family_checkpoints']=a['family_results'];save('resume.json',r)
 csvsave('product-ledger.csv',a['product_coverage']);csvsave('family-summary.csv',a['family_results']);csvsave('source-research-queue.csv',q)
 csvsave('unsupported-catalog-facts.csv',a['unsupported_catalog_claims']['proven']+a['unsupported_catalog_claims']['candidates'])
 csvsave('family-semantic-map.csv',[dict(source_fact_id=x['source_fact_id'],family=x['insurance_type'],provider=x['provider'],product_identity=x['product_identity'],semantic_subject=x['semantic_subject'],semantic_dimension=x['semantic_dimension'],existing_or_proposed_keys=x['proposed_keys'],known_key_support=x.get('key_support_existing_catalog',{}),type_registry_support=x.get('key_support_existing_type_registry',{}),comparison_placement='Existing typed detail where safe; provider-specific detail otherwise; no UI change authorized',symmetry_forced=False,status=x['classification']) for x in f])
 checks={}
 specs={'product-ledger.csv':len(a['product_coverage']),'addon-ledger.csv':len(a['addon_coverage']),'source-fact-inventory.csv':len(f),'gap-findings.csv':len(g),'family-summary.csv':len(a['family_results']),'root-cause-candidates.csv':len(a['root_causes']),'remediation-batches.csv':len(a['remediation_batches']),'catalog-fact-support.csv':5646,'source-artifact-ledger.csv':322,'source-record-ledger.csv':356,'family-semantic-map.csv':len(f)}
 for n,count in specs.items():
  rr=list(csv.DictReader((O/n).open()));checks[n+':rows']=len(rr)==count;checks[n+':columns']=all(None not in z for z in rr)
 for name,rows,key in [('facts',f,'source_fact_id'),('findings',g,'finding_id')]:checks[name+':unique']=len({x[key] for x in rows})==len(rows)
 checks['original_ids_preserved']=set(b['finding_ids'])<={x['finding_id'] for x in g} and set(b['source_fact_ids'])<={x['source_fact_id'] for x in f}
 checks['linked_findings']=all(x['source_fact_id'] in {z['source_fact_id'] for z in f} for x in g)
 checks['all_exact_products']=all(x['product_identity'] in {p['product_identity'] for p in a['product_coverage']} for x in f)
 checks['counts_current']=c['findings']==len(g) and c['manual_source_fact_occurrences']==len(f) and c==r['counts']
 checks['severity_total']=sum(c[k] for k in ['P0','P1','P2','P3'])==len(g)
 checks['root_total']=sum(x['finding_count'] for x in a['root_causes'])==len(g)
 checks['family_total']=sum(x['sourcefacts'] for x in a['family_results'])==len(f)
 checks['family_products_total']=sum(x['products'] for x in a['family_results'])==204
 checks['product_status_partition']=c['products_fully_audited']+c['products_partially_reviewed']+c['products_not_started']==204
 checks['addon_status_partition']=c['addons_fully_audited']+c['addons_partially_reviewed']+c['addons_not_started']==84
 checks['source_evidence_present']=all(x.get('source_hash') and x.get('source_location') and x.get('source_evidence') and x.get('catalog_evidence') for x in g)
 arts={x['path']:x['sha256'] for x in read('corpus.json')['artifacts']};checks['finding_hash_links']=all(arts[x['source_artifact']]==x['source_hash'] for x in g)
 checks['semantic_complete_not_claimed']=a['metadata']['status']=='PARTIAL' and a['catalog_pilot_gate']=='REMEDIATION_REQUIRED'
 if integrity:
  base=read('baseline.json');git=lambda *args:subprocess.check_output(['git',*args],cwd=R).decode().strip()
  changed=[p for p,h in base['files'].items() if not (R/p).exists() or hashlib.sha256((R/p).read_bytes()).hexdigest()!=h]
  dc=subprocess.run(['git','diff','--check'],cwd=R,capture_output=True,text=True)
  it={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':git('rev-parse','HEAD'),'branch':git('branch','--show-current'),'status':git('status','--short'),'staged':git('diff','--cached','--name-only'),'changed_baseline_files':changed,'git_diff_check_exit':dc.returncode,'source_artifacts_changed':[p for p,h in arts.items() if hashlib.sha256((R/p).read_bytes()).hexdigest()!=h]}
  checks['repo_integrity']=it['head']==base['head'] and not it['status'] and not it['staged'] and not changed and not it['source_artifacts_changed'] and dc.returncode==0
  save('continuation-integrity.json',it)
 save('quality-check.json',{'status':'PASS' if all(checks.values()) else 'FAIL','timestamp':a['metadata']['timestamp'],'checks':checks,'errors':[k for k,v in checks.items() if not v],'counts':c,'note':'Checkpoint structure/count/evidence-link validation; NOT full semantic completion. Prior validation remains historical.'})
 ct=collections.Counter(x['classification'] for x in f);ded=collections.Counter()
 for severity in ['P0','P1','P2','P3']:ded[severity]=len({x['signature'] for x in g if x['severity']==severity})
 lines=['# SOURCE_CATALOG_COMPLETENESS_AUDIT','', '**PARTIAL — CONTINUATION CHECKPOINT**','',f"Run: `{a['metadata']['run_id']}`; checkpoint: {a['metadata']['timestamp']}",f"HEAD: `{a['metadata']['head']}`; branch main; repository read-only.",f"Catalog fingerprint `{a['metadata']['catalog_fingerprint']}`.",f"Source corpus fingerprint `{a['metadata']['source_corpus_fingerprint']}`.",'','## Progress',f"Products: {c['products_fully_audited']} complete, {c['products_partially_reviewed']} partial, {c['products_not_started']} not started, of204. Complete means review closure, not gap-free catalog.",f"Add-ons: {c['addons_fully_audited']} complete, {c['addons_partially_reviewed']} partial, {c['addons_not_started']} not started, of84.",f"Since original checkpoint: +{c['manual_source_fact_occurrences']-b['counts']['manual_source_fact_occurrences']} checked source-fact occurrences; +{c['findings']-b['counts']['findings']} finding occurrences.",f"{len(f)} source-fact occurrences / {c['unique_source_semantic_facts']} unique source semantic rules; {c['advisor_relevant_source_fact_occurrences']} advisor-relevant occurrences. The total unreviewed semantic denominator is unknown.",'','## Family progress','','|Family|Complete|Partial|Not started|P1 occurrences|P2 occurrences|','|---|---:|---:|---:|---:|---:|']
 for x in a['family_results']:lines.append(f"|{x['family']}|{x['products_fully_audited']}|{x['products_partially_reviewed']}|{x['products_not_started']}|{x['P1']}|{x['P2']}|")
 lines+=['','## Findings',f"{len(g)} occurrences, {c['unique_finding_signatures']} deduplicated signatures. P0 {c['P0']} ({ded['P0']} unique); P1 {c['P1']} ({ded['P1']} unique); P2 {c['P2']} ({ded['P2']} unique); P3 {c['P3']}. Shared-source repetitions are not independent root causes.",f"Verified visible false unknowns: {c['verified_visible_false_unknown_cases']}; further catalog omissions do not count as UI-verified without a probe.",f"Missing: {ct['SOURCE_FACT_PRESENT_BUT_MISSING_FROM_CATALOG']}; too coarse: {ct['CATALOG_FACT_TOO_COARSE']}; mismapped: {ct['CATALOG_FACT_SEMANTICALLY_MISMAPPED']}; unsupported source claims: {len(a['unsupported_catalog_claims']['proven'])} proven, {len(a['unsupported_catalog_claims']['candidates'])} candidates.",f"Source conflicts: {len(a['source_conflicts'])}; no arbitrary source precedence chosen.",'','## Root causes / proposed remediation']
 for x in a['root_causes']:lines.append(f"- {x['root_cause_id']} / {x['remediation_batch']}: {x['description']} ({x['finding_count']} occurrences; {x['complexity']}).")
 lines+=['','Remediation is not authorized. No broad engine/schema blocker has been proven; exact missing dimensions may need small registry extensions. Do not invent peer symmetry or customer selection.','', '## Positive controls / method','Local full terms are read independently before exact catalog comparisons where recorded. All values/labels/structured fields/inherited and available optional facts are considered, not only missing keys. Full-source and catalog-to-source review are distinct from page parsing. Table ambiguities are rendered where needed. Online freshness was not researched.', 'Existing explicit customer data > catalog; optional availability != selected. Declared source ambiguity, customer-specific sums, and provider-specific detail are kept separate.', '', '## Next resume point',f"{r['next_family']} / {r['next_provider']} / `{r['next_product']}`; addon `{r.get('next_addon')}`.",f"Last: {r['last_checkpoint']}",'Continue audit from resume.json; do not restart extraction/enumeration or begin remediation.','', '## Integrity / outputs','No repo/code/catalog/source/test/docs changes; no Git writes, deployment, env access, private files or web research. Latest full file/hash check is in continuation-integrity.json. /tmp/nito-prepilot-audit is untouched.','', 'Canonical current evidence: audit.json, source-facts.json, product-ledger.csv, addon-ledger.csv, gap-findings.csv, catalog-fact-support.csv, root-cause-candidates.csv, remediation-batches.csv, source-research-queue.csv, quality-check.json and resume.json.', '', '**Catalog pilot gate: REMEDIATION_REQUIRED. Overall semantic audit remains PARTIAL.**']
 if not (O/'pre-continuation-audit-summary.md').exists():(O/'pre-continuation-audit-summary.md').write_text((O/'audit-summary.md').read_text())
 (O/'audit-summary.md').write_text('\n\n'.join(lines)+'\n')
 print(json.dumps({'checkpoint_quality':all(checks.values()),'errors':[k for k,v in checks.items() if not v],'facts':len(f),'findings':len(g)},ensure_ascii=False))
if __name__=='__main__':refresh(integrity=True)
