#!/usr/bin/env python3
"""Verify this exact candidate/completion evidence; never infer global closure."""
import csv,gzip,hashlib,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
def sha(data):return hashlib.sha256(data).hexdigest()
def load(name):return json.loads((HERE/name).read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def main():
    receipt=load('receipt-3f4b9eff50404590.json');summary=load('summary.json');policy=load('campaign-policy.json')
    assert receipt['signature']=='3f4b9eff50404590' and receipt['status']=='PASS'
    assert receipt['gap_ids']==['GAP-2869'] and receipt['sf_ids']==['SF-4018']
    registry={r['signature_id']:r for r in csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
    assert receipt['original_binding']==registry[receipt['signature']]
    for path,h in receipt['candidate_files_sha256'].items():assert sha((ROOT/path).read_bytes())==h
    assert sha(git('diff','--binary',receipt['tested_base_revision'],'--',*receipt['candidate_files_sha256']))==receipt['candidate_diff_sha256']
    assert sha((ROOT/receipt['source']['path']).read_bytes())==receipt['source']['sha256']
    gates=load('gate-results.json')['results'];assert all(r['status']=='PASS' and r['exit_code']==0 for r in gates)
    for r in gates:
        assert r['candidate_identity']==receipt['tested_candidate_identity'] and r['candidate_files_sha256']==receipt['candidate_files_sha256']
        compressed=(HERE/'logs'/r['log']).read_bytes();assert sha(compressed)==r['log_sha256'] and sha(gzip.decompress(compressed))==r['stdout_sha256']
    tests=[r for r in gates if 'tap' in r];assert len(tests)==145 and sum(r['tap']['tests'] for r in tests)==3883
    assert all(r['tap']['pass']==r['tap']['tests'] and all(r['tap'][k]==0 for k in ['fail','skipped','cancelled','todo']) for r in tests)
    names={r['label']:r for r in gates}
    assert names['remediation-b-050.test']['tap']['tests']==32
    for label in ['next-typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']:assert label in names
    assert names['eslint']['errors']==0 and names['http-pdf-runtime']['runtime_checks']==22
    audit=load('source-reverse-audit.json');assert audit['allOtherFactsAndCatalogMetadataUnchanged'] and audit['baseline_catalog_sha256']==audit['restored_catalog_sha256']
    assert audit['changedKeys']==['dyr.veterinar.sum.valgbar'] and audit['changedComponents']==['gjensidige-hund-behandling']
    members=load('campaign-signature-set.json')['members'];assert len({m['signature'] for m in members})==4
    for m in members:
        if m['classification']=='PRIOR_CURRENT_REVALIDATION':assert sha((ROOT/m['receipt']).read_bytes())==m['receipt_sha256']
    assert policy['scope_used']==3 and policy['campaign_used']==4
    roots=list(csv.DictReader((HERE/'prospective-root-ledger.csv').open()));assert len(roots)==4 and len({r['root_id'] for r in roots})==4
    assert not policy['historic_20_exception']['used'] and not policy['historic_20_exception']['booked']
    assert summary['global_current_resolved']==summary['global_current_open']=='UNKNOWN' and not receipt['global_arithmetic_change']
    subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
    print('PASS: exact sum-choice completion; candidate hashes, gate logs and campaign four-signature set verified; global accounting UNKNOWN')
if __name__=='__main__':main()
