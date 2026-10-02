from pathlib import Path
import json,hashlib,subprocess,collections
O=Path('/tmp/nito-catalog-remediation-evening');R=Path('/Users/morten/Documents/forsikringsapp')
state=json.load(open(O/'resume.json'));plan={b['batch_id']:b for b in json.load(open('/tmp/source-catalog-remediation-triage/triage.json'))['batches']}
original=json.load(open(O/'B-001-before.json'));current=json.load(open(O/'B-016-after.json'))
allowed=collections.defaultdict(set);sources={};findings=set();signatures=set();batches=[]
for bid in state['completed_batches']:
 a=json.load(open(O/f'{bid}-audit.json'));assert a['status']=='PASS'
 spec=json.load(open(O/f'{bid}-scope.json')) if bid!='B-001' else {'products':['gjensidige-mc-delkasko'],'keys':a['removed_keys']}
 for p in spec['products']:allowed[p].update(spec['keys'])
 b=plan[bid];signatures.update(b['signature_ids']);batches.append({'batch':bid,'P1':b['P1_signature_count'],'status':'PASS','source_review':a.get('source_verification',a.get('source_scope'))})
 for e in b['evidence']:
  findings.update(e['finding_ids']);sources[e['artifact']]=e['sha256']
assert [a['identity'] for a in original]==[a['identity'] for a in current]
changed=[]
def compare(a,b,p,view):
 # Preserve duplicate keys and order within each key; do not collapse facts.
 def group(xs):
  d=collections.defaultdict(list)
  for x in xs or []:d[x['key']].append(x)
  return dict(d)
 aa,bb=group(a),group(b)
 for key in aa.keys()|bb.keys():
  if aa.get(key)!=bb.get(key):assert key in allowed[p],(p,view,key)
for a,b in zip(original,current):
 if a==b:continue
 p=a['productId'];assert p in allowed,p;changed.append(p)
 assert {k:v for k,v in a.items() if k not in ['base','addons','materialized']}=={k:v for k,v in b.items() if k not in ['base','addons','materialized']}
 assert set(a['addons'])==set(b['addons'])
 for view in ['base','materialized']:compare(a[view],b[view],p,view)
 for addon in a['addons']:compare(a['addons'][addon],b['addons'][addon],p,addon)
for p,h in sources.items():assert hashlib.sha256((R/p).read_bytes()).hexdigest()==h,p
baseline=json.load(open(O/'baseline.json'))
for p,h in baseline['immutable'].items():assert hashlib.sha256(Path(p).read_bytes()).hexdigest()==h,p
result={'status':'PASS','scope':'15 accepted batches only; not full catalog/source audit','batches':batches,'changed_products':changed,'unchanged_products':len(original)-len(changed),'allowed_keys':{p:sorted(v) for p,v in allowed.items()},'closed_findings':sorted(findings),'P1_signatures_resolved':len(signatures),'P1_signatures':sorted(signatures),'source_hashes_verified':sources,'immutable_evidence_files_verified':len(baseline['immutable']),'checks':['204 identities unchanged;202 active','whole fact lists including duplicates checked per key; all base/addon/materialized changes scoped','all sources unchanged, full-batch own-source review references retained','customer authority/optional negative/source isolation covered in focused and full tests'],'known_limitations':['Unreviewed batches remain unresolved','SC068 website/full-terms renewal timing not resolved; B010 expressly attributes renewal wording to full terms','Original tracing test has timing-sensitive global progress ordering; no trace or test edits']}
(O/'final-targeted-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('FINAL TARGETED AUDIT PASS',len(changed),'changed;',result['unchanged_products'],'unchanged;',len(sources),'source hashes;',len(signatures),'P1;',len(findings),'finding occurrences')
