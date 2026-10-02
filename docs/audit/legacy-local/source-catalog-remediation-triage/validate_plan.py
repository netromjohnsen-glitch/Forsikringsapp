"""Artifact integrity checks only. No application tests or repository writes."""
from triage_model import *
import sys
csv.field_size_limit(sys.maxsize)
x=json.load((OUT/'triage.json').open());base=json.load((OUT/'baseline.json').open())
checks=[]
def ck(name,ok,detail=''):
    checks.append(dict(check=name,pass_=bool(ok),detail=detail))
def readout(name):return list(csv.DictReader((OUT/name).open()))
p1=readout('p1-triage.csv');p2=readout('p2-piggyback.csv');batch=x['batches'];bby={b['batch_id']:b for b in batch}
rr=readout('root-cause-triage.csv');obr=readout('original-batch-review.csv');sr=x['source_research'];cr=x['canonical_mapping_reviews'];hr=x['human_reviews']
ck('All 1589 P1 signatures exactly once',len(p1)==len({r['signature_id'] for r in p1})==1589 and {r['signature_id'] for r in p1}==p1sigs)
ck('P1 dispositions reconcile',sum(x['counts']['P1_dispositions'].values())==1589)
ck('P1 3281 occurrences resolve',sum(int(r['P1_occurrences']) for r in p1)==3281)
ck('All 5714 findings resolve via signature',all(r['signature'] in {z['signature_id'] for z in p1+p2} for r in gaps) and len(gaps)==5714)
ck('2608 signatures disjoint P1/P2',len(p1)+len(p2)==2608 and not({r['signature_id'] for r in p1}&{r['signature_id'] for r in p2}))
ck('P2 exclusive 1019; occurrence denominator correct',len(p2)==1019 and sum(int(r['occurrence_count']) for r in p2)+sum(int(r['P2_occurrences']) for r in p1)==2433)
ck('All P1 batches exist',all(r['final_batch_id'] in bby for r in p1))
ck('One final batch per P1 signature',sum(b['P1_signature_count'] for b in batch)==1589 and len({s for b in batch for s in b['signature_ids']})==1589)
ck('P1 and batch assignment agree',all(r['signature_id'] in bby[r['final_batch_id']]['signature_ids'] for r in p1))
ck('All 60 original roots reviewed',len(rr)==60 and {r['existing_root_cause_id'] for r in rr}=={r['root_cause_id'] for r in oldroots} and all(parsed(r['final_root_cause_id']) for r in rr))
ck('All 56 original batches reviewed',len(obr)==56 and {r['original_batch_id'] for r in obr}=={r['batch_id'] for r in oldbatches})
ck('Final roots nonempty and exact refs',len(x['final_root_causes'])==114 and all((r['batch_ids'] or r.get('status')=='DEFER_POST_PILOT') and all(b in bby for b in r['batch_ids']) for r in x['final_root_causes']))
ck('Exactly 205 coherent batches',len(batch)==205 and all(b['P1_signature_count']>0 for b in batch))
ck('No cross-family generic authoring batch',all(len(b['families_affected'])==1 for b in batch if len(b['group_key'])>1))
ck('All batch exact identities in frozen ledger',all(p in prod for b in batch for p in b['products_affected']))
ck('All listed current source artifacts exist',all((REPO/e['artifact']).is_file() for b in batch for e in b['evidence']))
ck('Source hashes match baseline',all(base['repo_files'].get(e['artifact'])==e['sha256'] for b in batch for e in b['evidence']))
ck('All current authoring/conditional files exist',all((REPO/f).is_file() for b in batch for f in b['expected_production_files']+b['conditional_shared_files']))
ck('Source readiness and review prerequisites exist',all(b['canonical_review_ids'] for b in batch if b['source_readiness'] in ['CANONICAL_REVIEW_FIRST','MAPPING_REVIEW_FIRST']))
ck('Source blocked batches point to source tasks',all(b['source_task_ids'] for b in batch if b['source_readiness']=='SOURCE_RESEARCH_FIRST'))
ck('All source/review dependencies resolve',all(d in set(bby)|{t['research_task_id'] for t in sr}|{r['review_id'] for r in cr+hr} for b in batch for d in b['dependencies']))
# Graph only of actual prerequisites; review.blocks is output ownership, not a reverse prerequisite.
seen=set();active=set();cycle=[]
def dfs(v):
    if v in active:cycle.append(v);return
    if v in seen:return
    active.add(v)
    for d in bby[v]['dependencies']:
        if d in bby:dfs(d)
    active.remove(v);seen.add(v)
