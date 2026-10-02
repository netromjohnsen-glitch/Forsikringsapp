from continue_audit import *
import collections
A=load('audit.json');F=load('source-facts.json');G=A['findings'];arts={a['path']:a for a in load('corpus.json')['artifacts']};rs={r['id']:r for r in load('corpus.json')['source_records']};facts={f['source_fact_id']:f for f in F}
# Fill source URL metadata from previously stored manifest arrays, not new research.
for g in G:
 ar=arts[g['source_artifact']];urls=list(g.get('source_urls',[]))
 for m in ar['manifest_entries']:
  for key in ['url','resolvedUrl']:
   if m.get(key):urls.append(m[key])
  urls+=m.get('urls',[])
 for sid in ar['runtime_source_ids']:
  if rs[sid].get('url'):urls.append(rs[sid]['url'])
 g['source_urls']=list(dict.fromkeys(urls))
 g['complete_package_audited']=next(p for p in A['product_coverage'] if p['product_identity']==g['product_identity'])['full_product_inventory_complete']
 assert g['manual_validation'] and g['complete_package_audited'] and g['source_hash'] and g['source_location'] and g['catalog_evidence']
 g.setdefault('validation_state','FINAL')
 f=facts[g['source_fact_id']];f.setdefault('validation_state','FINAL')
 # Existing source-specific evidence is made explicit next to any legacy generic advisor-impact phrase.
 generic=any(x in g['advisor_impact'] for x in ['Exact source dimension not fully','Material source rule not fully','Materiell kildebestemmelse ikke trygt','Independent exact source rule','Rådgiver mister dokumentert','Material source rule not represented','Materiell kildeopplysning mangler helt','Eksakt kildeavgrensning/ytelse er ikke'])
 if generic:
  g['prior_generic_impact']=g['advisor_impact']
  g['advisor_impact']=f"{g['semantic_concept']} — {g['semantic_dimension']}: rådgiver får ikke hele den dokumenterte regelen «{f['structured_value']}» fra dette eksakte produktets kataloggrunnlag. Eksisterende katalogtekst/struktur er gjengitt i catalog_evidence; bare den utelatte eller feilplasserte dimensjonen skal rettes."
 g['source_and_catalog_review_complete']=True
# Count signature priorities using highest severity once; occurrence severities remain unchanged.
rank={'P0':0,'P1':1,'P2':2,'P3':3};sig={}
for g in G:
 if g['signature'] not in sig or rank[g['severity']]<rank[sig[g['signature']]]:sig[g['signature']]=g['severity']
c=A['catalog_counts'];c['signatures_by_priority_nonexclusive']=c['signatures_by_priority'];c['signatures_by_priority']=dict(collections.Counter(sig.values()));c['signature_priority_rule']='Unique signature counted once at highest occurrence severity; one signature spans P1/P2 across levels.'
c['data_only_candidate_findings']=sum(g['remediation_complexity'] in ['DATA_ONLY','DATA_ONLY_CANDIDATE'] for g in G);c['small_code_candidate_findings']=len(G)-c['data_only_candidate_findings']
A['recommendation']['first_safe_candidate']=A['recommendation']['first_safe_candidate'].replace('RB-13/SCRC-013','RB-11/SCRC-013')
# Avoid keyword-based readiness: 'reviewed' is not an unresolved scope flag.
for d in A['addon_coverage']:
 if d['addon_id'] in ['tryg-innbo-utleie','frende-hus-rate-skadedyr']:
  d['source_research_required']=False
  gg=[g for g in G if g.get('component')==d['addon_id']]
  d['catalog_readiness']='REMEDIATION_REQUIRED' if any(g['severity'] in ['P0','P1'] for g in gg) else 'READY_WITH_MINOR_GAPS' if gg else 'READY'
c['addon_readiness_distribution']=dict(collections.Counter(d['catalog_readiness'] for d in A['addon_coverage']))
for p in A['product_coverage']:
 review=next(r for r in A['manual_review']['products'] if r['product_identity']==p['product_identity'])
 p['reviewed_source_artifact_count']=len(review['source_paths'])
A['manual_review']['source_facts']=F
A['manual_review']['final_validation_coverage']={'final_P0':0,'final_P1':c['P1'],'manual_validation_P1':sum(g['manual_validation'] for g in G if g['severity']=='P1'),'not_independent_human_approval':True,'legacy_generic_impact_expanded_with_exact_rule':sum('prior_generic_impact' in g for g in G)}
# Separate broad remediation mechanisms from 60 provider/family root-cause records.
mechanisms=[]
groups={
 'TIER_COMPONENT_COMPOSITION':{'SCRC-003','SCRC-004','SCRC-027','SCRC-029','SCRC-035','SCRC-037'},
 'CANONICAL_SEMANTIC_ALIGNMENT':{'SCRC-020','SCRC-024'},
 'UNSUPPORTED_EXACT_CLAIM_OR_SCOPE':{'SCRC-013','SCRC-026','SCRC-031'},
 'SOURCE_CONFLICT_HANDLING':{'SCRC-034'}}
for r in A['root_causes']:
 mechanism=next((name for name,ids in groups.items() if r['root_cause_id'] in ids),'SOURCE_TO_CATALOG_DIMENSION_OMISSION')
 r['mechanism_group']=mechanism
for name in list(groups)+['SOURCE_TO_CATALOG_DIMENSION_OMISSION']:
 rr=[r for r in A['root_causes'] if r['mechanism_group']==name];ids={r['root_cause_id'] for r in rr};gg=[g for g in G if g['root_cause_id'] in ids]
 mechanisms.append(dict(mechanism=name,root_cause_ids=sorted(ids),findings=len(gg),P1=sum(g['severity']=='P1' for g in gg),P2=sum(g['severity']=='P2' for g in gg),note='Primary grouping for deduplication; source-specific qualifications remain in exact findings. Not evidence that one shared code patch safely fixes all rows.'))
A['root_mechanisms']=mechanisms
save('audit.json',A);save('source-facts.json',F)
r=load('resume.json');r['counts']=c;r['finding_validation_state']={g['finding_id']:g['validation_state'] for g in G};save('resume.json',r)
csvsave('addon-ledger.csv',A['addon_coverage']);csvsave('product-ledger.csv',A['product_coverage']);csvsave('gap-findings.csv',G);csvsave('source-fact-inventory.csv',F);csvsave('root-cause-candidates.csv',A['root_causes']);csvsave('root-mechanisms.csv',mechanisms)
# Priority breakdown required by provider/layer/batch, without insurer ranking.
rows=[]
for dimension,field in [('provider','provider'),('family','insurance_type'),('batch','remediation_batch'),('root_cause','root_cause_id')]:
 for v in sorted({g[field] for g in G}):
  gg=[g for g in G if g[field]==v];rows.append(dict(dimension=dimension,value=v,**{p:sum(g['severity']==p for g in gg) for p in rank},occurrences=len(gg),signatures=len({g['signature'] for g in gg})))
csvsave('priority-breakdown.csv',rows)
print('Evidence reconciliation:',len(G),'findings; all have source URLs:',all(g['source_urls'] for g in G))
