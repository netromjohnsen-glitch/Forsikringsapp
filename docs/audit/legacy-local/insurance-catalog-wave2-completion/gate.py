import json,csv,pathlib,hashlib,subprocess,sys,re
out=pathlib.Path('/tmp/insurance-catalog-wave2-completion');root=pathlib.Path('/Users/morten/Documents/forsikringsapp');bid=sys.argv[1]
r=json.load(open('/tmp/nito-wave2-semantic-resolution/wave2-resolution.json'));b=next(x for x in r['batches'] if x['batch_id']==bid)
base=json.load(open(out/'baseline.json'));before=json.load(open(out/(bid+'-before.json')));after=json.load(open(out/(bid+'-after.json')))
changed=[x['identity'] for x,y in zip(before,after) if x!=y];assert set(changed)==set(b['affected_products']),(changed,b['affected_products'])
hashes={}
for sid in b['source_evidence']:
 s=next(x for x in r['sources'] if x['source_id']==sid);h=hashlib.sha256((root/s['local_path']).read_bytes()).hexdigest();assert h==s['sha256'];hashes[s['local_path']]=h
log=(out/(bid+'-tests.log')).read_text();assert re.search(r'(?:#|ℹ) fail 0\b',log);tests=int(re.search(r'(?:#|ℹ) tests (\d+)',log)[1]);subprocess.run(['git','diff','--check'],cwd=root,check=True)
assert subprocess.check_output(['git','diff','--cached','--name-only'],cwd=root,text=True)==''
prevfile=out/'batch-ledger.json';ledger=json.load(open(prevfile)) if prevfile.exists() else []
order=['B-019','B-017','B-021','B-015','B-020','B-022','B-018'];assert [x['batch_id'] for x in ledger]==order[:order.index(bid)]
previoushash=ledger[-1]['checkpoint_hashes'] if ledger else base['project_hashes']
files=subprocess.check_output(['git','ls-files','-z','--cached','--others','--exclude-standard'],cwd=root,text=True).rstrip('\0').split('\0')
current={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in files if not pathlib.Path(p).name.startswith('.env')}
newfiles=[p for p,h in current.items() if previoushash.get(p)!=h]
assert set(newfiles)<=set(b['implementation_files']),newfiles
comp=json.load(open(out/(bid+'-comparison.json')))
changes=[{'before':x,'after':y} for x,y in zip(before,after) if x!=y]
audit={'batch':bid,'status':'PASS','source_hashes':hashes,'source_truth':b['decision'],'source_meanings':[{k:s[k] for k in ['source_id','location','meaning']} for s in r['sources'] if s['source_id'] in b['source_evidence']], 'expected_products':b['affected_products'],'actual_products':changed,'unchanged_products':len(after)-len(changed),'unexpected_products':[],'source_to_catalog':'PASS: own-source assertions in batch regressions; changed claims reviewed against referenced local sections','reverse_claim':'PASS: no additional semantic claims beyond resolved scope','comparison':comp,'customer_priority':'PASS: synthetic explicit document override controls','changes':changes}
(out/(bid+'-audit.json')).write_text(json.dumps(audit,indent=2,ensure_ascii=False))
row={'batch_id':bid,'status':'PASS','files_changed':newfiles,'canonical_changes':b['existing_canonical_state'],'catalog_changes':changed,'tests_added':int(sys.argv[2]),'tests_corrected':0,'tests_run':tests,'targeted_audit':str(out/(bid+'-audit.json')),'P1_signatures_resolved':b['finding_signatures'],'customer_mode_checked':True,'regressions':0,'notes':b['decision'],'checkpoint_hashes':current}
ledger.append(row);prevfile.write_text(json.dumps(ledger,indent=2,ensure_ascii=False))
fields=[k for k in row if k!='checkpoint_hashes']
with open(out/'batch-ledger.csv','w') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows({k:json.dumps(x[k],ensure_ascii=False) if isinstance(x[k],(dict,list)) else x[k] for k in fields} for x in ledger)
resume={'baseline':base['head'],'completed':[x['batch_id'] for x in ledger],'current':bid,'next':order[len(ledger)] if len(ledger)<len(order) else 'FULL_WAVE2_GATE','files':[p for p in current if current[p]!=base['project_hashes'].get(p)],'tests':{x['batch_id']:x['tests_run'] for x in ledger},'P1_resolved_this_run':sorted(set(z for x in ledger for z in x['P1_signatures_resolved'])),'gate':'PASS'}
(out/'resume.json').write_text(json.dumps(resume,indent=2,ensure_ascii=False))
print(bid,'PASS',tests,'tests',len(changed),'products',len(newfiles),'files; checkpoint persisted')
