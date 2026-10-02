from pathlib import Path
from collections import defaultdict,Counter
import json,hashlib,concurrent.futures,datetime
from html.parser import HTMLParser
from pypdf import PdfReader
R=Path('/Users/morten/Documents/forsikringsapp');O=Path('/tmp/source-catalog-completeness-audit');(O/'text').mkdir(exist_ok=True)
C=json.loads((O/'catalog.json').read_text())
def sha(b):return hashlib.sha256(b).hexdigest()
paths=sorted(p for p in (R/'catalog').rglob('*') if p.suffix.lower() in ['.pdf','.html'])
arts=[{'path':str(p.relative_to(R)),'name':p.name,'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size,'format':p.suffix[1:],'manifest_entries':[],'runtime_source_ids':[]} for p in paths]
byname=defaultdict(list);byhash=defaultdict(list)
for a in arts:byname[a['name']].append(a);byhash[a['sha256']].append(a)
manifest_issues=[];manifests=[]
for p in (R/'catalog').rglob('*manifest.json'):
 d=json.loads(p.read_text());manifests.append({'path':str(p.relative_to(R)),'sha256':sha(p.read_bytes())})
 for key in ['documents','sources','artifacts']:
  for e in d.get(key,[]):
   if not isinstance(e,dict) or not e.get('sha256'):continue
   local=e.get('localPath');name=e.get('filename',e.get('name',''))
   candidates=[a for a in arts if a['path']==local] if local else byname[name]
   if len(candidates)!=1:
    candidates=[a for a in candidates if a['sha256']==e['sha256']]
   if not candidates:manifest_issues.append({'manifest':str(p.relative_to(R)),'entry':e,'reason':'ARTIFACT_NOT_RESOLVED'})
   for a in candidates:
    a['manifest_entries'].append({'manifest':str(p.relative_to(R)),**e})
    if a['sha256']!=e['sha256']:manifest_issues.append({'artifact':a['path'],'reason':'SOURCE_INTEGRITY_FAILURE'})
source_records=[]
for sid,s in C['sources'].items():
 cand=byname[Path(s['filename']).name]
 if s.get('sha256'):cand=[a for a in cand if a['sha256']==s['sha256']]
 source_records.append({'id':sid,**s,'artifact_paths':[a['path'] for a in cand],'link_status':'RESOLVED' if cand else 'UNRESOLVED'})
 for a in cand:a['runtime_source_ids'].append(sid)
class ExtractHTML(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag in ['script','style','noscript','svg']:self.skip+=1
  elif tag in ['p','div','section','article','h1','h2','h3','h4','li','tr','td','th','br']:self.parts.append('\n')
 def handle_endtag(self,tag):
  if tag in ['script','style','noscript','svg']:self.skip=max(0,self.skip-1)
  elif tag in ['p','div','li','tr','h1','h2','h3','h4']:self.parts.append('\n')
 def handle_data(self,d):
  if not self.skip:self.parts.append(d)
def parse(item):
 h,group=item; a=group[0];target=O/'text'/f'{h}.json'
 if target.exists():return json.loads(target.read_text())
 try:
  if a['format']=='pdf':
   reader=PdfReader(R/a['path']); pages=[{'page':i+1,'text':p.extract_text(extraction_mode='layout')} for i,p in enumerate(reader.pages)]
  else:
   x=ExtractHTML();x.feed((R/a['path']).read_text(errors='replace'));pages=[{'page':None,'text':'\n'.join(' '.join(l.split()) for l in ''.join(x.parts).splitlines() if l.strip())}]
  result={'sha256':h,'path':a['path'],'pages':pages,'characters':sum(len(p['text']) for p in pages),'status':'PARSED'}
 except Exception as e:result={'sha256':h,'path':a['path'],'pages':[],'characters':0,'status':'UNREADABLE','error':type(e).__name__}
 target.write_text(json.dumps(result,ensure_ascii=False));
 (O/'text'/f'{h}.txt').write_text('\n'.join(f"=== PAGE {p['page']} ===\n{p['text']}" for p in result['pages']))
 return result
parsed=list(concurrent.futures.ThreadPoolExecutor(max_workers=4).map(parse,byhash.items()))
parse_byhash={p['sha256']:p for p in parsed}
for a in arts:
 p=parse_byhash[a['sha256']];a.update(parse_status=p['status'],pages=len(p['pages']),characters=p['characters'],text_cache='text/'+a['sha256']+'.json',semantic_review_status='PENDING')
out={'artifacts':arts,'source_records':source_records,'manifests':manifests,'manifest_issues':manifest_issues,'counts':{'artifacts':len(arts),'unique_hashes':len(byhash),'duplicate_paths':len(arts)-len(byhash),'pdf':sum(a['format']=='pdf' for a in arts),'html':sum(a['format']=='html' for a in arts),'unique_pdf_pages':sum(len(p['pages']) for p in parsed if p['path'].endswith('.pdf')),'parsed':sum(p['status']=='PARSED' for p in parsed),'unreadable':sum(p['status']!='PARSED' for p in parsed),'empty':sum(p['characters']<50 for p in parsed),'runtime_source_records':len(source_records),'unresolved_source_records':sum(s['link_status']=='UNRESOLVED' for s in source_records),'integrity_failures':sum(x['reason']=='SOURCE_INTEGRITY_FAILURE' for x in manifest_issues)},'source_corpus_sha256':sha(json.dumps([(a['path'],a['sha256']) for a in arts]+[(m['path'],m['sha256']) for m in manifests],sort_keys=True).encode())}
(O/'corpus.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out['counts'],indent=2));print('unresolved',[(s['id'],s['filename']) for s in source_records if s['link_status']=='UNRESOLVED']);print('manifest issues',manifest_issues)
