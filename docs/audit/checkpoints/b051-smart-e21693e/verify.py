from pathlib import Path
import json,hashlib,sys
sys.dont_write_bytecode=True
O=Path(__file__).resolve().parent;R=O.parents[3];p=json.loads((O/'verification-parameters.json').read_text());source=R/p['origin'];s=source.read_text();assert hashlib.sha256(source.read_bytes()).hexdigest()==p['origin_sha256']
for r in p['replacement_operations']:
 assert s.count(r['before'])==1,r['before'];s=s.replace(r['before'],r['after'])
for path in p['import_paths']:sys.path.insert(0,str(R/path))
ns={'__file__':str(O/'scoped-verifier.py'),'__name__':'__main__'}
exec(compile(s,str(source),'exec'),ns)