for b in bby:dfs(b)
ck('Batch prerequisite graph acyclic',not cycle)
ck('No dependency scheduled after dependent',all(bby[d]['wave']<=b['wave'] for b in batch for d in b['dependencies'] if d in bby))
ck('Six waves fully partition batches',len(x['waves'])==6 and sorted(b for w in x['waves'] for b in w['batch_ids'])==sorted(bby))
ck('Wave P1 counts reconcile',sum(w['P1_signatures'] for w in x['waves'])==1589)
rec=readout('source-research-reconciliation.csv')
ck('All 115 raw queue rows reconciled',len(rec)==115 and {r['raw_queue_id'] for r in rec}=={r['queue_id'] for r in rawresearch})
ck('110 open / 3 closed / 2 alias remain visible',collections.Counter(r['triage_status'] for r in rec)=={'OPEN_DEDUPLICATED':110,'CLOSED_LOCAL':3,'ALIAS_RETAINED':2})
ck('70 unique research tasks',len(sr)==len({t['research_task_id'] for t in sr})==70)
ck('Every raw open question has a task',all(parsed(r['research_task_ids']) and all(t in {s['research_task_id'] for s in sr} for t in parsed(r['research_task_ids'])) for r in rec if r['triage_status']=='OPEN_DEDUPLICATED'))
conf=readout('source-conflict-triage.csv')
ck('All 70 conflicts individually retained',len(conf)==70 and {r['conflict_id'] for r in conf}=={r['id'] for r in conflicts})
ck('Resolved and stale conflict not conflated with open',collections.Counter(r['triage_status'] for r in conf)=={'OPEN_RETAINED':68,'RESOLVED_PRESERVE_POSITIVE':1,'STALE_VERSION_NEW_IPID_REQUIRED':1})
ck('Research product scopes resolve',all(t['products'] and all(p in prod for p in t['products']) for t in sr))
ck('Historic Eika research scoped to historical products',all(prod[p]['historical']=='True' for t in sr if t['task_key']=='eika-historical-travel' for p in t['products']))
ck('No new research falsely marked performed',all(t['research_performed'] is False for t in sr))
ck('All 483 P1 review signatures covered once',len({s for r in cr for s in r['signature_ids']})==483 and sum(len(r['signature_ids']) for r in cr)==483)
ck('Canonical review backrefs correct',all(r['review_id'] in bby[b]['canonical_review_ids'] for r in cr for b in r['blocks_batches']))
ck('Five concrete domain review tasks',len(hr)==5 and all(r['question'] and r['why_model_cannot_safely_decide'] and r['source_evidence'] for r in hr))
ck('Pilot minimum includes all active P1 batches',{r['id'] for r in x['pilot_minimum_set'] if r['kind']=='batch'}=={b['batch_id'] for b in batch if any(prod[p]['historical']!='True' for p in b['products_affected'])})
ck('Only historical P1 deferred',all(all(prod[p]['historical']=='True' for p in parsed(r['products'])) for r in p1 if r['disposition']=='DEFER_SAFE'))
ck('Duplicate explicitly linked and in same batch',all(any(z['signature_id']==r['covered_by_signature'] and z['final_batch_id']==r['final_batch_id'] for z in p1) for r in p1 if r['disposition']=='DUPLICATE / COVERED_BY_OTHER_BATCH'))
ck('No active P1 exemption automatically approved',all(r['pilot_exception_accepted'].lower()=='false' for r in readout('pilot-known-limitations.csv')))
reg=readout('regression-control-registry.csv')
ck('29 verified false unknowns + overnight + 2227 positives',collections.Counter(r['kind'] for r in reg)=={'VERIFIED_FALSE_UNKNOWN':29,'EXPLICIT_MAPPING_CONTROL':1,'AUDITED_POSITIVE':2227})
ck('Customer-specific positives preserved',sum(c['classification']=='SOURCE_FACT_CUSTOMER_SPECIFIC' for c in audit['positive_controls'])==182)
reverse=readout('reverse-claim-triage.csv')
ck('8 strict unsupported / 44 semantic reverse claims retained',collections.Counter(r['registry'] for r in reverse)=={'unsupported-catalog-facts':8,'catalog-semantic-mismatches':44})
ck('All strict unsupported claims have ready batches',all(parsed(r['final_batch_ids']) and all(bby[b]['source_readiness']=='IMPLEMENTATION_READY' for b in parsed(r['final_batch_ids'])) for r in reverse if r['registry']=='unsupported-catalog-facts'))
ck('38 semantic occurrences and 5 structural gaps routed',all(r['signature'] in {z['signature_id'] for z in p1+p2} for r in gaps if r['classification'] in ['CATALOG_FACT_SEMANTICALLY_MISMAPPED','STRUCTURAL_MAPPING_GAP']) and sum(r['classification']=='CATALOG_FACT_SEMANTICALLY_MISMAPPED' for r in gaps)==38 and sum(r['classification']=='STRUCTURAL_MAPPING_GAP' for r in gaps)==5)
ck('No source-dependent boundary silently resolved',all('SC-012' in parsed(r['research_conflicts']) for r in reverse if r['claim_id'] in ['CC-01253','CC-01291']))
ck('Exact future model values only',all(b['recommended_model'] in ['GPT-6 SOL LIGHT','GPT-6 SOL MEDIUM','GPT-6 SOL HIGH','GPT-6 SOL EXTRA HIGH','GPT-6 ASTRA EXTRA HIGH'] for b in batch))
ck('Parallel file collisions explicitly recorded',all(b['parallelization_status']!='SAFE_FOR_SUBAGENT' or not b['shared_state_conflicts'] for b in batch))
ck('Customer-mode class assigned to every batch',all(b['customer_mode_impact'] in ['PRODUCT_MODE_ONLY','LIKELY_SHARED_WITH_CUSTOMER_MODE','CATALOG_ENRICHMENT_ONLY','PDF_EXTRACTION_IMPACT','UNKNOWN'] for b in batch))
ck('No inferred extraction implementation',all(b['extraction_extension_required']=='NOT_PROVEN_REQUIRED' for b in batch))
ck('First batch resolves precise source-supported issue',x['first_recommended_batch']=='B-001' and 'GAP-2361' in [e['finding_id'] for e in bby['B-001']['evidence']] and bby['B-001']['P1_signature_count']==1)
ck('All 205 batch details present',sum(1 for line in (OUT/'remediation-batches.md').read_text().splitlines() if line.startswith('## B-'))==205)
ck('Required fields present in triage.json',all(k in x for k in ['metadata','audit_baseline','input_counts','p1_dispositions','final_root_causes','final_batches','waves','source_research_tasks','human_review','canonical_review','p2_piggyback','customer_mode_impact','parallelization','model_recommendations','quality_checks','repo_integrity','recommendation','next_step']))
required=['triage-summary.md','triage.json','remediation-plan.csv','remediation-batches.md','remediation-waves.md','p1-triage.csv','root-cause-triage.csv','source-research-plan.csv','human-review-queue.csv','canonical-review-queue.csv','p2-piggyback.csv','quality-check.json','pilot-known-limitations.csv','regression-control-registry.csv','future-ci-candidates.csv']
ck('All 15 required artifacts exist and nonempty',all((OUT/f).is_file() and (OUT/f).stat().st_size>0 for f in required))
ck('Tryg Hus P2-only root explicitly preserved',any(r['original_root_cause_ids']==['SCRC-049'] and r.get('status')=='DEFER_POST_PILOT' for r in x['final_root_causes']))
ck('First batch references only the existing MC Delkasko identity',len(bby['B-001']['products_affected'])==1 and all(prod[p]['product_id']=='gjensidige-mc-delkasko' for p in bby['B-001']['products_affected']) and 'if-mc-super' not in (OUT/'pilot-known-limitations.csv').read_text())
parseerrors=[];parsedfiles=[]
for p in OUT.glob('*'):
    if p.suffix not in ['.csv','.json']:continue
    try:
        if p.suffix=='.json':json.load(p.open())
        else:
            rows=list(csv.DictReader(p.open()));assert all(None not in row for row in rows)
        parsedfiles.append(p.name)
    except Exception as e:parseerrors.append(dict(file=p.name,error=str(e)))
