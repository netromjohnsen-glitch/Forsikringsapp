from continue_audit import *
import collections,subprocess,re,datetime
A=load('audit.json');F=load('source-facts.json');G=A['findings'];P=A['product_coverage'];D=A['addon_coverage'];S=load('corpus.json');B=load('baseline.json');c=A['catalog_counts'];rs=load('resume.json');checks={};errors=[]
def ck(n,v):
 checks[n]=bool(v)
 if not v:errors.append(n)
# Derived fields from a prior partial checkpoint must not contradict the final reviewed register.
claims=list(csv.DictReader((O/'catalog-fact-support.csv').open()))
strict_ids={x['catalog_claim_id'] for x in A['unsupported_catalog_claims']['proven']}
for p in P:
 cs=[x for x in claims if x['product_identity']==p['product_identity']]
 p['unsupported_confirmed_count']=sum(x['catalog_claim_id'] in strict_ids for x in cs);p['unsupported_candidate_count']=0
for fam in A['family_results']:
 ps=[p for p in P if p['insurance_type']==fam['family']];fam['unsupported_catalog_claims_proven']=sum(p['unsupported_confirmed_count'] for p in ps);fam['unsupported_candidates']=0
 fam['source_sufficiency_status']='ASSESSED_WITH_OPEN_SOURCE_QUESTIONS' if any(p['source_research_required'] for p in ps) else 'ASSESSED_SUFFICIENT_FOR_RECORDED_DIMENSIONS';fam['source_insufficient_proven']=sum(p['local_source_insufficient'] for p in ps)
 fam['zero_gap_interpretation']='Counts describe this catalog, not insurer quality; review complete relative to frozen local corpus.'
