"""Revision/candidate-bound checked gate runner; immutable compressed logs."""
import gzip, hashlib, json, os, re, subprocess, sys, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
BASE='8422e39214aadff2dd31292e84ee4ca9cf818b30'
sha=lambda b:hashlib.sha256(b).hexdigest()
APP=sorted(set(subprocess.check_output(['git','diff','--name-only'],cwd=ROOT).decode().splitlines()+subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT).decode().splitlines()))
APP=[p for p in APP if p.startswith(('lib/','tests/'))]
def run(label,command):
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip()==BASE
    files={p:sha((ROOT/p).read_bytes()) for p in APP if (ROOT/p).exists()}
    source_contract_sha256=sha((OUT/'source-oracle.json').read_bytes())
    identity=sha(json.dumps(files,sort_keys=True).encode())
    env=dict(os.environ,XDG_CONFIG_HOME='/tmp/rv02-b071-build-config')
    env['PATH']='/Users/morten/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin:'+env['PATH']
    started=time.monotonic()
    p=subprocess.run(command,cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    assert files=={f:sha((ROOT/f).read_bytes()) for f in files}
    path=OUT/(label+'.log.gz');assert not path.exists()
    path.write_bytes(gzip.compress(p.stdout,mtime=0))
    txt=p.stdout.decode(errors='replace')
    tap={k:int(m[-1]) for k in ['tests','pass','fail','cancelled','skipped'] if (m:=re.findall(r'^# '+k+r' (\d+)\s*$',txt,re.M))}
    ok=p.returncode==0 and not tap.get('fail',0) and not tap.get('cancelled',0)
    result={'label':label,'command':command,'tested_HEAD':BASE,'source_contract_sha256':source_contract_sha256,'application_files':files,'application_identity_sha256':identity,'exit_code':p.returncode,'seconds':round(time.monotonic()-started,3),'tap':tap,'log':path.name,'log_sha256':sha(path.read_bytes()),'original_output_sha256':sha(p.stdout),'environment_overrides':{'XDG_CONFIG_HOME':env['XDG_CONFIG_HOME'],'PATH':env['PATH']}}
    if label.startswith('eslint'):
        reports=json.loads(txt);result.update(errors=sum(r['errorCount']for r in reports),warnings=sum(r['warningCount']for r in reports));ok=ok and result['errors']==0
    if label.startswith('http-pdf-runtime'):
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
    paths=['tests/canonical-comparison-audit.test.mjs', 'tests/catalog-comparison.test.mjs', 'tests/catalog-effective-facts.test.mjs', 'tests/catalog-enrichment-provenance.test.mjs', 'tests/catalog-matching.test.mjs', 'tests/catalog-source-resolution.test.mjs', 'tests/coverage-status.test.mjs', 'tests/document-catalog-precedence.test.mjs', 'tests/gjensidige-hus-catalog.test.mjs', 'tests/manual-runtime-flow.test.mjs', 'tests/nito-remediation-b020.test.mjs', 'tests/nito-remediation-wave1.test.mjs', 'tests/presentation-catalog.test.mjs', 'tests/product-catalog-evidence-hardening.test.mjs', 'tests/product-catalog.test.mjs', 'tests/remediation-b-051-craftsmanship.test.mjs', 'tests/remediation-b-051-events-buildings.test.mjs', 'tests/remediation-b-051-garden.test.mjs', 'tests/remediation-b-051-health-help.test.mjs', 'tests/remediation-b-051-house-origin.test.mjs', 'tests/remediation-b-051-legal-priority.test.mjs', 'tests/remediation-b-051-legal.test.mjs', 'tests/remediation-b-051-liability.test.mjs', 'tests/remediation-b-051-manual-rental-choice.test.mjs', 'tests/remediation-b-051-manual-smart-choice.test.mjs', 'tests/remediation-b-051-physical-exclusions.test.mjs', 'tests/remediation-b-051-recovery-benefits.test.mjs', 'tests/remediation-b-051-rental-selection.test.mjs', 'tests/remediation-b-051-rot-status.test.mjs', 'tests/remediation-b-051-rot.test.mjs', 'tests/remediation-b-051-settlement-age.test.mjs', 'tests/remediation-b-051-smart-selection.test.mjs', 'tests/remediation-b-051-smart.test.mjs', 'tests/remediation-b-051-water.test.mjs', 'tests/remediation-b-051.test.mjs', 'tests/supporting-terms.test.mjs', 'tests/remediation-b-130-vacancy.test.mjs', 'tests/remediation-b-130-frost.test.mjs']
    assert all((ROOT/p).is_file() for p in paths)
    commands=[('targeted',['node','--test','--test-reporter=tap',*paths])]
elif mode=='single':
    commands=[('frost',['node','--test','--test-reporter=tap','tests/remediation-b-130-frost.test.mjs'])]
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
    ok=run(label+'-'+(sys.argv[2] if len(sys.argv)>2 else 'final'),command);results.append(ok)
    if not ok:break
sys.exit(0 if all(results) else 1)
