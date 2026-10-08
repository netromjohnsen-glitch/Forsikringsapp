"""Scoped verification reusing strict historical receipt and publication tools."""
from pathlib import Path
import csv, gzip, hashlib, json, re, subprocess, sys
sys.dont_write_bytecode = True
R = Path(__file__).resolve().parents[4]
O = Path(__file__).resolve().parent
P = R / 'docs/audit/checkpoints/b051-rot-status-469b485'
sha = lambda data: hashlib.sha256(data).hexdigest()
read = lambda name: json.loads((O / name).read_text())
auth = read('authorization.json')
assert sha((O / 'preflight-decision-report.md').read_bytes()) == auth['preflight_sha256']['decision-report.md']
assert sha((O / 'preflight-matrix.json').read_bytes()) == auth['preflight_sha256']['matrix.json']
assert sha(gzip.decompress((O / 'preflight-simulated-production.diff.gz').read_bytes())) == auth['preflight_sha256']['simulated-production.diff']
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=R).decode().strip() == auth['baseline']
registry = {row['signature_id']: row for row in csv.DictReader((R / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589 and auth['original_binding'] == registry[auth['signature']]
assert [(x['gap'], x['sf'], x['product']) for x in auth['bindings']] == [
    ('GAP-2101', 'SF-3012', 'gjensidige-hus'), ('GAP-2160', 'SF-3099', 'gjensidige-hus-pluss')]
for source in auth['sources']:
    assert sha((R / source['path']).read_bytes()) == source['sha256']
sys.path.insert(0, str(R / 'docs/audit/checkpoints/b051-liability-3947e4e'))
import receipt_formats
formats, registered, members = receipt_formats.load_context()
assert registered == registry
prior = json.loads((R / 'docs/audit/checkpoints/b051-rot-77db841/prior-receipts.json').read_text())
assert len(prior) == len({row['signature'] for row in prior}) == 60
for row in prior:
    raw = (R / row['path']).read_bytes()
    assert sha(raw) == row['sha256']
    receipt = json.loads(raw)
    if row['signature'] in {member['signature'] for member in members}:
        receipt_formats.verify_receipt(receipt, row['signature'], formats, registry)
    else:
        assert receipt['original_binding'] == registry[row['signature']]
        assert receipt['status'] == 'PASS' and receipt['signature'] == row['signature']
historical_entries = 0
for line in (P / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    original = subprocess.check_output(['git', 'show', auth['baseline'] + ':' + path], cwd=R)
    assert sha(original) == digest, path
    if path.startswith('docs/audit/'):
        assert (R / path).read_bytes() == original, path
    historical_entries += 1
# All existing tracked files outside the exact active authorization are immutable.
allowed = set(auth['production_files'] + auth['planned_test_files'] + auth['planned_documentation_files'])
active = set(subprocess.check_output(['git', 'diff', 'HEAD', '--name-only'], cwd=R).decode().splitlines())
assert all(path in allowed or path.startswith(str(O.relative_to(R)) + '/') for path in active), active - allowed
identity = read('final-candidate-identity.json')
for artifact in read('lossless-diff-artifacts.json')['artifacts']:
    encoded = (O / artifact['stored_filename']).read_bytes()
    original = gzip.decompress(encoded)
    assert sha(encoded) == artifact['stored_sha256'] and sha(original) == artifact['original_sha256']
    assert len(original) == artifact['original_bytes']
    assert sha(original + b'x') != artifact['original_sha256']
assert set(identity['application_files']) == set(auth['production_files'] + auth['planned_test_files'])
assert sha(json.dumps(identity['application_files'], sort_keys=True).encode()) == identity['application_identity_sha256']
for path, digest in identity['application_files'].items():
    assert sha((R / path).read_bytes()) == digest, path
assert sha(subprocess.check_output(['git', 'diff', 'HEAD', '--', *auth['production_files']], cwd=R)) == identity['production_diff_sha256']
assert sha(gzip.decompress((O / 'application.diff.gz').read_bytes())) == identity['application_diff_sha256']
before, after = read('isolation-baseline.json'), read('isolation-candidate.json')
for field in ['raw_catalog_hash', 'products', 'addons', 'materialized']:
    assert before[field] == after[field], field
assert after['status'] == 'PASS' and len(after['products']) == 203
assert len(after['addons']) == 159 and len([x for x in after['addons'] if 'hash' in x]) == 157
assert len(after['materialized']) == 202
assert [x['status'] for x in before['manual_choice']] == ['selected', 'unknown', 'unknown', 'unknown']
assert all(x['status'] == 'selected' and x['ids'] == ['gjensidige-hus-rate-insekter'] for x in after['manual_choice'])
results = read('gate-results.json')['results']
manifest = read('test-manifest.json')
assert manifest == sorted(str(path.relative_to(R)) for path in (R / 'tests').glob('*.test.mjs'))
full = [x for x in results if x['label'].startswith('final-full-')]
assert len(full) == len(manifest) and {x['command'][2] for x in full} == set(manifest)
rem = read('remediation-manifest.json')
assert rem == [path for path in manifest if 'remediation' in Path(path).name or Path(path).name == 'b043-status-parser.test.mjs']
final = [x for x in results if x['status'] == 'PASS']
failed = [x for x in results if x['status'] != 'PASS']
assert len(failed) == 1 and failed[0]['command'][2] == 'tests/mc-bobil-manual-agreement.test.mjs'
assert any(x['command'][2] == 'tests/mc-bobil-manual.test.mjs' for x in full)
for result in results:
    raw = (O / result['log']).read_bytes()
    assert sha(raw) == result['log_sha256'] and sha(gzip.decompress(raw)) == result['original_output_sha256']
    assert result['tested_HEAD'] == auth['baseline'] and result['application_files'] == identity['application_files']
    assert result['application_identity_sha256'] == identity['application_identity_sha256']
for result in final:
    assert result['exit_code'] == 0 and all(result['tap'].get(field, 0) == 0 for field in ['fail', 'cancelled', 'skipped'])
assert all(x['status'] == 'PASS' for x in full)
for label in ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']:
    assert len([x for x in final if x['label'] == label]) == 1, label
summary = read('validation-summary.json')
assert summary['fullsuite']['tests'] == sum(x['tap']['tests'] for x in full)
assert summary['remediation']['tests'] == sum(x['tap']['tests'] for x in full if x['command'][2] in rem)
lint = json.loads(gzip.decompress((O / 'eslint-audit-final.log.gz').read_bytes()))
assert sum(x['errorCount'] for x in lint) == 0
sys.path.insert(0, str(R / 'docs/audit/checkpoints/b051-physical-exclusions-0be8fad'))
from lint_matching import reconcile
warnings = lambda reports: [dict(path=x['filePath'].split('/Forsikringsapp/')[-1], filePath=x['filePath'], **message) for x in reports for message in x['messages']]
old_lint = json.loads(gzip.decompress((P / 'final-eslint.log.gz').read_bytes()))
assert reconcile(warnings(old_lint), warnings(lint)) == read('lint-occurrence-reconciliation.json')
runtime = next(x for x in final if x['label'] == 'http-pdf-runtime')['runtime']
assert runtime['result'] == 'PASS' and len(runtime['checks']) == 22
cp = read('checkpoint.json')
previous = json.loads((P / 'checkpoint.json').read_text())
for field in ['holds_unchanged', 'additional_B051_holds_unchanged', 'historical_only', 'historical_DEFER_SAFE_signatures', 'HARNESS_AUTONOMY_V1', 'current_B071_revalidated_signatures']:
    assert cp[field] == previous[field], field
assert cp['documented_campaign_count'] == len(set(cp['documented_campaign_signatures'])) == 61
assert set(cp['documented_campaign_signatures']) == {x['signature'] for x in prior} | {auth['signature']}
assert cp['global_resolved_open'] == 'UNKNOWN' and cp['P2_credit'] == 0
part = read('completion-b051-partition.json')
sets = [set(part[field]) for field in ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']]
assert list(map(len, sets)) == [35, 0, 2, 2] and sum(map(len, sets)) == 39
assert set.union(*sets) == {key for key, row in registry.items() if row['final_batch_id'] == 'B-051'}
receipt = read('completion-receipt-6af32d21acb9584c.json')
assert receipt['status'] == 'PASS' and receipt['signature'] == auth['signature'] and receipt['original_binding'] == registry[auth['signature']]
assert receipt['bindings'] == auth['bindings'] and receipt['tested_revision'] == auth['baseline']
assert receipt['candidate_identity_sha256'] == identity['application_identity_sha256']
assert receipt['global_resolved_open'] == 'UNKNOWN' and receipt['P2_credit'] == 0
assert len(list(O.glob('completion-receipt-*.json'))) == 1
expected = read('staged-files.json')
assert len(expected) == len(set(expected))
for path in expected:
    assert path in allowed or path.startswith(str(O.relative_to(R)) + '/'), path
    raw = (R / path).read_bytes()
    if Path(path).suffix != '.gz':
        assert b'\r' not in raw and all(line.rstrip(b' \t') == line for line in raw.splitlines()), path
    if Path(path).suffix == '.md':
        for target in re.findall(r'\]\(([^)]+)\)', raw.decode()):
            if not target.startswith(('http:', 'https:')):
                assert ((R / path).parent / target.split('#', 1)[0]).is_file(), (path, target)
untracked = set(subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=R).decode().splitlines())
assert active | untracked == set(expected), ((active | untracked) - set(expected), set(expected) - (active | untracked))
subprocess.run(['sha256sum', '-c', str(O / 'SHA256SUMS')], cwd=R, check=True, stdout=subprocess.DEVNULL)
for command in [['git', 'diff', '--check'], ['git', 'diff', '--cached', '--check']]:
    subprocess.run(command, cwd=R, check=True)
staged = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=R).decode().splitlines()
if staged:
    assert set(staged) == set(expected) and len(staged) == len(expected)
subprocess.run([sys.executable, 'docs/audit/checkpoints/b050-diagnostics-integrity-3c5e869/publish.py', '--self-test'], cwd=R, check=True)
print(json.dumps({'status': 'PASS', 'authorized_files': len(expected), 'staged': len(staged),
    'immutable_receipts': 60, 'documented_signatures': 61, 'historical_manifest_entries': historical_entries,
    'B051_partition': [35, 0, 2, 2], 'global_resolved_open': 'UNKNOWN',
    'candidate_identity_sha256': identity['application_identity_sha256']}))
