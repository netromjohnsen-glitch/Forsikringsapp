from continue_audit import *
import re
C=load('corpus.json');names=['bil-ansvar-alminnelige-vilkar.pdf','Bil-Pluss-alminnelige-vilkar.pdf','Bil-Kasko-alminnelige-vilkar.pdf','Bil-Delkasko-alminnelige-vilkar.pdf','Bilforsikring-Produktark-MOT01.pdf'];seen={};mapping=[]
for name in names:
 a=next(x for x in C['artifacts'] if x['name']==name);pages=json.loads((O/a['text_cache']).read_text())['pages']
 for pg in pages:
  h=digest(re.sub(r'\s+','',pg['text']));prior=seen.get(h);mapping.append(dict(source=name,page=pg['page'],normalized_text_hash=h,identical_to=prior))
  if prior is None:seen[h]=[name,pg['page']]
save('gjensidige-bil-page-identity.json',mapping)
for m in mapping:
 if m['identical_to']:print(m['source'],m['page'],'same text',m['identical_to'])
 else:print(m['source'],m['page'],'UNIQUE')
