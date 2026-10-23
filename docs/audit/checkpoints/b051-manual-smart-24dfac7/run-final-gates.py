"""Revision/candidate-bound checked gate runner; immutable compressed logs."""
import gzip, hashlib, json, os, re, subprocess, sys, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
BASE='24dfac79717f3efeab7302ce4fa8010de64da3d2'
sha=lambda b:hashlib.sha256(b).hexdigest()
APP=['lib/hus-smart-selection.ts', 'lib/manual-agreement.ts', 'lib/catalog-enrichment.ts', 'lib/comparison.ts', 'tests/remediation-b-051-manual-smart-choice.test.mjs', 'tests/remediation-b-051-smart-selection.test.mjs', 'tests/remediation-b-051-smart.test.mjs', 'tests/remediation-b-051-rot-status.test.mjs']
def run(label,command):
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip()==BASE
    files={p:sha((ROOT/p).read_bytes()) for p in APP if (ROOT/p).exists()}
    identity=sha(json.dumps(files,sort_keys=True).encode())
    env=dict(os.environ,XDG_CONFIG_HOME='/tmp/rv02-b071-build-config')
    started=time.monotonic()
    p=subprocess.run(command,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    assert files=={f:sha((ROOT/f).read_bytes()) for f in files}
    path=OUT/(label+'.log.gz');assert not path.exists()
    path.write_bytes(gzip.compress(p.stdout,mtime=0))
    txt=p.stdout.decode(errors='replace')
    tap={k:int(m[-1]) for k in ['tests','pass','fail','cancelled','skipped'] if (m:=re.findall(r'^# '+k+r' (\d+)\s*$',txt,re.M))}
    ok=p.returncode==0 and not tap.get('fail',0) and not tap.get('cancelled',0)
    result={'label':label,'command':command,'tested_HEAD':BASE,'application_files':files,'application_identity_sha256':identity,'exit_code':p.returncode,'seconds':round(time.monotonic()-started,3),'tap':tap,'log':path.name,'log_sha256':sha(path.read_bytes()),'original_output_sha256':sha(p.stdout),'environment_overrides':{'XDG_CONFIG_HOME':env['XDG_CONFIG_HOME']}}
    if label=='eslint':
        reports=json.loads(txt);result.update(errors=sum(r['errorCount']for r in reports),warnings=sum(r['warningCount']for r in reports));ok=ok and result['errors']==0
    if label=='http-pdf-runtime':
        decoder=json.JSONDecoder();report=None
        for i,c in enumerate(txt):
            if c=='{':
                try:x,_=decoder.raw_decode(txt[i:])
                except ValueError:continue
                if isinstance(x,dict) and x.get('result')=='PASS':report=x;break
        result['runtime']=report;ok=ok and report is not None
    result['status']='PASS' if ok else 'FAIL'
    f=OUT/'gate-results.json';data=json.loads(f.read_text()) if f.exists() else {'results':[]}
    data['results'].append(result);f.write_text(json.dumps(data,indent=2)+'\n')
    print(label,result['status'],tap,flush=True)
    if not ok: print(txt[-4500:],flush=True)
    return ok

mode=sys.argv[1]
if mode=='targeted':
    paths=['tests/remediation-b-051-manual-smart-choice.test.mjs','tests/remediation-b-051-smart-selection.test.mjs','tests/remediation-b-051-smart.test.mjs','tests/remediation-b-051-rot-status.test.mjs','tests/remediation-b-051-legal-priority.test.mjs']
    assert all((ROOT/p).is_file() for p in paths)
    commands=[('targeted',['node','--test','--test-reporter=tap',*paths])]
elif mode=='full':
    paths=sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
    (OUT/'test-manifest.json').write_text(json.dumps(paths,indent=2)+'\n')
    commands=[('fullsuite',['node','--test','--test-reporter=tap',*paths])]
elif mode=='quality':
    commands=[('typegen',['npx','--no-install','next','typegen']),('typescript',['npx','--no-install','tsc','--noEmit','--incremental','false']),('eslint',['node','node_modules/eslint/bin/eslint.js','.','--format','json']),('production-build',['npx','--no-install','next','build','--webpack']),('diff-check',['git','diff','--check'])]
elif mode=='runtime':
    commands=[('http-pdf-runtime',['node','scripts/verify-analysis-http.mjs'])]
else:raise SystemExit('targeted/full/quality/runtime')
results=[]
for label,command in commands:
    ok=run(label,command);results.append(ok)
    if not ok:break
sys.exit(0 if all(results) else 1)
