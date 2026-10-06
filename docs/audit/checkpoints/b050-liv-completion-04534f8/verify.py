#!/usr/bin/env python3
"""Verify this exact Liv completion, not global historical closure."""
import csv, gzip, hashlib, json, re, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
def sha(b): return hashlib.sha256(b).hexdigest()
def load(path): return json.loads(path.read_text())
def main():
    for line in (HERE/'SHA256SUMS').read_text().splitlines():
        h,p=line.split('  ',1);assert sha((ROOT/p).read_bytes())==h,p
    identity=load(HERE/'candidate-identity.json');gates=load(HERE/'gate-results.json')
    assert all(r['status']=='PASS' and r['exit_code']==0 for r in gates['results'])
    for p,h in identity['candidate_files_sha256'].items():assert sha((ROOT/p).read_bytes())==h,p
    diff=subprocess.check_output(['git','diff','--binary',identity['tested_base_revision'],'--',*identity['candidate_files_sha256']],cwd=ROOT)
    assert sha(diff)==identity['candidate_diff_sha256']
    for r in gates['results']:
        assert r['candidate_identity']==identity['candidate_identity'] and r['candidate_files_sha256']==identity['candidate_files_sha256']
        packed=(HERE/'logs'/r['log']).read_bytes();raw=gzip.decompress(packed)
        assert sha(packed)==r['log_sha256'] and sha(raw)==r['stdout_sha256']
        if 'tap' in r:
            for k,n in r['tap'].items():assert int(re.search(rb'^# '+k.encode()+rb' (\d+)\s*$',raw,re.M).group(1))==n
            assert r['tap']['tests']==r['tap']['pass'] and all(r['tap'][k]==0 for k in ['fail','skipped','cancelled','todo'])
    tests=[r for r in gates['results'] if 'tap' in r]
    assert len(tests)==len(list((ROOT/'tests').glob('*.test.mjs')))==145
    assert sum(r['tap']['tests'] for r in tests)==3900
    by={r['label']:r for r in gates['results']}
    assert by['remediation-b-050.test']['tap']['tests']==49
    for name,n in [('nito-remediation-b022.test',12),('nito-remediation-b018.test',9),('remediation-b-071.test',97),('liv-reduction-selection-evidence.test',103)]:assert by[name]['tap']['tests']==n
    for label in ['next-typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']:assert label in by
    assert by['eslint']['errors']==0
    runtime=gzip.decompress((HERE/'logs'/by['http-pdf-runtime']['log']).read_bytes()).decode()
    decoder=json.JSONDecoder();reports=[]
    for i,ch in enumerate(runtime):
        if ch=='{':
            try:v,end=decoder.raw_decode(runtime[i:])
            except ValueError:continue
            if isinstance(v,dict) and v.get('result')=='PASS' and isinstance(v.get('checks'),list):reports.append(v)
    assert len(reports)==1 and len(reports[0]['checks'])==22
    before_raw=gzip.decompress((HERE/'catalog-before.json.gz').read_bytes());after_raw=gzip.decompress((HERE/'catalog-after.json.gz').read_bytes())
    before=json.loads(before_raw);after=json.loads(after_raw);audit=load(HERE/'source-reverse-audit.json')
    assert sha(before_raw)==audit['before_catalog_sha256'] and sha(after_raw)==audit['after_catalog_sha256']
    assert [k for k in before['facts'] if before['facts'][k]!=after['facts'][k]]==['gjensidige-hund-liv']
    restored=json.loads(after_raw);restored['facts']['gjensidige-hund-liv']=before['facts']['gjensidige-hund-liv'];assert restored==before
    for p,h in audit['sources_verified'].items():assert sha((ROOT/p).read_bytes())==h
    rows=list(csv.DictReader((ROOT/'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open()));reg={r['signature_id']:r for r in rows};assert len(reg)==len(rows)==1589
    signatures={'5839d2c13e186676','373413bc13517ff4','72170f7dfe5c91b6','8c14a1328e5080cf'}
    for signature in signatures:
        receipt=load(HERE/f'receipt-{signature}.json');assert receipt['status']=='PASS' and receipt['signature']==signature and receipt['original_binding']==reg[signature]
        assert receipt['gap_ids']==json.loads(reg[signature]['finding_ids']) and receipt['sf_ids']==json.loads(reg[signature]['source_fact_ids'])
        assert receipt['tested_candidate_identity']==identity['candidate_identity']
    campaign=load(HERE/'campaign-signature-set.json');assert len({m['signature'] for m in campaign['members']})==8
    for m in campaign['members']:assert sha((ROOT/m['receipt']).read_bytes())==m['receipt_sha256']
    policy=load(HERE/'campaign-policy.json');assert policy['scope_used']==2 and policy['campaign_used']==6 and policy['scope_limit']==3 and policy['campaign_limit']==12
    roots=list(csv.DictReader((HERE/'prospective-root-ledger.csv').open()));assert len(roots)==len({r['root_id'] for r in roots})==6
    for r in roots:assert (ROOT/r['equivalence_evidence']).exists()
    assert policy['global_resolved_open']=='UNKNOWN' and not policy['historic_20_exception']['used']
    assert load(HERE/'summary.json')['global_current_resolved']=='UNKNOWN'
    subprocess.run(['git','diff','--check'],cwd=ROOT,check=True)
    print('PASS: four Liv receipts, campaign eight exact signatures, 145/3900 suite, source/reverse audit and 22 runtime checks; budgets 2/3 and 6/12; global accounting UNKNOWN')
if __name__=='__main__':main()
