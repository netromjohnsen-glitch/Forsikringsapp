import json,csv,pathlib,hashlib,subprocess,collections,re
out=pathlib.Path('/tmp/insurance-catalog-wave2-completion');root=pathlib.Path('/Users/morten/Documents/forsikringsapp');base=json.load(open(out/'baseline.json'))
def jwrite(name,value): (out/name).write_text(json.dumps(value,ensure_ascii=False,indent=2))
def csvwrite(name,rows,fields=None):
 with open(out/name,'w') as f:
  fields=fields or list(rows[0]);w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
  for row in rows:w.writerow({k:json.dumps(row.get(k),ensure_ascii=False) if isinstance(row.get(k),(dict,list)) else row.get(k,'') for k in fields})
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
paths=subprocess.check_output(['git','ls-files','-z','--cached','--others','--exclude-standard'],cwd=root,text=True).rstrip('\0').split('\0')
hashes={p:sha(root/p) for p in paths if not pathlib.Path(p).name.startswith('.env')}
changed=[p for p,h in hashes.items() if h!=base['project_hashes'].get(p)]
allowed=['lib/storebrand-reise-catalog.ts','lib/fremtind-reise-catalog.ts','lib/insurance-normalization.ts','lib/catalog-enrichment.ts','tests/nito-remediation-wave2.test.mjs'];assert set(changed)==set(allowed)
inputs={}
for d in ['source-catalog-completeness-audit','source-catalog-remediation-triage','nito-catalog-remediation-evening','nito-wave2-semantic-resolution']:
 for p in pathlib.Path('/tmp',d).rglob('*'):
  if p.is_file():inputs[str(p)]=sha(p)
assert inputs==base['input_hashes']
head=subprocess.check_output(['git','rev-parse','HEAD'],text=True,cwd=root).strip();branch=subprocess.check_output(['git','branch','--show-current'],text=True,cwd=root).strip();staged=subprocess.check_output(['git','diff','--cached','--name-only'],text=True,cwd=root).strip()
assert head==base['head'] and branch==base['branch'] and not staged
check=subprocess.run(['git','diff','--check'],cwd=root,capture_output=True,text=True);assert check.returncode==0
status=subprocess.check_output(['git','status','--short'],cwd=root,text=True);(out/'final-git-status.txt').write_text(status)
(out/'run-project.diff').write_text(subprocess.check_output(['git','diff','--',*allowed[:-1]],cwd=root,text=True))
# The previous run's resolved set is reconstructed from successful batches, not a count subtraction.
prior=json.load(open('/tmp/nito-catalog-remediation-evening/resume.json'))['completed_batches'];plan=list(csv.DictReader(open('/tmp/source-catalog-remediation-triage/remediation-plan.csv')));triage=list(csv.DictReader(open('/tmp/source-catalog-remediation-triage/p1-triage.csv')))
all_p1={r['signature_id'] for r in triage};prior_ids={s for row in plan if row['batch_id'] in prior for s in json.loads(row['signature_ids'])}&all_p1
assert len(prior_ids)==21
ledger=json.load(open(out/'batch-ledger.json'));new_ids={s for row in ledger for s in row['P1_signatures_resolved']};assert not (prior_ids&new_ids)
resolved=prior_ids|new_ids;remaining=all_p1-resolved;assert len(all_p1)==1589 and len(remaining)==1567
p1={'original':1589,'previous_resolved':sorted(prior_ids),'resolved_this_run':sorted(new_ids),'cumulative_resolved':sorted(resolved),'remaining':len(remaining),'remaining_by_disposition':dict(collections.Counter(r['disposition'] for r in triage if r['signature_id'] in remaining)),'deferred_historical_not_resolved':[r['signature_id'] for r in triage if r['signature_id'] in remaining and 'HISTOR' in r['disposition'].upper()]};jwrite('p1-accounting.json',p1)
diagnostics=[{'batch':'B-019','test':'audit fingerprint harness','classification':'TEST_HARNESS_ERROR','original_failure':'FileNotFoundError from Git-quoted non-ASCII path','evidence':'git ls-files pathname quoting; source file exists; 76 tests PASS','correction':'Use git ls-files -z and NUL split; no production/test assertion changed','rerun':'PASS: checkpoint written'},
 {'batch':'B-017','test':'precise Reise labels map only in Reise','classification':'PRODUCTION_MAPPING_FAILURE','original_failure':'Returned forsinket fremmøte sum instead of reise.forsinkelse.fremmote_sum','evidence':'Duplicate reise object keys at insurance-normalization.ts:49 and :114; later object overwrites new aliases','correction':'NONE: STOP under user rule 11','rerun':'NOT_RUN'},
 {'batch':'B-017','test':'aktive reisegods forsinkelse leiebil og sykdomsfakta følger nytt vilkår','classification':'EXISTING_EXPECTATION_CONFLICT_WITH_APPROVED_SPLIT','original_failure':'Expected /6 000.*ubegrenset/ on generic reise.forsinkelse.rute','evidence':'Approved B-017 removes amounts from broad framework and places them in precise child keys; original test line118 expects prior combined semantics','correction':'NONE: no existing test modified; batch stopped for independent production mapping failure','rerun':'NOT_RUN'}]
