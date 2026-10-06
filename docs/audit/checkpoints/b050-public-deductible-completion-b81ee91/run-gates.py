#!/usr/bin/env python3
"""Reproduce actual gates; stop on failure and retain exact compressed output."""
import gzip, hashlib, json, os, re, subprocess, sys, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
BASE='b81ee91e8693dc7962040219768283a2270cfea6'
FILES=['lib/boat-pet-catalog.ts','tests/remediation-b-050.test.mjs','tests/boat-pet-catalog.test.mjs']
def sha(b):return hashlib.sha256(b).hexdigest()
def identity():
 files={f:sha((ROOT/f).read_bytes()) for f in FILES}
 diff=subprocess.check_output(['git','diff',BASE,'--',*FILES],cwd=ROOT)
 data={'tested_base_revision':BASE,'files_sha256':files,'diff_sha256':sha(diff)}
 data['candidate_identity']=sha(json.dumps(data,sort_keys=True).encode())
 return data
manifest=sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
remediation=[p for p in manifest if re.search(r'/(?:nito-remediation|remediation)-',p) or p=='tests/b043-status-parser.test.mjs']
(OUT/'test-manifest.json').write_text(json.dumps({'all_test_files':manifest,'remediation_test_files':remediation,'discovery':'tests/*.test.mjs, each file executed individually'},indent=2)+'\n')
def run(label,cmd):
 ident=identity();start=time.monotonic();env=dict(os.environ,XDG_CONFIG_HOME='/tmp/b050-public-deductible-build-config')
 proc=subprocess.run(cmd,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 raw=proc.stdout;log=label+'.log.gz';assert not (OUT/log).exists(), 'Log labels must be unique; retain previous results';(OUT/log).write_bytes(gzip.compress(raw,mtime=0))
 result={'label':label,'command':cmd,'exit_code':proc.returncode,'duration_seconds':round(time.monotonic()-start,3),'log':log,'log_sha256':sha((OUT/log).read_bytes()),'output_sha256':sha(raw),'environment_overrides':{'XDG_CONFIG_HOME':env['XDG_CONFIG_HOME']},**ident}
 tap={k:int(m[-1]) for k in ['tests','pass','fail','cancelled','skipped','todo'] if (m:=re.findall(r'^# '+k+r' (\d+)\s*$',raw.decode(errors='replace'),re.M))}
 if tap:result['tap']=tap
 ok=proc.returncode==0 and (not tap or tap.get('fail')==0)
 if label.removeprefix('final-')=='eslint':
  reports=json.loads(raw);result['errors']=sum(x['errorCount'] for x in reports);result['warnings']=sum(x['warningCount'] for x in reports);ok=ok and result['errors']==0
 if label.removeprefix('final-')=='http-pdf-runtime':
  txt=raw.decode(errors='replace');decoder=json.JSONDecoder();report=None
  for i,c in enumerate(txt):
   if c=='{':
    try:x,_=decoder.raw_decode(txt[i:])
    except ValueError:continue
    if isinstance(x,dict) and x.get('result')=='PASS':report=x;break
  result['runtime']=report;ok=ok and report is not None
 result['status']='PASS' if ok else 'FAIL'
 p=OUT/'gate-results.json';data=json.loads(p.read_text()) if p.exists() else {'results':[]}
 data['results'].append(result);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print(label,result['status'],tap or {k:result[k] for k in ['errors','warnings'] if k in result},flush=True)
 if not ok:
  print(raw.decode(errors='replace')[-14000:],flush=True);sys.exit(1)
mode=sys.argv[1]
if mode=='targeted':
 for f in ['tests/remediation-b-050.test.mjs','tests/boat-pet-catalog.test.mjs','tests/nito-remediation-b022.test.mjs','tests/nito-remediation-b018.test.mjs','tests/remediation-b-071.test.mjs','tests/liv-reduction-selection-evidence.test.mjs']:
  run('targeted-final-'+Path(f).stem,['node','--test-reporter=tap',f])
elif mode=='full':
 for f in manifest:run('final-full-'+Path(f).stem,['node','--test-reporter=tap',f])
 for label,cmd in [('typegen',['npx','--no-install','next','typegen']),('typescript',['npx','--no-install','tsc','--noEmit','--incremental','false']),('eslint',['node','node_modules/eslint/bin/eslint.js','.','--format','json']),('production-build',['npx','--no-install','next','build','--webpack']),('http-pdf-runtime',['node','scripts/verify-analysis-http.mjs']),('diff-check',['git','diff','--check'])]:run('final-'+label,cmd)
elif mode=='audit':run('final-source-reverse-audit',['python',str(OUT/'verify-audits.py')])
else:raise SystemExit('unknown mode')
