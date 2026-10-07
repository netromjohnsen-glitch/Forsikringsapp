"""Verify exact current completion scope, immutable evidence and publication set."""
import csv
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = '0be8fadb7e90fc527cd81c5ae5c89accabb2deb0'
EXACT = {'a4e5c76df5cbf2af', 'af3a3ee673fedc83'}
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda n: json.loads((OUT / n).read_text())

def verify():
    assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip() == BASE
    auth = read('authorization.json')
    registry = {r['signature_id']: r for r in csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
    assert len(registry) == 1589
    assert {r['signature_id'] for r in auth['signatures']} == EXACT
    for row in auth['signatures']:
        assert row == registry[row['signature_id']]
    for source in auth['sources']:
        assert sha((ROOT / source['path']).read_bytes()) == source['sha256']
    identity = read('final-candidate-identity.json')
    assert set(identity['application_files']) == set(auth['application_files'])
    assert sha(json.dumps(identity['application_files'], sort_keys=True).encode()) == identity['application_identity_sha256']
    for path, digest in identity['application_files'].items():
        assert sha((ROOT / path).read_bytes()) == digest, path
    for path, digest in identity['audit_support_files'].items():
        assert sha((ROOT / path).read_bytes()) == digest, path
    assert sha((ROOT / 'lib/gjensidige-hus-catalog.ts').read_bytes()) == read('three-correction-proof.json')['production_sha256_before']
    generator = read('harness-roots.json')
    for name, field in generator['preserved_checkpoint_hold_fields'].items():
        raw = (ROOT / field['origin_path']).read_bytes()
        assert sha(raw) == field['origin_sha256']
        assert json.loads(raw)[field['origin_field']] == field['value']
        assert field['origin_field'] == name
        assert raw == subprocess.check_output(['git', 'show', BASE + ':' + field['origin_path']], cwd=ROOT)
    ledger = read('three-correction-authorization-and-ledger.json')
    assert ledger['HARNESS_AUTONOMY_V1'] == {'before': 25, 'used': 28, 'ordinary_limit': 12, 'scope_before': 1, 'scope_used': 4, 'scope_limit': 6, 'capacity_for_other_roots': 0}
    assert len(set(ledger['named_roots'])) == 3
    assert generator['HARNESS_AUTONOMY_V1']['used'] == 25
    current_ledger = read('lint-matching-authorization-and-ledger.json')
    assert current_ledger['performed'] is True
    assert current_ledger['root'] == 'COMPLETION_LINT_DUPLICATE_ONE_TO_ONE_MATCH'
    assert current_ledger['HARNESS_AUTONOMY_V1'] == {'before': 28, 'used': 29, 'ordinary_limit': 12, 'scope_before': 4, 'scope_used': 5, 'scope_limit': 6, 'capacity_for_other_roots': 0}
    lint_test = read('lint-matching-test-results.json')
    assert lint_test['status'] == 'PASS' and lint_test['exit_code'] == 0 and lint_test['tests'] == 8
    assert sha((OUT / 'lint_matching.py').read_bytes()) == lint_test['matcher_sha256']
    assert sha((OUT / 'lint_matching_test.py').read_bytes()) == lint_test['test_sha256']
    assert sha(gzip.decompress((OUT / lint_test['log']).read_bytes())) == lint_test['original_output_sha256']
    stopped_generator = read('completion-generator-blocker.json')['generator']
    assert sha(gzip.decompress((OUT / stopped_generator['path']).read_bytes())) == stopped_generator['decoded_sha256']
    original = read('blocker.json')['generator_evidence']
    assert sha(gzip.decompress((OUT / original['file']).read_bytes())) == original['decoded_sha256']
    prior = read('prior-receipts.json')
    assert len(prior) == len({r['signature'] for r in prior}) == 51
    for row in prior:
        raw = (ROOT / row['path']).read_bytes()
        assert sha(raw) == row['sha256'], row['path']
        assert json.loads(raw)['status'] == 'PASS'
        assert json.loads(raw)['signature'] == row['signature']
    receipts = [read('completion-receipt-' + signature + '.json') for signature in sorted(EXACT)]
    for receipt in receipts:
        assert receipt['status'] == 'PASS'
        assert receipt['original_binding'] == registry[receipt['signature']]
        assert receipt['candidate_identity_sha256'] == identity['application_identity_sha256']
        assert receipt['global_resolved_open'] == 'UNKNOWN'
        assert receipt['P2_credit'] == 0
    cp = read('checkpoint.json')
    assert cp['HARNESS_AUTONOMY_V1']['used'] == 29 and cp['HARNESS_AUTONOMY_V1']['scope_used'] == 5
    assert set(cp['documented_campaign_signatures']) == {r['signature'] for r in prior} | EXACT
    assert len(cp['documented_campaign_signatures']) == len(set(cp['documented_campaign_signatures'])) == 53
    assert cp['global_resolved_open'] == 'UNKNOWN'
    part = read('completion-b051-partition.json')
    names = ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']
    assert [len(part[n]) for n in names] == [27, 8, 2, 2]
    sets = [set(part[n]) for n in names]
    assert len(set.union(*sets)) == sum(map(len, sets)) == 39
    assert set.union(*sets) == {s for s, row in registry.items() if row['final_batch_id'] == 'B-051'}
    previous = json.loads((ROOT / 'docs/audit/checkpoints/b051-recovery-benefits-69c71dc/completion-b051-partition.json').read_text())
    assert sets[0] == set(previous[names[0]]) | EXACT
    assert sets[1] == set(previous[names[1]]) - EXACT
    for n in names[2:]:
        assert part[n] == previous[n]
    for n in ['holds_unchanged', 'additional_B051_holds_unchanged', 'historical_only', 'historical_DEFER_SAFE_signatures']:
        old = json.loads((ROOT / 'docs/audit/checkpoints/b051-recovery-benefits-69c71dc/publication-completion-checkpoint.json').read_text())
        assert cp[n] == old[n], n
    results = read('gate-results.json')['results']
    full = [x for x in results if x['label'].startswith('full-')]
    targeted = [x for x in results if x['label'].startswith('final-targeted-')]
    quality = [x for x in results if x['label'] in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']]
    manifest = read('test-manifest.json')
    assert manifest == sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
    assert len(full) == len(manifest)
    assert {x['command'][2] for x in full} == set(manifest)
    assert len(targeted) == 25 and len(quality) == 6
    rem = read('remediation-manifest.json')
    assert rem == [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
    for gate in full + targeted + quality:
        assert gate['status'] == 'PASS' and gate['exit_code'] == 0
        assert gate['application_identity_sha256'] == identity['application_identity_sha256']
        assert gate['application_files'] == identity['application_files']
        assert gate['tap'].get('fail', 0) == gate['tap'].get('cancelled', 0) == gate['tap'].get('skipped', 0) == 0
        log = (OUT / gate['log']).read_bytes()
        assert sha(log) == gate['log_sha256']
        assert sha(gzip.decompress(log)) == gate['original_output_sha256']
    assert read('lint-difference.json')['new_warnings'] == []
    assert read('lint-difference.json')['new_errors'] == 0
    from lint_matching import reconcile
    reports = lambda path: json.loads(gzip.decompress(path.read_bytes()))
    warnings = lambda rs: [dict(path=r['filePath'].split('/Forsikringsapp/')[-1], filePath=r['filePath'], **m) for r in rs for m in r['messages']]
    old = warnings(reports(OUT.parent / 'b051-recovery-benefits-69c71dc/final-eslint.log.gz'))
    current = warnings(reports(OUT / 'eslint.log.gz'))
    matched = read('lint-occurrence-reconciliation.json')
    assert reconcile(old, current, matched['documented_moves']) == matched
    assert matched['exact_match_count'] == 26 and len(matched['documented_moves']) == 1
    move = matched['documented_moves'][0]
    assert move['before']['path'] == move['after']['path'] == 'tests/remediation-b-051-settlement-age.test.mjs'
    assert move['before']['line'] == move['before']['endLine'] == 54
    assert move['after'] == {**move['before'], 'line': 55, 'endLine': 55}
    original_line = subprocess.check_output(['git', 'show', BASE + ':' + move['before']['path']], cwd=ROOT).decode().splitlines()[53]
    assert original_line == (ROOT / move['after']['path']).read_text().splitlines()[54]
    delta = read('catalog-delta.json')
    assert delta['status'] == 'PASS' and delta['protected_raw_facts'] == 4155 and delta['entirely_unchanged_components'] == 316
    expected = read('staged-files.json')
    assert len(expected) == len(set(expected))
    allowed_app = set(auth['application_files'])
    status = ROOT / 'docs/development-agent/current-project-status.md'
    for path in expected:
        assert path in allowed_app or path == str(status.relative_to(ROOT)) or path.startswith(str(OUT.relative_to(ROOT)) + '/')
        p = ROOT / path
        assert p.is_file()
        if p.suffix != '.gz':
            raw = p.read_bytes()
            assert b'\r' not in raw, path
            assert all(line.rstrip(b' \t') == line for line in raw.splitlines()), path
    active = set(subprocess.check_output(['git', 'diff', '--name-only', 'HEAD'], cwd=ROOT).decode().splitlines())
    untracked = set(subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT).decode().splitlines())
    assert active | untracked == set(expected), ((active | untracked) - set(expected), set(expected) - (active | untracked))
    for markdown in [OUT / 'README.md', status]:
        for target in re.findall(r'\]\(([^)]+)\)', markdown.read_text()):
            assert not target.startswith(('http:', 'https:')), 'Current scope uses controlled local links'
            assert (markdown.parent / target.split('#', 1)[0]).is_file(), (markdown, target)
    subprocess.run(['sha256sum', '-c', str(OUT / 'SHA256SUMS')], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['git', 'diff', '--check'], cwd=ROOT, check=True)
    subprocess.run(['git', 'diff', '--cached', '--check'], cwd=ROOT, check=True)
    staged = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=ROOT).decode().splitlines()
    if staged:
        assert set(staged) == set(expected) and len(staged) == len(expected)
    print(json.dumps({'status': 'PASS', 'checksummed_scope': len(expected), 'campaign_signatures': 53, 'B051_partition': [27, 8, 2, 2], 'staged': len(staged), 'application_identity_sha256': identity['application_identity_sha256']}))

if __name__ == '__main__':
    verify()