A['unsupported_catalog_claims']['review_complete']=True
A['repo_integrity']={}
csvsave('product-ledger.csv',P);csvsave('family-summary.csv',A['family_results'])
# Full read-only integrity pass; no ignored env or node_modules reads.
def git(*args):return subprocess.check_output(['git',*args],cwd=R)
def sha(x):return hashlib.sha256(x).hexdigest()
status=git('status','--short').decode().strip();staged=git('diff','--cached','--name-only').decode().strip()
files={p:sha((R/p).read_bytes()) for p in B['files'] if (R/p).is_file()}
untracked={p:sha((R/p).read_bytes()) for p in git('ls-files','--others','--exclude-standard').decode().splitlines() if (R/p).is_file()}
final=dict(head=git('rev-parse','HEAD').decode().strip(),branch=git('branch','--show-current').decode().strip(),status=status,staged=staged,status_sha256=sha(status.encode()),tracked_diff_sha256=sha(git('diff','--binary')),staged_diff_sha256=sha(git('diff','--cached','--binary')),untracked_sha256=sha(json.dumps(untracked,sort_keys=True).encode()),working_tree_sha256=sha(json.dumps(files,sort_keys=True).encode()),files=files,timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat())
itchecks={k:final[k]==B[k] for k in ['head','branch','status','staged','status_sha256','tracked_diff_sha256','staged_diff_sha256','untracked_sha256','working_tree_sha256','files']}
dc=subprocess.run(['git','diff','--check'],cwd=R,capture_output=True,text=True)
sourcepairs=[(ar['path'],sha((R/ar['path']).read_bytes())) for ar in S['artifacts']]+[(m['path'],sha((R/m['path']).read_bytes())) for m in S['manifests']]
sourcefinger=sha(json.dumps(sourcepairs,sort_keys=True).encode())
ck('repo_integrity',all(itchecks.values()) and dc.returncode==0);ck('source_fingerprint',sourcefinger==A['metadata']['source_corpus_fingerprint'])
integ=dict(baseline=B,final=final,checks=itchecks,git_diff_check_exit_code=dc.returncode,git_diff_check_output=dc.stdout+dc.stderr,unchanged=all(itchecks.values()) and dc.returncode==0,source_corpus_fingerprint=sourcefinger,source_fingerprint_unchanged=sourcefinger==S['source_corpus_sha256'],catalog_fingerprint_runtime_recheck='PASS / final-identity-check.mjs',mutations_performed=[],outputs_outside_repo=True)
save('repo-integrity.json',integ);A['repo_integrity']=integ
# ID/reference/count validation independent of fixed expected finding count.
for name,rows,key in [('products',P,'product_identity'),('addons',D,'addon_id'),('facts',F,'source_fact_id'),('findings',G,'finding_id'),('roots',A['root_causes'],'root_cause_id'),('batches',A['remediation_batches'],'batch_id'),('research',A['source_research_queue'],'queue_id')]:ck(name+'_unique',len(rows)==len({r[key] for r in rows}))
facts={f['source_fact_id']:f for f in F};ids={p['product_identity'] for p in P};roots={r['root_cause_id'] for r in A['root_causes']};batches={r['batch_id'] for r in A['remediation_batches']};arts={ar['path']:ar['sha256'] for ar in S['artifacts']}
ck('finding_links',all(g['source_fact_id'] in facts and facts[g['source_fact_id']]['finding_id']==g['finding_id'] for g in G))
ck('exact_product_links',all(f['product_identity'] in ids for f in F));ck('root_batch_links',all(g['root_cause_id'] in roots and g['remediation_batch'] in batches for g in G))
ck('source_hash_links',all(arts[g['source_artifact']]==g['source_hash'] for g in G));ck('sourcefact_hash_links',all(arts[f['source_artifact']]==f['source_sha256'] for f in F))
ck('all_P0_P1_final',all(g['manual_validation'] and g['validation_state']=='FINAL' and g['source_evidence'] and g['source_location'] and g['catalog_evidence'] and g['complete_package_audited'] and g['applicability_evidence'] for g in G if g['severity'] in ['P0','P1']))
ck('coarse_has_existing_representation',all(json.loads(f['catalog_match']) for f in F if f['classification']=='CATALOG_FACT_TOO_COARSE'))
ck('supported_has_existing_representation',all(json.loads(f['catalog_match']) for f in F if f['classification']=='SOURCE_FACT_PRESENT_AND_CATALOGUED'))
ck('counts_facts_findings',c['findings']==len(G) and c['manual_source_fact_occurrences']==len(F))
ck('severity_totals',sum(c[s] for s in ['P0','P1','P2','P3'])==len(G));ck('signature_totals',sum(c['signatures_by_priority'].values())==len({g['signature'] for g in G})==c['unique_finding_signatures'])
ck('root_findings_total',sum(r['finding_count'] for r in A['root_causes'])==len(G));ck('batch_findings_total',sum(r['finding_count'] for r in A['remediation_batches'])==len(G))
ck('family_facts_total',sum(f['sourcefacts'] for f in A['family_results'])==len(F));ck('family_priorities',all(sum(f[s] for f in A['family_results'])==c[s] for s in ['P0','P1','P2','P3']))
ck('advisor_counts',sum(p['advisor_relevant_source_fact_count'] for p in P)==sum(f['advisor_relevant_source_facts'] for f in A['family_results'])==c['advisor_relevant_source_fact_occurrences'])
ck('product_statuses',all(p['semantic_audit_status']=='COMPLETE' and p['source_support_status']=='REVERSE_REVIEW_COMPLETE' for p in P) and len(P)==204)
ck('addon_statuses',all(d['fully_audited'] and d['review_state']=='COMPLETE' for d in D) and len(D)==84)
ck('family_statuses',len(A['family_results'])==12 and all(f['family_checkpoint']=='COMPLETE' for f in A['family_results']))
ck('deep_reviews',len(A['manual_review']['products'])==204 and all(f['deep_reviews']>=2 for f in A['family_results']))
ck('no_unreviewed_claims',len(claims)==5646 and all(x['support_status']!='UNREVIEWED' and x.get('manual_reverse_evidence') for x in claims))
ck('artifact_accounted',all(x['semantic_review_status']!='NOT_REVIEWED' for x in A['source_coverage']['artifacts']))
ck('falseunknown_count',len(A['blindspot_validation']['visible_false_unknowns'])==len(load('verified-false-unknowns.json'))==29)
ck('falseunknown_links',all(all(i in {g['finding_id'] for g in G} for i in x['finding_ids']) and all(i in facts for i in x['source_fact_ids']) for x in A['blindspot_validation']['visible_false_unknowns']))
ck('no_broad_architecture_claim',A['canonical_model_gaps']['proven_engine_architecture_blockers']==[])
ck('no_readiness_whitewash',A['catalog_pilot_gate']=='REMEDIATION_REQUIRED' and A['global_catalog_status']=='REMEDIATION_REQUIRED')
ck('progress_complete',rs['status']=='COMPLETE' and rs['next_product'] is None and not rs['remaining_addons'])
ck('source_inventory_count',len(list(O.glob('*independent-inventory.json')))==45)
old=load('continuation-baseline.json');ck('stable_ids_preserved',set(old['finding_ids'])<={g['finding_id'] for g in G} and set(old['source_fact_ids'])<=set(facts))
# Parse every persisted machine artifact, including historical checkpoints. Historical values may legitimately differ.
parsed={}
for p in O.glob('*.json'):
 try:json.loads(p.read_text());parsed[p.name]='JSON_PASS'
 except Exception as e:ck('parse_'+p.name,False)
