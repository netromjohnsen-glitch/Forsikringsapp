from pathlib import Path
import sys,json,hashlib
R=Path('/Users/morten/Documents/forsikringsapp');O=Path('/tmp/source-catalog-completeness-audit')
for arg in sys.argv[1:]:
 name,_,span=arg.partition('@');matches=list((R/'catalog').rglob(name))
 if len(matches)!=1:print(name,'MATCHES',[str(x) for x in matches]);continue
 p=matches[0];h=hashlib.sha256(p.read_bytes()).hexdigest();cache=O/'text'/f'{h}.json'
 if not cache.exists():print('NOT PARSED YET',p);continue
 d=json.loads(cache.read_text());sel=None
 if span:
  if '-' in span:lo,hi=map(int,span.split('-'));sel=range(lo,hi+1)
  else:sel=[int(span)]
 print('\nARTIFACT',p.relative_to(R),'SHA256',h,'TOTAL_PAGES',len(d['pages']))
 for page in d['pages']:
  if sel is None or page['page'] in sel:print('PAGE',page['page'],'\n'+page['text'])
