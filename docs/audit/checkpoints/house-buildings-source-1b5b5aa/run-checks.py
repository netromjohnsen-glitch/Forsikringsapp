import pathlib,json,gzip,subprocess,os,time,re,sys,hashlib
root=pathlib.Path(__file__).resolve().parents[4];d=pathlib.Path(__file__).resolve().parent
old=json.loads((root/'docs/audit/checkpoints/b130-person-scope-cfada9a/test-manifest.json').read_text())
# Use the exact previous combined revalidation file list, with the new contract when present.
prior=json.loads(gzip.decompress((root/'docs/audit/checkpoints/house-foundation-revalidation-1b5b5aa/evidence.json.gz').read_bytes()))['existing_test_run']
mode=sys.argv[1];name=sys.argv[2] if len(sys.argv)>2 else mode
files=prior['command'][3:]
if mode=='targeted' and (root/'tests/remediation-house-buildings-source.test.mjs').exists():files+=['tests/remediation-house-buildings-source.test.mjs']
if mode=='fullsuite':files=sorted(str(p.relative_to(root)) for p in (root/'tests').glob('*.test.mjs'))
command=['node','--test','--test-reporter=tap',*files]
env=os.environ.copy();env['PATH']='/Users/morten/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin:'+env['PATH']
t=time.monotonic();p=subprocess.run(command,cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);text=p.stdout.decode(errors='replace');log=name+'.log.gz';(d/log).write_bytes(gzip.compress(p.stdout,mtime=0))
tap={k:int(re.findall(r'^# '+k+r' (\d+)\s*$',text,re.M)[-1]) for k in ['tests','pass','fail','cancelled','skipped'] if re.findall(r'^# '+k+r' (\d+)\s*$',text,re.M)}
report={'base_HEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip(),'candidate_is_uncommitted':True,'command':command,'environment_override':{'PATH_prefix':'installed Poppler bin'},'test_files':len(files),'exit_code':p.returncode,'seconds':round(time.monotonic()-t,2),'tap':tap,'log':log,'log_sha256':hashlib.sha256((d/log).read_bytes()).hexdigest(),'not_ok_lines':re.findall(r'^not ok .+$',text,re.M)}
(d/(name+'.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:report[k] for k in ['test_files','exit_code','seconds','tap','not_ok_lines']}));sys.exit(p.returncode)
