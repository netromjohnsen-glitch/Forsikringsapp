from pathlib import Path
import json,csv,hashlib,re,collections,subprocess
O=Path('/tmp/source-catalog-completeness-audit');R=Path('/Users/morten/Documents/forsikringsapp')
J=json.loads((O/'audit.json').read_text());F=J['findings'];SF=J['manual_review']['source_facts'];P=J['product_coverage'];A=J['addon_coverage'];C=J['catalog_counts'];S=J['source_coverage']
checks={};errors=[]
def ck(name,value):
 checks[name]=bool(value)
 if not value:errors.append(name)
required=['audit-summary.md','audit.json','product-ledger.csv','addon-ledger.csv','gap-findings.csv','source-fact-inventory.csv','family-summary.csv','root-cause-candidates.csv','manual-review.md']
ck('required_outputs_exist',all((O/n).is_file() and (O/n).stat().st_size for n in required))
parsed={}
for f in O.glob('*.json'):
 try:parsed[f.name]={'kind':'json','bytes':f.stat().st_size};json.loads(f.read_text())
 except Exception:errors.append('invalidjson:'+f.name)
for f in O.glob('*.csv'):
 try:
  with f.open(newline='') as inp:
   reader=csv.DictReader(inp);rs=list(reader)
  ck(f.name+':consistent_columns',all(None not in r and all(v is not None for v in r.values()) for r in rs))
  parsed[f.name]={'kind':'csv','rows':len(rs),'columns':reader.fieldnames,'bytes':f.stat().st_size}
 except Exception:errors.append('invalidcsv:'+f.name)
ck('product_csv_count',parsed['product-ledger.csv']['rows']==C['products']==204)
ck('addon_csv_count',parsed['addon-ledger.csv']['rows']==C['addons']==84)
ck('source_csv_count',parsed['source-artifact-ledger.csv']['rows']==322)
ck('record_csv_count',parsed['source-record-ledger.csv']['rows']==356)
ck('sourcefact_csv_count',parsed['source-fact-inventory.csv']['rows']==len(SF)==253)
ck('findings_csv_count',parsed['gap-findings.csv']['rows']==len(F)==135)
ck('family_csv_count',parsed['family-summary.csv']['rows']==12)
ck('root_csv_count',parsed['root-cause-candidates.csv']['rows']==6)
ck('products_unique',len({p['product_identity'] for p in P})==len(P))
ck('sourcefacts_unique',len({f['source_fact_id'] for f in SF})==len(SF))
ck('findings_unique',len({f['finding_id'] for f in F})==len(F))
ck('all_findings_linked',all(any(s['source_fact_id']==f['source_fact_id'] and s['finding_id']==f['finding_id'] for s in SF) for f in F))
ck('all_exact_products_resolved',all(any(p['product_identity']==s['product_identity'] for p in P) for s in SF))
ck('root_total_reconciles',sum(x['finding_count'] for x in J['root_causes'])==len(F))
ck('family_product_total',sum(x['products'] for x in J['family_results'])==204)
ck('family_fact_total',sum(x['sourcefacts'] for x in J['family_results'])==253)
ck('family_finding_total',sum(x['missing']+x['too_coarse'] for x in J['family_results'])==135)
ck('family_P1_total',sum(x['P1'] for x in J['family_results'])==C['P1']==88)
ck('family_P2_total',sum(x['P2'] for x in J['family_results'])==C['P2']==47)
ck('severity_reconciles',sum(C[k] for k in ['P0','P1','P2','P3'])==len(F))
ck('signatures_reconcile',len({x['signature'] for x in F})==82)
ck('manual_product_counts',31+173==len(P) and sum(p['manual_reviewed'] for p in P)==31)
ck('addon_counts',7+77==len(A) and sum(a['status']!='UNREVIEWED' for a in A)==7)
ck('no_false_complete',all(not p['full_product_inventory_complete'] for p in P) and all(not a['fully_audited'] for a in A))
ck('classification_partition',dict(collections.Counter(f['classification'] for f in SF))=={'SOURCE_FACT_PRESENT_BUT_MISSING_FROM_CATALOG':90,'SOURCE_FACT_PRESENT_AND_CATALOGUED':73,'CATALOG_FACT_TOO_COARSE':45,'SOURCE_FACT_CUSTOMER_SPECIFIC':19,'NOT_COMPARISON_RELEVANT':18,'REVIEW_REQUIRED':8})
ck('P1_fields_present',all(x['manual_validation'] and x['source_evidence'] and x['catalog_evidence'] and x['source_hash'] and x['source_location'] for x in F if x['severity']=='P1'))
ck('all_coarse_have_parent',all(json.loads(x['catalog_match']) for x in SF if x['classification']=='CATALOG_FACT_TOO_COARSE'))
ck('all_supported_have_match',all(json.loads(x['catalog_match']) for x in SF if x['classification']=='SOURCE_FACT_PRESENT_AND_CATALOGUED'))
ck('source_pages_in_bounds',all(not (m:=re.match(r'PDF side (\d+)',s['source_location'])) or int(m[1])<=next(a['pages'] for a in S['artifacts'] if a['path']==s['source_artifact']) for s in SF))
ck('source_hashes_unchanged',all(hashlib.sha256((R/a['path']).read_bytes()).hexdigest()==a['sha256'] for a in S['artifacts']))
ck('finding_source_hashes_match',all(next(a['sha256'] for a in S['artifacts'] if a['path']==f['source_artifact'])==f['source_hash'] for f in F))
ck('all_hash_sources_local',all((R/f['source_artifact']).is_file() for f in SF))
ck('false_unknown_links',all(len(x['finding_ids']) and x['side_swap_consistent'] for x in J['blindspot_validation']['visible_false_unknowns']) and len(J['blindspot_validation']['visible_false_unknowns'])==6)
ck('outputs_outside_repository',not O.resolve().is_relative_to(R.resolve()))
ck('repo_integrity',json.loads((O/'repo-integrity.json').read_text())['unchanged'])
# markdown links checked as filesystem targets; links to this checkfile are expected to exist when written below.
missing=[]
for f in O.glob('*.md'):
 for path in re.findall(r'\]\(<([^>]+)>\)',f.read_text()):
  if path==str(O/'quality-check.json'):continue
  target=re.sub(r':\d+$','',path)
  if target.startswith('/') and not Path(target).exists():missing.append((f.name,path))
ck('markdown_file_links_resolve',not missing)
checks['reported_status_is_PARTIAL']=J['metadata']['status']=='PARTIAL'
ck('no_claim_full_completion',J['catalog_counts']['products_fully_audited']==0 and J['manual_review']['count_complete']==0)
result={'status':'PASS' if not errors else 'FAIL','checks':checks,'errors':errors,'missing_links':missing,'parsed_files':parsed,'note':'PASS validates output structure/evidence links/counting/integrity only. Semantic completeness remains PARTIAL; full audit not passed.','counts':C}
(O/'quality-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
J['quality_self_check']['output_parse_validation']=result['status'];J['quality_self_check']['cross_check_file']='quality-check.json';J['quality_self_check']['counts_reconcile']=not errors
(O/'audit.json').write_text(json.dumps(J,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'checks':len(checks),'errors':errors,'links':missing,'counts':C},indent=2))
if errors:raise SystemExit(1)