ck('All CSV/JSON output artifacts parse',not parseerrors,parseerrors)
# Immutable baseline check. Read tracked public/project files and frozen audit only.
def git(*args):return subprocess.check_output(['git',*args],cwd=REPO,text=True).strip()
repochanged=[p for p,h in base['repo_files'].items() if not (REPO/p).is_file() or hashlib.sha256((REPO/p).read_bytes()).hexdigest()!=h]
auditpaths={str(p.relative_to(AUDIT)) for p in AUDIT.rglob('*') if p.is_file()}
auditchanged=[p for p,h in base['audit_files'].items() if not (AUDIT/p).is_file() or hashlib.sha256((AUDIT/p).read_bytes()).hexdigest()!=h]
extraaudit=sorted(auditpaths-set(base['audit_files']))
diff=subprocess.run(['git','diff','--check'],cwd=REPO,capture_output=True,text=True)
integrity=dict(baseline_head=base['head'],final_head=git('rev-parse','HEAD'),branch=git('branch','--show-current'),working_tree=git('status','--short'),staged=git('diff','--cached','--name-only'),
 diff_check_exit=diff.returncode,diff_check_output=diff.stdout+diff.stderr,tracked_hashes_checked=len(base['repo_files']),tracked_hash_changes=repochanged,
 audit_hashes_checked=len(base['audit_files']),audit_hash_changes=auditchanged,audit_new_files=extraaudit,env_read=False,repo_mutation=False,
 git_mutation=False,web_research=False,railway_access=False,private_documents_used=False,application_tests_run=False,agents_spawned=False)