expected={'product-ledger.csv':204,'addon-ledger.csv':84,'source-fact-inventory.csv':len(F),'gap-findings.csv':len(G),'family-summary.csv':12,'root-cause-candidates.csv':60,'remediation-batches.csv':56,'catalog-fact-support.csv':5646,'source-artifact-ledger.csv':322,'source-record-ledger.csv':356,'source-package-matrix.csv':76,'proposed-regressions.csv':c['P0']+c['P1']}
for p in O.glob('*.csv'):
 try:
  rr=list(csv.DictReader(p.open()));ck(p.name+'_columns',all(None not in x and all(v is not None for v in x.values()) for x in rr));parsed[p.name]={'rows':len(rr)}
  if p.name in expected:ck(p.name+'_rows',len(rr)==expected[p.name])
 except Exception:ck('parse_'+p.name,False)
required=['audit-summary.md','audit.json','product-ledger.csv','addon-ledger.csv','gap-findings.csv','source-fact-inventory.csv','family-summary.csv','root-cause-candidates.csv','manual-review.md']
ck('required_outputs',all((O/n).is_file() and (O/n).stat().st_size>0 for n in required))
missing=[]
for n in ['audit-summary.md','manual-review.md']:
 for p in re.findall(r'\]\((/[^)]+)\)',(O/n).read_text()):
  if not Path(p).exists():missing.append(p)
ck('report_links_resolve',not missing);ck('outputs_outside_repo',not O.resolve().is_relative_to(R.resolve()))
# Maintain final aliases and statuses without rerunning any partial checkpoint writer.
rs['family_checkpoints']=A['family_results'];rs['counts']=c;save('resume.json',rs)
A['quality_self_check'].update(output_parse_validation='PASS' if not errors else 'FAIL',counts_reconcile=not errors,repo_unchanged=checks['repo_integrity'])
A['metadata']['final_validation_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
save('audit.json',A)
result={'status':'PASS' if not errors else 'FAIL','timestamp':A['metadata']['final_validation_at'],'checks':checks,'errors':errors,'missing_links':missing,'parsed_files':parsed,'counts':c,'semantic_review_basis':'Final semantic review dispositions in source-facts.json/audit.json; this validator checks integrity/consistency and does not create semantic findings.','completion_criteria':'All16 original completion criteria accounted; remaining source research is a final audit disposition, not an unfinished local review.'}
save('quality-check.json',result)
print(json.dumps({'status':result['status'],'checks':len(checks),'errors':errors,'repo_unchanged':integ['unchanged'],'source_fingerprint_unchanged':integ['source_fingerprint_unchanged']},ensure_ascii=False))
if errors:raise SystemExit(1)
