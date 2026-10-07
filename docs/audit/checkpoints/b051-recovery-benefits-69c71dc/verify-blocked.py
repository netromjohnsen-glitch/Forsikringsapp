#!/usr/bin/env python3
"""Verify preserved blocked candidate; this does not grant completion or publication."""
import csv
import gzip
import hashlib
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
BASE='69c71dcc48258ba52f33a77a54126f1f065d7d7c'
read=lambda name:json.loads((OUT/name).read_text())
sha=lambda data:hashlib.sha256(data).hexdigest()
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip()==BASE
assert subprocess.check_output(['git','diff','--cached','--name-only'],cwd=ROOT)==b''
registry={r['signature_id']:r for r in csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry)==1589
exact={'292dacd4533926fd','b3b964a9c6105360','ed99577218e2302b'}
auth=read('authorization.json')
assert auth['baseline_revision']==BASE
assert {x['signature_id'] for x in auth['signatures']}==exact
for row in auth['signatures']:assert row==registry[row['signature_id']]
for entry in auth['preflight_entries']:
    assert entry['original_binding']==registry[entry['signature']]
    for source in entry['original_source_evidence']:
        assert sha((ROOT/source['artifact']).read_bytes())==source['sha256']
prior=read('prior-receipts.json')
assert len(prior)==len({x['signature'] for x in prior})==48
for row in prior:
    assert sha((ROOT/row['path']).read_bytes())==row['sha256']
    receipt=json.loads((ROOT/row['path']).read_text())
    assert receipt['signature']==row['signature'] and receipt['status']=='PASS'
for path,digest in read('historical-artifact-hashes.json').items():assert sha((ROOT/path).read_bytes())==digest,path
identity=read('application-identity.json')
assert set(identity['application_files'])==set(auth['authorized_application_files'])
for path,digest in identity['application_files'].items():assert sha((ROOT/path).read_bytes())==digest,path
assert sha(json.dumps(identity['application_files'],sort_keys=True,separators=(',',':')).encode())==identity['identity_sha256']
assert sha(subprocess.check_output(['git','diff','--','lib/gjensidige-hus-catalog.ts'],cwd=ROOT))==identity['production_diff_sha256']
results=read('gate-results.json')['results']
assert all(x['tested_revision']==BASE for x in results)
for row in results:
    log=(OUT/row['log']).read_bytes()
    assert sha(log)==row['log_sha256'] and sha(gzip.decompress(log))==row['output_sha256']
manifest=read('test-manifest.json')
assert manifest==sorted(str(p.relative_to(ROOT)) for p in (ROOT/'tests').glob('*.test.mjs'))
full=[x for x in results if x['label'].startswith('full-')]
assert len(full)==len(manifest)==151
assert sorted(x['command'][-1] for x in full)==manifest
rem=read('remediation-manifest.json')
assert rem==[p for p in manifest if 'remediation' in Path(p).name or Path(p).name=='b043-status-parser.test.mjs']
assert len(rem)==53
failed=[x for x in results if x['status']=='FAIL']
assert {x['label'] for x in failed}=={'targeted-closure-remediation-b-051-recovery-benefits','full-remediation-b-051-recovery-benefits.test'}
for x in failed:
    assert x['tap']=={'tests':115,'pass':114,'fail':1,'cancelled':0,'skipped':0}
    text=gzip.decompress((OUT/x['log']).read_bytes()).decode()
    assert 'not ok 108 - R-051-RECOVERY-source-Pluss-108' in text
    assert "error: 'utover forsikringssummen'" in text
assert all(x['tap']['cancelled']==x['tap']['skipped']==0 for x in results)
summary=read('validation-summary.json')
for name,selected in [('fullsuite',full),('remediation',[x for x in full if x['command'][-1] in rem]),('targeted',[x for x in results if x['label'].startswith('targeted-closure-')])]:
    assert summary[name]['files']==len(selected)
    for k in ['tests','pass','fail','cancelled','skipped']:assert summary[name][k]==sum(x['tap'][k] for x in selected)
assert read('harness-roots.json')==[]
assert summary['HARNESS_AUTONOMY_V1']['used']==20 and summary['HARNESS_AUTONOMY_V1']['scope_corrections']==0
assert summary['global_resolved_open']=='UNKNOWN' and summary['new_receipts']==0
assert not list(OUT.glob('receipt-*.json'))
assert read('blocker.json')['status']=='STOPPED_BEFORE_UNAUTHORIZED_CORRECTION'
assert read('checkpoint.json')['documented_campaign_count']==48
subprocess.run(['node',str(OUT/'catalog-audit.mjs')],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
for line in (OUT/'SHA256SUMS').read_text().splitlines():
    digest,path=line.split('  ',1)
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    assert sha((ROOT/path).read_bytes())==digest,path
for name in ['README.md','authorization.md']:
    assert b'\r' not in (OUT/name).read_bytes()
subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
subprocess.run(['git','diff','--cached','--check'],cwd=ROOT,check=True)
print('PASS: blocked candidate identity, exact bindings,48 unchanged receipts, historical evidence, sources,151-file manifest,53-file remediation manifest, recorded failure, checksums, staged0 and both diff checks. No completion or publication authorized by this verification.')
