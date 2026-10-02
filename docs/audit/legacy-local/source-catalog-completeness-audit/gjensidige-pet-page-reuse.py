from continue_audit import *
import re
c=load('corpus.json');reviews=load('audit.json')['manual_review']['products'];done={p for r in reviews if r.get('full_product_inventory_complete') for p in r.get('source_paths',[])}
def norm(t):return re.sub(r'\s+','',re.sub(r'\s*\d+\s*$','',t))
prior={}
for a in c['artifacts']:
 if a['path'] in done and a['path'].endswith('.pdf'):
  for p in load(a['text_cache'])['pages']:prior.setdefault(norm(p['text']),[]).append({'path':a['path'],'page':p['page']})
rows=[]
for a in c['artifacts']:
 if not any('/boat-pet/gjensidige-'+x+'-' in a['path'] for x in ['dog','cat']) or not a['path'].endswith('.pdf'):continue
 for p in load(a['text_cache'])['pages']:
  match=prior.get(norm(p['text']),[]);rows.append(dict(path=a['path'],page=p['page'],exact_normalized_reuse=match,requires_read=not bool(match)))
print('TOTAL',len(rows),'REUSE',sum(not x['requires_read'] for x in rows))
for path in dict.fromkeys(x['path'] for x in rows):print(path,'READ',[x['page'] for x in rows if x['path']==path and x['requires_read']],'REUSE',[x['page'] for x in rows if x['path']==path and not x['requires_read']])
save('gjensidige-pet-page-reuse.json',{'method':'exacttext only whitespace/footerpagenumberremoved; no semantic equivalence inferred; priorfullcompletedsourcecontextchecked','rows':rows})