csvwrite('test-diagnostics.csv',diagnostics)
resolution=json.load(open('/tmp/nito-wave2-semantic-resolution/wave2-resolution.json'));byid={b['batch_id']:b for b in resolution['batches']};order=['B-019','B-017','B-021','B-015','B-020','B-022','B-018']
ledger[0]['tests_corrected']=0;ledger[0]['audit_harness_corrections']=1
for bid in order[1:]:
 b=byid[bid];attempted=bid=='B-017'
 ledger.append({'batch_id':bid,'status':'FAIL' if attempted else 'BLOCKED','files_changed':b['implementation_files'] if attempted else [],'canonical_changes':'No new concepts; attempted existing-key aliases overwritten' if attempted else 'NOT_STARTED','catalog_changes':b['affected_products'] if attempted else [],'tests_added':8 if attempted else 0,'tests_corrected':0,'tests_run':'136/138 PASS; 2 FAIL; 0 skipped' if attempted else 'NOT_RUN','targeted_audit':'SOURCE_HASH_VERIFIED; complete audit NOT_REACHED' if attempted else 'NOT_RUN','P1_signatures_resolved':[],'customer_mode_checked':'B-017 synthetic document controls pass; full batch FAIL' if attempted else False,'regressions':'1 production mapping failure; 1 old expectation conflict' if attempted else 'NOT_EVALUATED','notes':'STOP: duplicate reise alias property; retain failed changes for review' if attempted else 'Not started after B-017 stop'})
jwrite('batch-ledger.json',ledger);csvwrite('batch-ledger.csv',ledger,[k for k in ledger[0] if k not in ['checkpoint_hashes']])
jwrite('resume.json',{'status':'INSURANCE_CATALOG_WAVE2_BLOCKED','baseline':base['head'],'prior_completed':prior,'completed_this_run':['B-019'],'last_pass_checkpoint':'B-019','current':'B-017','next':'B-017 requires explicit authorization to repair production mapping failure; then gate before B-021','failed_test_names':[x['test'] for x in diagnostics[1:]],'files_changed_this_run':changed,'current_project_hashes':hashes,'preserve_failed_edits':True,'do_not_auto_restore':True,'P1_resolved_this_run':sorted(new_ids),'wave2_gate':'NOT_RUN','wave3':'NOT_STARTED'})
csvwrite('canonical-change-register.csv',[{'batch':bid,'status': 'NOT_STARTED','new_concepts':'; '.join({'B-015':['flytting.tyveri_skadeverk.grense'],'B-020':['hus.skadedyr.dyr.*','hus.skadedyr.insekter.*'],'B-022':['katt.bruksverdi.*']}[bid]),'implemented':False} for bid in ['B-015','B-020','B-022']])
csvwrite('mapping-change-register.csv',[
 {'batch':'B-019','key':'reise.overnatting','status':'PASS','change':'Explicit Storebrand Standard/Super term using product FAQ; existing key'},
 {'batch':'B-017','key':'reise.forsinkelse.rute / fremmote_sum / avgang_sum','status':'FAIL','change':'Scoped catalog split present; new type aliases overwritten by duplicate reise property; broad document overlap guard present, not approved'},
 {'batch':'B-021','key':'reise.forsinkelse.fremmote_sum / avgang_sum','status':'NOT_STARTED','change':'None'}])
