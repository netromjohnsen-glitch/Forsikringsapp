from continue_audit import *
import sys
name=sys.argv[1];a=next(x for x in load('corpus.json')['artifacts'] if x['path'].endswith('/'+name) and '/gjensidige/hus/' in x['path']);ls=load(a['text_cache'])['pages'][0]['text'].splitlines();lo=int(sys.argv[2]) if len(sys.argv)>2 else 1;hi=int(sys.argv[3]) if len(sys.argv)>3 else len(ls)
print(a['path'],'lines',len(ls))
for i,l in enumerate(ls,1):
 if lo<=i<=hi:print(i,l)
