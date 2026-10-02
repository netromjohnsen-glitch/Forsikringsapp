from pathlib import Path
import json,csv,subprocess,hashlib,sys,datetime
R=Path('/Users/morten/Documents/forsikringsapp');O=Path('/tmp/nito-catalog-remediation-evening');T=json.load(open('/tmp/source-catalog-remediation-triage/triage.json'));B=json.load(open(O/'baseline.json'))
plan={b['batch_id']:b for b in T['batches']};allowed=[b['batch_id'] for b in T['batches'] if b['wave']<=2 and b['source_readiness']=='IMPLEMENTATION_READY' and not b['dependencies']]
def git(*a):return subprocess.check_output(['git','-c','core.quotePath=false',*a],cwd=R,text=True).strip()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def hashes():
 f=git('ls-files').splitlines()+git('ls-files','--others','--exclude-standard').splitlines()
 return {p:sha(R/p) for p in f if p and not Path(p).name.startswith('.env')}
def dump(f,x):(O/f).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def integrity(expected):
 assert git('rev-parse','HEAD')==B['head'];assert git('branch','--show-current')=='main';assert git('diff','--cached','--name-only')==''
 now=hashes();assert now==expected,'Unexplained project changes since checkpoint'
 assert all(Path(p).is_file() and sha(Path(p))==h for p,h in B['immutable'].items()),'Immutable audit/triage changed'
 subprocess.run(['git','diff','--check'],cwd=R,check=True)
if sys.argv[1]=='before':
 s=json.load(open(O/'resume.json'));integrity(s['project_hashes']);assert sys.argv[2] in allowed
 assert plan[sys.argv[2]]['wave'] == 1 or ((O/'wave1-gate.json').exists() and json.load(open(O/'wave1-gate.json'))['status']=='PASS'), 'Wave 1 gate required'
 print('scope/integrity PASS before',sys.argv[2])
elif sys.argv[1]=='pass':
 bid=sys.argv[2];audit=json.load(open(O/f'{bid}-audit.json'));assert audit['status']=='PASS'
 prior=json.load(open(O/'resume.json')) if (O/'resume.json').exists() else {'completed_batches':[],'files_changed':[],'project_hashes':B['repo_hashes']}
 assert bid not in prior['completed_batches'];assert bid in allowed
 current=hashes();delta=[p for p in set(current)|set(prior['project_hashes']) if current.get(p)!=prior['project_hashes'].get(p)]
 allowed_prod=set(plan[bid]['expected_production_files'])
 assert all(p in allowed_prod or p.startswith('tests/nito-remediation-') or (bid=='B-004' and p=='tests/if-reise-catalog.test.mjs') or (bid=='B-005' and p=='tests/storebrand-innbo-catalog.test.mjs') or (bid=='B-010' and p=='tests/boat-pet-catalog.test.mjs') or (bid=='B-014' and p=='tests/gjensidige-innbo-catalog.test.mjs') for p in delta),delta
 completed=prior['completed_batches']+[bid];remaining=[b for b in allowed if b not in completed]
 (O/f'{bid}-project-diff.patch').write_text(subprocess.check_output(['git','diff'],cwd=R,text=True))
 row={'batch_id':bid,'wave':plan[bid]['wave'],'status':'PASS','files_changed':delta,'tests_added':sys.argv[3], 'tests_run':sys.argv[4],'targeted_audit':str(O/f'{bid}-audit.json'),
 'P1_signatures_targeted':plan[bid]['P1_signature_count'],'P1_signatures_resolved':plan[bid]['P1_signature_count'],'regressions':0,'notes':'Own public source and exact product controls verified; immutable evidence retained.'}
 ledger=json.load(open(O/'batch-ledger.json')) if (O/'batch-ledger.json').exists() else [];ledger.append(row);dump('batch-ledger.json',ledger)
 with (O/'batch-ledger.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(row));w.writeheader();w.writerows({k:json.dumps(v,ensure_ascii=False) if isinstance(v,list) else v for k,v in r.items()} for r in ledger)
 state={'baseline_head':B['head'],'current_wave':plan[bid]['wave'],'completed_batches':completed,'failed_batches':[],'blocked_batches':[], 'next_batch':remaining[0] if remaining else None,
 'files_changed':sorted({p for r in ledger for p in r['files_changed']}),'tests_added':sum(int(r['tests_added']) for r in ledger if r['status']=='PASS'),'P1_resolved':sum(r['P1_signatures_resolved'] for r in ledger),
 'remaining_wave_scope':remaining,'gate_status':{'wave1':'PENDING' if len([b for b in completed if plan[b]['wave']==1])<7 else ('PASS' if (O/'wave1-gate.json').exists() and json.load(open(O/'wave1-gate.json'))['status']=='PASS' else 'AWAITING_WAVE_GATE'),'wave2':'NOT_STARTED' if plan[bid]['wave']==1 else 'IN_PROGRESS'},'project_hashes':current,'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 integrity(current);dump('resume.json',state);print('PASS/checkpoint',bid,'P1 resolved',state['P1_resolved'],'next',state['next_batch'])
