from continue_audit import *
import re
S=load('corpus.json');arts={Path(x['path']).name:x for x in S['artifacts']}
def pages(n):return load(arts[n]['text_cache'])['pages']
def norm(t):return re.sub(r'[\s|]+','',t)
prior=['Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf','Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf','bil-ansvar-alminnelige-vilkar.pdf']
known={norm(p['text']):(n,p['page']) for n in prior for p in pages(n)};out={}
for n in ['Hus-Standard-alminnelige-vilkar.pdf','Hus-Pluss-alminnelige-vilkar.pdf']:
 out[n]=[]
 for p in pages(n):
  k=norm(p['text']);r={'page':p['page'],'exact_normalized_reuse':known.get(k),'sha256':hashlib.sha256(k.encode()).hexdigest()};out[n].append(r)
  if n.startswith('Hus-Standard'):known[k]=(n,p['page'])
save('gjensidige-hus-page-reuse.json',out)
for n,rr in out.items():print(n,[(r['page'],r['exact_normalized_reuse']) for r in rr])