ck('HEAD and branch unchanged',integrity['final_head']==base['head']=='d3a37985fce4ada65fa2f7a88462d8834e4677af' and integrity['branch']=='main')
ck('Working tree and index clean',integrity['working_tree']==integrity['staged']=='')
ck('All 595 tracked file hashes unchanged',len(base['repo_files'])==595 and not repochanged)
ck('All 851 audit files immutable; no additions',len(base['audit_files'])==851 and not auditchanged and not extraaudit)
ck('git diff --check clean',diff.returncode==0 and not diff.stdout and not diff.stderr)
quality=dict(status='PASS' if all(r['pass_'] for r in checks) else 'FAIL',checks_passed=sum(r['pass_'] for r in checks),checks_total=len(checks),checks=checks,
 parsed_output_files=parsedfiles,scope='Planning artifact consistency/integrity only; no application validation or source truth re-audit',application_tests_run=False)
dump('repo-integrity.json',integrity);dump('quality-check.json',quality)
x['repo_integrity']=integrity;x['quality_checks']=dict(status=quality['status'],passed=quality['checks_passed'],total=quality['checks_total'],file='quality-check.json')
x['status']='TRIAGE_COMPLETE' if quality['status']=='PASS' else 'TRIAGE_PARTIAL';x['metadata']['status']=x['status']
dump('triage.json',x)
print(json.dumps(dict(status=quality['status'],passed=quality['checks_passed'],total=quality['checks_total'],failed=[r for r in checks if not r['pass_']],integrity=integrity),ensure_ascii=False,indent=2))
