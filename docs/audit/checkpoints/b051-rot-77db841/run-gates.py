from pathlib import Path
import sys,json,hashlib
R=Path('/workspace/Forsikringsapp');O=R/'docs/audit/checkpoints/b051-rot-77db841'
source=R/'docs/audit/checkpoints/b051-physical-exclusions-0be8fad/run-final-gates.py'
text=source.read_text();prefix=text.split('mode=sys.argv[1]')[0]
ns={'__file__':str(source),'__name__':'existing_runner_reused'};exec(compile(prefix,str(source),'exec'),ns)
auth=json.loads((O/'authorization.json').read_text());app=[f for f in auth['allowed_files'] if f.startswith(('lib/','tests/'))]+[str((O/'proposal.json').relative_to(R))]
ns.update(ROOT=R,OUT=O,BASE=auth['baseline'],APP=app)
mode=sys.argv[1]
names=['nito-remediation-b020','remediation-b-050','remediation-b-051',*[f'remediation-b-051-{n}' for n in ['garden','events-buildings','craftsmanship','settlement-age','recovery-benefits','physical-exclusions']]]
if mode=='baseline':
 names+=['remediation-b-051-liability','gjensidige-hus-catalog']
 commands=[('baseline-'+n,['node','--test-reporter=tap','tests/'+n+'.test.mjs'])for n in names]
elif mode=='targeted':
 names=['remediation-b-051-rot','remediation-b-051-legal','remediation-b-051-smart','remediation-b-051-health-help','remediation-b-051-liability',*names,'nito-remediation-wave1','remediation-b-071','nito-remediation-b018','nito-remediation-b022','remediation-b-072','liv-reduction-selection-evidence','supporting-terms','catalog-enrichment-provenance','coverage-status','insurance-normalization','catalog-comparison','product-comparison-hardening','product-comparison','manual-agreement','boat-pet-catalog','gjensidige-hus-catalog']
 commands=[('final-targeted-'+n,['node','--test-reporter=tap','tests/'+n+'.test.mjs'])for n in names]
elif mode=='full':
 manifest=sorted(str(p.relative_to(R))for p in (R/'tests').glob('*.test.mjs'))
 rem=[p for p in manifest if 'remediation' in Path(p).name or Path(p).name=='b043-status-parser.test.mjs']
 for name,data in [('test-manifest.json',manifest),('remediation-manifest.json',rem)]: (O/name).write_text(json.dumps(data,indent=2)+'\n')
 commands=[('full-'+Path(p).stem,['node','--test-reporter=tap',p])for p in manifest]
elif mode=='quality':commands=[('typegen',['npx','--no-install','next','typegen']),('typescript',['npx','--no-install','tsc','--noEmit','--incremental','false']),('eslint',['node','node_modules/eslint/bin/eslint.js','.','--format','json']),('production-build',['npx','--no-install','next','build','--webpack']),('http-pdf-runtime',['node','scripts/verify-analysis-http.mjs']),('diff-check',['git','diff','--check'])]
else:raise ValueError(mode)
ns['os'].environ['ROT_PROBE_RESULT_FILE']='/tmp/rot-final-probes.json'
params={'existing_runner':str(source.relative_to(R)),'existing_runner_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'reuse':'Original run function before hardcoded mode dispatch, BASE/OUT/APP overridden explicitly in memory; historical runner/output unchanged','baseline':auth['baseline'],'output':str(O.relative_to(R)),'application_files':app}
p=O/'runner-parameters.json'
if p.exists():assert json.loads(p.read_text())==params
else:p.write_text(json.dumps(params,indent=2)+'\n')
results=[]
for label,command in commands:
 ok=ns['run'](label,command);results.append(ok)
 if not ok and mode=='quality':break
sys.exit(0 if all(results)else 1)
