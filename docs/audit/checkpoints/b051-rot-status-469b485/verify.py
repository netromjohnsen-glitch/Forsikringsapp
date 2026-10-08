"""Scoped integrity checks using established strict receipt/lint/publication tools."""
from pathlib import Path
import csv, gzip, hashlib, json, re, subprocess, sys
sys.dont_write_bytecode = True
R = Path(__file__).resolve().parents[4]
O = Path(__file__).resolve().parent
P = R / 'docs/audit/checkpoints/b051-rot-77db841'
sha = lambda value: hashlib.sha256(value).hexdigest()
read = lambda name: json.loads((O / name).read_text())
auth = read('authorization.json')
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=R).decode().strip() == auth['baseline']
registry = {row['signature_id']: row for row in csv.DictReader((R / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open())}
assert len(registry) == 1589
assert auth['signature'] == '6af32d21acb9584c'
assert auth['original_binding'] == registry[auth['signature']]
assert [(x['gap'], x['sf'], x['product']) for x in auth['bindings']] == [
    ('GAP-2101', 'SF-3012', 'gjensidige-hus'), ('GAP-2160', 'SF-3099', 'gjensidige-hus-pluss')]
assert json.loads(auth['original_binding']['finding_ids']) == [x['gap'] for x in auth['bindings']]
assert json.loads(auth['original_binding']['source_fact_ids']) == [x['sf'] for x in auth['bindings']]
for source in auth['sources']:
    assert sha((R / source['path']).read_bytes()) == source['sha256']
prior = json.loads((P / 'prior-receipts.json').read_text())
assert len(prior) == len({row['signature'] for row in prior}) == 60
sys.path.insert(0, str(R / 'docs/audit/checkpoints/b051-liability-3947e4e'))
import receipt_formats
formats, registered, members = receipt_formats.load_context()
assert registered == registry and len(members) == 53
for row in members:
    receipt_formats.verify_receipt(json.loads((R / row['path']).read_text()), row['signature'], formats, registry)
for row in prior:
    original = (R / row['path']).read_bytes()
    assert sha(original) == row['sha256']
    receipt = json.loads(original)
    assert receipt['status'] == 'PASS' and receipt['signature'] == row['signature']
    if row['signature'] not in {member['signature'] for member in members}:
        assert receipt['original_binding'] == registry[row['signature']]
# Historical manifests stay bound to the actual published historical revision.
# Every immutable audit byte remains current-identical; only authorized active files differ.
for line in (P / 'SHA256SUMS').read_text().splitlines():
    digest, path = line.split('  ', 1)
    historical = subprocess.check_output(['git', 'show', '43a7ae5:' + path], cwd=R)
    assert sha(historical) == digest, path
    if path.startswith('docs/audit/'):
        assert (R / path).read_bytes() == historical, path
cp = read('checkpoint.json')
previous = json.loads((P / 'checkpoint.json').read_text())
for field in ['documented_campaign_signatures', 'current_B051_completed_signatures', 'current_B071_revalidated_signatures',
              'holds_unchanged', 'additional_B051_holds_unchanged', 'historical_only', 'historical_DEFER_SAFE_signatures', 'HARNESS_AUTONOMY_V1']:
    assert cp[field] == previous[field], field
assert cp['documented_campaign_count'] == 60
assert set(cp['documented_campaign_signatures']) == {row['signature'] for row in prior}
assert cp['global_resolved_open'] == 'UNKNOWN' and cp['P2_credit'] == 0
assert cp['original_signature_status'] == {'6af32d21acb9584c': 'OPEN'}
assert cp['current_completion_receipts'] == [] and not list(O.glob('completion-receipt-*.json'))
part = json.loads((O / cp['B051_partition']).read_text())
names = ['completed_current_receipts', 'source_clear_no_current_receipt', 'revalidation_candidates', 'holds']
sets = [set(part[name]) for name in names]
assert [len(value) for value in sets] == [34, 1, 2, 2]
assert set.union(*sets) == {key for key, row in registry.items() if row['final_batch_id'] == 'B-051'}
assert sum(map(len, sets)) == 39 and sets[1] == {auth['signature']}
identity = read('final-candidate-identity.json')
assert set(identity['application_files']) == set(auth['production_files'] + auth['planned_test_files'])
assert sha(json.dumps(identity['application_files'], sort_keys=True).encode()) == identity['application_identity_sha256']
for path, digest in identity['application_files'].items():
    assert sha((R / path).read_bytes()) == digest, path
snapshot = read('baseline-snapshot.json')
assert snapshot['revision'] == auth['baseline']
assert sha((O / snapshot['snapshot']).read_bytes()) == snapshot['sha256']
assert sha(subprocess.check_output(['git', 'show', auth['baseline'] + ':lib/gjensidige-hus-catalog.ts'], cwd=R)) == snapshot['catalog_source_sha256']
results = read('gate-results.json')['results']
final = [result for result in results if result['label'].startswith('final-')]
full = [result for result in final if result['label'].startswith('final-full-')]
targeted = [result for result in final if result['label'].startswith('final-targeted-')]
quality = [result for result in final if result not in full + targeted]
manifest = read('test-manifest.json')
assert manifest == sorted(str(path.relative_to(R)) for path in (R / 'tests').glob('*.test.mjs'))
assert len(full) == len(manifest) == 158 and {result['command'][2] for result in full} == set(manifest)
assert len(targeted) == 33 and len(quality) == 6
remediation = read('remediation-manifest.json')
assert remediation == [path for path in manifest if 'remediation' in Path(path).name or Path(path).name == 'b043-status-parser.test.mjs']
for result in results:
    log = (O / result['log']).read_bytes()
    assert sha(log) == result['log_sha256'] and sha(gzip.decompress(log)) == result['original_output_sha256']
for result in final:
    assert result['tested_HEAD'] == auth['baseline'] and result['status'] == 'PASS' and result['exit_code'] == 0
    assert result['application_files'] == identity['application_files']
    assert result['application_identity_sha256'] == identity['application_identity_sha256']
    assert all(result['tap'].get(field, 0) == 0 for field in ['fail', 'cancelled', 'skipped'])
summary = read('validation-summary.json')
assert summary['fullsuite']['tests'] == summary['fullsuite']['pass'] == sum(result['tap']['tests'] for result in full) == 5481
assert summary['remediation']['tests'] == summary['remediation']['pass'] == sum(result['tap']['tests'] for result in full if result['command'][2] in remediation) == 3328
assert summary['targeted']['tests'] == summary['targeted']['pass'] == sum(result['tap']['tests'] for result in targeted) == 2242
lint = json.loads(gzip.decompress((O / 'final-eslint.log.gz').read_bytes()))
assert sum(report['errorCount'] for report in lint) == 0 and sum(report['warningCount'] for report in lint) == 27
sys.path.insert(0, str(R / 'docs/audit/checkpoints/b051-physical-exclusions-0be8fad'))
from lint_matching import reconcile
warnings = lambda reports: [dict(path=report['filePath'].split('/Forsikringsapp/')[-1], filePath=report['filePath'], **message) for report in reports for message in report['messages']]
old_lint = json.loads(gzip.decompress((P / 'eslint.log.gz').read_bytes()))
assert reconcile(warnings(old_lint), warnings(lint)) == read('lint-occurrence-reconciliation.json')
text = gzip.decompress((O / 'final-http-pdf-runtime.log.gz').read_bytes()).decode()
report = None
for index, char in enumerate(text):
    if char != '{':
        continue
    try:
        value, _ = json.JSONDecoder().raw_decode(text[index:])
    except ValueError:
        continue
    if isinstance(value, dict) and value.get('result') == 'PASS':
        report = value
        break
assert report and len(report['checks']) == 22
assert read('quality-report.json')['runtime_checks'] == report['checks']
for mode in ['baseline', 'candidate']:
    probe = read('repeat-choice-' + mode + '.json')
    assert probe['first']['addOnIds'] == ['gjensidige-hus-rate-insekter'] and probe['repeated']['addOnIds'] == []
    assert probe['first']['coverage']['status'] == 'selected'
    assert probe['first']['catalogReference'] == probe['repeated']['catalogReference']
    for path, digest in probe['production_hashes'].items():
        source = subprocess.check_output(['git', 'show', auth['baseline'] + ':' + path], cwd=R) if mode == 'baseline' else (R / path).read_bytes()
        assert sha(source) == digest
assert read('original-signature-closure-decision.json')['status'] == 'OPEN'
revalidation = read('original-signature-revalidation.json')
assert revalidation['original_signature_status'] == 'OPEN' and revalidation['signature_credit'] == 0
assert [(row['gap'], row['sf'], row['product']) for row in revalidation['results']] == [(row['gap'], row['sf'], row['product']) for row in auth['bindings']]
assert revalidation['documented_choice_and_silent_optional'] == 'PASS'
assert revalidation['manual_choice_continuation'] == 'FAIL_SEPARATE_BASELINE_FINDING'
receipt = read('implementation-receipt-6af32d21acb9584c.json')
assert receipt['implementation_status'] == 'PASS' and receipt['original_signature_status'] == 'OPEN'
assert receipt['original_binding'] == registry[auth['signature']] and receipt['signature_credit'] == 0
assert receipt['new_completion_receipt'] is False and receipt['candidate_identity_sha256'] == identity['application_identity_sha256']
expected = read('staged-files.json')
assert len(expected) == len(set(expected))
allowed = set(auth['production_files'] + auth['planned_test_files'] + auth['documentation_files'])
for path in expected:
    assert path in allowed or path.startswith(str(O.relative_to(R)) + '/'), path
    raw = (R / path).read_bytes()
    if Path(path).suffix != '.gz':
        assert b'\r' not in raw and all(line.rstrip(b' \t') == line for line in raw.splitlines()), path
# Exact contexts: newly authored files resolve their own relative links. No archive fallback.
for path in expected:
    document = R / path
    if document.suffix != '.md':
        continue
    for target in re.findall(r'\]\(([^)]+)\)', document.read_text()):
        assert not target.startswith(('http:', 'https:'))
        assert (document.parent / target.split('#', 1)[0]).is_file(), (path, target)
active = set(subprocess.check_output(['git', 'diff', 'HEAD', '--name-only'], cwd=R).decode().splitlines())
untracked = set(subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=R).decode().splitlines())
assert active | untracked == set(expected), ((active | untracked) - set(expected), set(expected) - (active | untracked))
subprocess.run(['sha256sum', '-c', str(O / 'SHA256SUMS')], cwd=R, check=True, stdout=subprocess.DEVNULL)
subprocess.run(['git', 'diff', '--check'], cwd=R, check=True)
subprocess.run(['git', 'diff', '--cached', '--check'], cwd=R, check=True)
staged = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=R).decode().splitlines()
if staged:
    assert set(staged) == set(expected) and len(staged) == len(expected)
subprocess.run([sys.executable, 'docs/audit/checkpoints/b050-diagnostics-integrity-3c5e869/publish.py', '--self-test'], cwd=R, check=True)
print(json.dumps({'status': 'PASS', 'staged': len(staged), 'authorized_files': len(expected), 'immutable_receipts': 60,
                  'original_signature': 'OPEN', 'B051_partition': [34, 1, 2, 2], 'global_resolved_open': 'UNKNOWN',
                  'application_identity_sha256': identity['application_identity_sha256']}))
