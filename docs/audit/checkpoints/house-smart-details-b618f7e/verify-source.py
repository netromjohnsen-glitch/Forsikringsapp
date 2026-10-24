from pathlib import Path
from html.parser import HTMLParser
import json,csv,io,gzip,hashlib,subprocess
r=Path.cwd();s=Path('/tmp/house-smart-details-checked');base='b618f7ecdb9fb99ea74ba0581b37ead8a406fd78';h=lambda b:hashlib.sha256(b).hexdigest()
class P(HTMLParser):
 def __init__(self):super().__init__();self.t=[];self.skip=0
 def handle_starttag(self,t,a):
  if t in ['script','style']:self.skip+=1
 def handle_endtag(self,t):
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,x):
  if not self.skip:self.t.append(x)
sources=[]
for file,sha in [('Hus-Smart-produktside.html','a9fcfb36a45ff72352913882955d26fe119b57427532562be1634f274855c530'),('Hus-Smart-alarmvilkar.html','ac113a34392ed290b3a2cac50ebb18fae44bbecf301db0ca1ce253794b969414')]:
 path='catalog/sources/gjensidige/hus/'+file;b=(r/path).read_bytes();assert h(b)==sha and subprocess.check_output(['git','show',base+':'+path])==b;p=P();p.feed(b.decode());text=' '.join(' '.join(p.t).split());sources.append({'path':path,'sha256':sha,'full_text':text,'registered_source_id':'gjensidigeHusSmartTerms' if 'alarmvilkar' in file else 'gjensidigeHusSmart'})
terms=sources[1]['full_text'];sections={}
for a,b in [('1.4 Utstyr','1.5'),('1.7','1.8'),('7. Kundens plikter','8. Flytting'),('8. Flytting og overføring av kontrakten','9. Selskapets ansvar'),('10. Varighet og oppsigelse','11. App'),('12. Priser','13. Bilder')]:
 start=terms.rfind(a);end=terms.find(b,start+len(a));assert start>=0 and end>start,(a,b);sections[a]=terms[start:end].strip()

o=json.loads((r/"docs/audit/checkpoints/house-smart-details-b618f7e/source-oracle.json").read_text());assert sources==o["sources"]["sources"];assert sections==o["sources"]["term_sections"];print(json.dumps({"source_hashes_and_full_HTML_text":"PASS","complete_term_sections":len(sections)}))
