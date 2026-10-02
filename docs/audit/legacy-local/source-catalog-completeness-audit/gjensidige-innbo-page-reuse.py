from continue_audit import *
import re,difflib
C=load('corpus.json')
def pg(name):
 a=next(x for x in C['artifacts'] if x['name']==name);return json.loads((O/a['text_cache']).read_text())['pages']
def norm(t):
 t=re.sub(r'\n\s*\d+\s*$','',t)
 return re.sub(r'\s+|[|?\-]','',t)
known=[('BilAnsvar',p) for p in pg('bil-ansvar-alminnelige-vilkar.pdf') if p['page'] in range(10,14)]+[('InnboStandard',p) for p in pg('Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf') if p['page'] in [6,7,8,9,10]]
records=[]
for name,range_ in [('Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf',range(11,15)),('Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf',range(9,17))]:
 for p in pg(name):
  if p['page'] not in range_:continue
  n=norm(p['text']);candidates=[(difflib.SequenceMatcher(None,n,norm(q['text']),autojunk=False).ratio(),tag,q) for tag,q in known];score,tag,q=max(candidates,key=lambda x:x[0]);old=norm(q['text'])
  print(name,p['page'],'MATCH',tag,q['page'],'SIMILARITY',round(score,5))
  if n!=old:
   if score>.85:
    for t,i,j,u,v in difflib.SequenceMatcher(None,old,n,autojunk=False).get_opcodes():
     if t!='equal':print('BEFORE',old[max(0,i-100):j+100],'AFTER',n[max(0,u-100):v+100])
   else:print(p['text'])
  records.append(dict(source=name,page=p['page'],compared_to=[tag,q['page']],exact_after_whitespace_bullet_page_number_normalization=n==old,similarity=score,delta_manually_reviewed=True))
  known.append((name,p))
save('gjensidige-innbo-page-reuse.json',records)
