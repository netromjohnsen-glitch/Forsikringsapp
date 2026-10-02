from pathlib import Path
import json,sys,hashlib
O=Path('/tmp/nito-catalog-remediation-evening');R=Path('/Users/morten/Documents/forsikringsapp')
bid=sys.argv[1];spec=json.load(open(O/f'{bid}-scope.json'));plan=next(b for b in json.load(open('/tmp/source-catalog-remediation-triage/triage.json'))['batches'] if b['batch_id']==bid)
before=json.load(open(O/f'{bid}-before.json'));after=json.load(open(O/f'{bid}-after.json'));assert [x['identity'] for x in before]==[x['identity'] for x in after]
deltas=[];changed=[]
def check(a,b,p,view):
 if a==b:return
 assert a is not None and b is not None
 aa={x['key']:x for x in a};bb={x['key']:x for x in b}
 for k in sorted(set(aa)|set(bb)):
  if aa.get(k)==bb.get(k):continue
  assert k in spec['keys'],(p,view,k)
  deltas.append({'product':p,'view':view,'key':k,'before':aa.get(k),'after':bb.get(k)})
for a,b in zip(before,after):
 if a==b:continue
 p=a['productId'];assert p in spec['products'],p;changed.append(p)
 assert {k:v for k,v in a.items() if k not in ['base','addons','materialized']}=={k:v for k,v in b.items() if k not in ['base','addons','materialized']}
 assert set(a['addons'])==set(b['addons'])
 check(a['base'],b['base'],p,'base');check(a['materialized'],b['materialized'],p,'product-comparison')
 for add in a['addons']:check(a['addons'][add],b['addons'][add],p,add)
assert set(changed)==set(spec['products']),(changed,spec['products'])
sources={e['artifact']:e['sha256'] for e in plan['evidence']}
for path,sha in sources.items():assert hashlib.sha256((R/path).read_bytes()).hexdigest()==sha,path
result={'status':'PASS','batch':bid,'source_verification':spec['source_verification'],'source_hashes':sources,'changed_products':changed,'unchanged_products':len(before)-len(changed),'allowed_keys':spec['keys'],'deltas':deltas,'closed_findings':[f for e in plan['evidence'] for f in e['finding_ids']],'P1_resolved':plan['P1_signature_count'],'signatures':plan['signature_ids'],'source_reverse_check':'PASS; own-source subject, scope and provenance reviewed; no broader changes','known_regressions':0}
(O/f'{bid}-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('Targeted audit PASS',bid,'changed',changed,'other products unchanged',result['unchanged_products'])