csvwrite('inheritance-change-register.csv',[{'batch':'B-019','status':'PASS','change':'Super inherits one common overnatting term; all other resolved facts unchanged'},{'batch':'B-020','status':'NOT_STARTED','change':'None'}])
csvwrite('addon-selection-change-register.csv',[{'batch':bid,'status':'NOT_STARTED','change':'No metadata, inference or component-placement edits'} for bid in ['B-022','B-018']])
before=json.load(open(out/'B-019-before.json'));after=json.load(open(out/'B-019-after.json'));failed=json.load(open(out/'B-017-after-failed-gate.json'))
changed_pass=[a['identity'] for a,b in zip(before,after) if a!=b];changed_attempt=[a['identity'] for a,b in zip(after,failed) if a!=b]
assert set(changed_attempt)==set(byid['B-017']['affected_products'])
old=json.load(open('/tmp/nito-catalog-remediation-evening/final-catalog.json'));assert old==before
jwrite('affected-products.json',{'B-019':{'status':'PASS','expected':byid['B-019']['affected_products'],'actual':changed_pass,'unchanged':202},'B-017':{'status':'FAILED_GATE_UNAPPROVED','expected':byid['B-017']['affected_products'],'actual':changed_attempt,'unchanged':203},'current_run_total_changed':3,'current_run_total_unchanged':201,'unexpected':[]})
ex=[]
for pid in ['storebrand-reise-standard','storebrand-reise-super']:
 a=next(p for p in before if p['productId']==pid);b=next(p for p in after if p['productId']==pid)
 ex.append({'productId':pid,'before':{'key':'reise.overnatting','facts':[f for f in a['base'] if f['key']=='reise.overnatting'],'state':'unknown'},'after':{'key':'reise.overnatting','facts':[f for f in b['base'] if f['key']=='reise.overnatting'],'state':'included term'},'all_other_base_facts_identical':[f for f in a['base'] if f['key']!='reise.overnatting']==[f for f in b['base'] if f['key']!='reise.overnatting']})
jwrite('B-019-before-after.json',ex)
quality={'status':'INSURANCE_CATALOG_WAVE2_BLOCKED','all_seven_accounted_for':True,'execution_order_respected':True,'dependencies_respected':True,'all_pass_have_tests_and_audit':True,'canonical_extension_batches_not_started':True,'P1_counts_reconciled':True,'unexpected_project_mutations':[],'unexpected_product_changes':[],'new_alias_mapping_gate':'FAIL','full_wave2_gate':'NOT_RUN','test_outputs_parse':True,'tests':{'B-019':{'tests':76,'pass':76,'fail':0,'skipped':0},'B-017':{'tests':138,'pass':136,'fail':2,'skipped':0},'new_tests_added':12,'new_tests_edited_after_failure':0,'new_test_failures':1,'old_test_failures':1,'audit_harness_corrections':1,'flaky_reruns':0},'typescript':'NOT_RUN_AFTER_STOP','lint':'NOT_RUN_AFTER_STOP','webpack':'NOT_RUN_AFTER_STOP','synthetic_runtime':'NOT_RUN_AFTER_STOP','head_unchanged':True,'branch':'main','staged_files':0,'diff_check':'PASS','prior_work_preserved':True,'immutable_input_files_verified':len(inputs),'immutable_inputs_unchanged':True,'sources_and_manifests_unchanged':True,'source_hashes_targeted_verified':3,'env_read_or_changed':False,'railway_accessed':False,'commit_push_deploy':False,'wave3':'NOT_STARTED','catalog_pilot_gate':'REMEDIATION_REQUIRED'}
jwrite('quality-check.json',quality);jwrite('final-integrity.json',{'head':head,'branch':branch,'staged_files':0,'changed_this_run':changed,'source_mutations':[],'immutable_input_hashes':inputs,'project_hashes':hashes,'git_diff_check':'PASS','git_status':status})
print(json.dumps({k:v for k,v in quality.items() if k not in ['tests']},indent=2));print('P1 disposition counts:',p1['remaining_by_disposition']);print('current changes:',changed)
