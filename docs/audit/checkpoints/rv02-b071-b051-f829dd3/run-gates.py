#!/usr/bin/env python3
"""Current-revision revalidation gates; independent retained logs, checked exits."""
import gzip,hashlib,json,os,re,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
BASE='f829dd3dba2ad8a5dbb0d0d9eb584be83f428f2e'
sha=lambda b:hashlib.sha256(b).hexdigest()
def run(label,command):
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip()==BASE
 start=time.monotonic(); env=dict(os.environ,XDG_CONFIG_HOME='/tmp/rv02-b071-build-config')
 p=subprocess.run(command,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 path=OUT/(label+'.log.gz');assert not path.exists();path.write_bytes(gzip.compress(p.stdout,mtime=0))
 text=p.stdout.decode(errors='replace');tap={k:int(m[-1]) for k in ['tests','pass','fail','cancelled','skipped'] if (m:=re.findall(r'^# '+k+r' (\d+)\s*$',text,re.M))}
 result={'label':label,'command':command,'tested_revision':BASE,'exit_code':p.returncode,'duration_seconds':round(time.monotonic()-start,3),'tap':tap,'log':path.name,'log_sha256':sha(path.read_bytes()),'output_sha256':sha(p.stdout),'environment_overrides':{'XDG_CONFIG_HOME':env['XDG_CONFIG_HOME']}}
 ok=p.returncode==0 and not tap.get('fail',0) and not tap.get('cancelled',0)
 if label=='eslint':
  reports=json.loads(text);result['errors']=sum(x['errorCount'] for x in reports);result['warnings']=sum(x['warningCount'] for x in reports);ok=ok and not result['errors']
 if label=='http-pdf-runtime':
  decoder=json.JSONDecoder();report=None
  for i,c in enumerate(text):
   if c=='{':
    try: x,_=decoder.raw_decode(text[i:])
    except ValueError:continue
    if isinstance(x,dict) and x.get('result')=='PASS':report=x;break
  result['runtime']=report;ok=ok and report is not None
 result['status']='PASS' if ok else 'FAIL';f=OUT/'gate-results.json';d=json.loads(f.read_text()) if f.exists() else {'results':[]};d['results'].append(result);f.write_text(json.dumps(d,indent=2)+'\n')
 if not ok: print(label,'FAIL',text[-12000:],flush=True);sys.exit(1)
 print(label,'PASS',tap,flush=True)
mode=sys.argv[1]
if mode=='targeted':
 for n in ['remediation-b-071','nito-remediation-b018','nito-remediation-b022','nito-remediation-b020','remediation-b-050','remediation-b-072','liv-reduction-selection-evidence','supporting-terms','catalog-enrichment-provenance','coverage-status','insurance-normalization','catalog-comparison','product-comparison-hardening','product-comparison','manual-agreement','boat-pet-catalog','gjensidige-hus-catalog']:
  run('targeted-recovered-'+n,['node','--test-reporter=tap','tests/'+n+'.test.mjs'])
elif mode=='full':
 manifest=sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
 (OUT/'test-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 remediation=[p for p in manifest if 'remediation' in Path(p).name or Path(p).name=='b043-status-parser.test.mjs']
 (OUT/'remediation-manifest.json').write_text(json.dumps(remediation,indent=2)+'\n')
 for path in manifest:run('full-'+Path(path).stem,['node','--test-reporter=tap',path])
elif mode=='quality':
 for l,c in [('typegen',['npx','--no-install','next','typegen']),('typescript',['npx','--no-install','tsc','--noEmit','--incremental','false']),('eslint',['node','node_modules/eslint/bin/eslint.js','.','--format','json']),('production-build',['npx','--no-install','next','build','--webpack']),('http-pdf-runtime',['node','scripts/verify-analysis-http.mjs']),('diff-check',['git','diff','--check'])]:run(l,c)
else:raise SystemExit('targeted/full/quality')
