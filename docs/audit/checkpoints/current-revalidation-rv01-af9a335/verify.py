#!/usr/bin/env python3
"""Verify durable CURRENT_REVALIDATION evidence, not historic global closure."""
import csv,gzip,hashlib,json,re,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
def sha(data):return hashlib.sha256(data).hexdigest()
def load(name):return json.loads((HERE/name).read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def main():
    summary=load('summary.json');revision=summary['tested_revision'];assert summary['classification']=='CURRENT_REVALIDATION'
    expected={'0a6b5f6f535df685','1f56c194d413f97d','8e9d297cb0d1bd0e'};assert set(summary['revalidated_signatures'])==expected
    registry={r['signature_id']:r for r in csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())};assert len(registry)==1589
    results=load('gate-results.json')['results'];assert all(r['test_revision']==revision for r in results)
    labels={r['label']:r for r in results};assert [r['label'] for r in results if r['status']=='FAIL']==['typescript']
    for r in results:
        raw=(HERE/'logs'/r['log']).read_bytes();assert sha(raw)==r['log_sha256'];data=gzip.decompress(raw);assert sha(data)==r['stdout_sha256']
        if 'tap' in r:
            assert r['exit_code']==0 and r['tap']['pass']==r['tap']['tests'] and r['tap']['tests']>0
            assert all(r['tap'][k]==0 for k in ['fail','skipped','cancelled','todo'])
    expected_tests={Path(p).stem for p in git('ls-tree','-r','--name-only',revision,'tests').decode().splitlines() if p.startswith('tests/') and p.count('/')==1 and p.endswith('.test.mjs')}
    assert {r['label'] for r in results if 'tap' in r}==expected_tests and len(expected_tests)==145
    assert sum(r['tap']['tests'] for r in results if 'tap' in r)==3875
    for name in ['next-typegen','typescript-retry','eslint','production-build','http-pdf-runtime','diff-check']:assert labels[name]['status']=='PASS' and labels[name]['exit_code']==0
    assert labels['eslint']['errors']==0 and labels['http-pdf-runtime']['runtime_checks']==22
    for source in load('source-audit.json')['sources']:assert sha((ROOT/source['path']).read_bytes())==source['expected_sha256']==source['actual_sha256']
    assert load('catalog-before.json')==load('catalog-after.json')
    policy=load('campaign-policy.json');assert policy['scope_mechanical_roots_used']==policy['campaign_mechanical_roots_used']==1
    roots=list(csv.DictReader((HERE/'prospective-root-ledger.csv').open()));assert len(roots)==1 and roots[0]['root_id']=='M01_NEXT_TYPEGEN_PRECONDITION'
    for sig in expected:
        receipt=load('receipt-'+sig+'.json');assert receipt['status']=='PASS' and receipt['classification']=='CURRENT_REVALIDATION' and receipt['tested_revision']==revision
        assert receipt['original_registry_binding']==registry[sig] and not receipt['global_accounting_change']
        assert receipt['contract_test_blob_sha256']==sha(git('show',revision+':tests/remediation-b-050.test.mjs'))
    assert summary['global_current_resolved']==summary['global_current_open']=='UNKNOWN'
    subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
    print('PASS: 3 exact CURRENT_REVALIDATION receipts; 145 files/3875 tests; no global closure inference')
if __name__=='__main__':main()
