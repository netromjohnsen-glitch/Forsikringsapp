import copy, gzip, hashlib, json, subprocess
from lint_matching import reconcile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'docs/audit/checkpoints/b051-physical-exclusions-0be8fad'
OLD = ROOT / 'docs/audit/checkpoints/b051-recovery-benefits-69c71dc'
BASE = '0be8fadb7e90fc527cd81c5ae5c89accabb2deb0'
EXACT = {'a4e5c76df5cbf2af', 'af3a3ee673fedc83'}
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())
def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

auth = read(OUT / 'authorization.json')
results = read(OUT / 'gate-results.json')['results']
full = [x for x in results if x['label'].startswith('full-')]
target = [x for x in results if x['label'].startswith('final-targeted-')]
quality_names = ['typegen', 'typescript', 'eslint', 'production-build', 'http-pdf-runtime', 'diff-check']
quality = [x for x in results if x['label'] in quality_names]
assert len(full) == 152 and len(target) == 25 and len(quality) == 6
assert all(x['status'] == 'PASS' for x in full + target + quality)
files = {p: sha((ROOT / p).read_bytes()) for p in auth['application_files']}
identity = sha(json.dumps(files, sort_keys=True).encode())
assert all(x['application_files'] == files and x['application_identity_sha256'] == identity for x in full + target + quality)
support = ['expected-catalog.mjs', 'source-oracle.json', 'catalog-audit.mjs']
save('final-candidate-identity.json', {
    'tested_HEAD': BASE, 'application_files': files,
    'application_identity_sha256': identity,
    'audit_support_files': {str((OUT / p).relative_to(ROOT)): sha((OUT / p).read_bytes()) for p in support},
    'publication_revision': 'Containing Git commit; not claimed as a separately tested application revision',
    'production_unchanged_during_three_corrections': True,
})

old_lint = json.loads(gzip.decompress((OLD / 'final-eslint.log.gz').read_bytes()))
new_lint = json.loads(gzip.decompress((OUT / 'eslint.log.gz').read_bytes()))
def issues(reports):
    return [dict(path=r['filePath'].split('/Forsikringsapp/')[-1], filePath=r['filePath'], **m) for r in reports for m in r['messages']]
oi, ni = issues(old_lint), issues(new_lint)
# Only this independently documented import shift is permitted. No inferred moves.
path = 'tests/remediation-b-051-settlement-age.test.mjs'
message = "'protectedCount' is assigned a value but never used."
before = [w for w in oi if w['path'] == path and w['message'] == message]
after = [w for w in ni if w['path'] == path and w['message'] == message]
assert len(before) == len(after) == 1
before, after = before[0], after[0]
assert before['line'] == before['endLine'] == 54
assert after['line'] == after['endLine'] == 55
assert after == {**before, 'line': 55, 'endLine': 55}
baseline = subprocess.check_output(['git', 'show', BASE + ':' + path], cwd=ROOT).decode().splitlines()
current = (ROOT / path).read_text().splitlines()
assert baseline[53] == current[54]
assert current[14] == "import { applyPhysical } from '../docs/audit/checkpoints/b051-physical-exclusions-0be8fad/expected-catalog.mjs';"
# The baseline diff independently proves the one added import before this declaration.
diff = subprocess.check_output(['git', 'diff', BASE, '--', path], cwd=ROOT).decode()
assert "+import { applyPhysical }" in diff and "@@ -12,7 +12,8 @@" in diff
move = {'before': before, 'after': after, 'evidence': {'baseline_revision': BASE, 'path': path, 'before_line': 54, 'after_line': 55, 'same_declaration_bytes': True, 'cause': 'One authorized applyPhysical import; all warning fields other than line/endLine identical'}}
reconciled = reconcile(oi, ni, [move])
assert reconciled['exact_match_count'] == 26 and reconciled['historical_count'] == reconciled['current_count'] == 27
save('lint-occurrence-reconciliation.json', reconciled)
shifted = [move]
save('lint-difference.json', {'status': 'PASS', 'previous_errors': sum(r['errorCount'] for r in old_lint), 'current_errors': sum(r['errorCount'] for r in new_lint), 'previous_warnings': len(oi), 'current_warnings': len(ni), 'new_errors': 0, 'new_warnings': [], 'location_only_changes': shifted, 'historical_warning_cleanup': 'NOT_AUTHORIZED_NOT_PERFORMED', 'baseline_log': str((OLD / 'final-eslint.log.gz').relative_to(ROOT)), 'current_log': 'eslint.log.gz'})
rem = read(OUT / 'remediation-manifest.json')
sumtests = lambda xs: sum(x['tap']['tests'] for x in xs)
runtime = next(x for x in quality if x['label'] == 'http-pdf-runtime')['runtime']
summary = {
    'status': 'PASS', 'tested_HEAD': BASE, 'candidate_identity_sha256': identity,
    'new_gate': {'tests': 164, 'pass': 164, 'log': 'final-targeted-remediation-b-051-physical-exclusions.log.gz'},
    'targeted': {'files': len(target), 'tests': sumtests(target), 'pass': sumtests(target)},
    'fullsuite': {'files': len(full), 'tests': sumtests(full), 'pass': sumtests(full), 'manifest': 'test-manifest.json'},
    'remediation': {'files': len(rem), 'tests': sumtests([x for x in full if x['command'][2] in rem]), 'pass': sumtests([x for x in full if x['command'][2] in rem]), 'manifest': 'remediation-manifest.json', 'selection': 'All tests/*.test.mjs whose filename contains remediation, plus b043-status-parser.test.mjs. Each file executed individually.'},
    'manifest_reconciliation': {'prior_tests': 2275, 'prior_files': 53, 'current_tests': 2439, 'current_files': 54, 'added_file': 'tests/remediation-b-051-physical-exclusions.test.mjs', 'added_tests': 164, 'removed_files': []},
    'quality': {x['label']: {'status': x['status'], 'command': x['command'], 'log': x['log']} for x in quality},
    'eslint': {'errors': 0, 'warnings': 27, 'new_warnings': 0, 'evidence': 'lint-difference.json'},
    'HTTP_PDF_runtime': {'status': 'PASS', 'checks': len(runtime['checks']), 'log': 'http-pdf-runtime.log.gz'},
    'source_binding_reverse_isolation': 'PASS: targeted source tests and catalog-delta.json; three frozen sources, four exact GAP/SF bindings, 316 components, 4155 raw facts, 202 other products and metadata preserved',
    'actual_commands_results_logs': 'gate-results.json',
    'historical_failed_runs': 'Original blocker and initial targeted records preserved; they are not final validation results',
}
assert summary['fullsuite']['tests'] == 4592 and summary['targeted']['tests'] == 1251 and len(runtime['checks']) == 22
save('validation-summary.json', summary)
part = copy.deepcopy(read(OLD / 'completion-b051-partition.json'))
part['completed_current_receipts'] = sorted(set(part['completed_current_receipts']) | EXACT)
part['source_clear_no_current_receipt'] = sorted(set(part['source_clear_no_current_receipt']) - EXACT)
save('completion-b051-partition.json', part)
previous = read(OLD / 'publication-completion-checkpoint.json')
cp = {k: copy.deepcopy(previous[k]) for k in ['current_B071_revalidated_signatures', 'current_B071_not_revalidated', 'historical_only', 'historical_DEFER_SAFE_signatures', 'holds_unchanged', 'additional_B051_holds_unchanged']}
cp.update({
    'classification': 'CURRENT_EVIDENCE_CHECKPOINT_NOT_GLOBAL_EXECUTION_LEDGER',
    'status': 'COMPLETE_VALIDATION_PASS_READY_FOR_ATOMIC_PUBLICATION',
    'tested_revision': BASE, 'candidate_identity_sha256': identity,
    'publication_revision': 'Containing Git commit; secure publisher verifies actual HEAD/origin/main/remote equality and clean working tree after push',
    'documented_campaign_signatures': sorted(set(previous['documented_campaign_signatures']) | EXACT),
    'documented_campaign_count': 53, 'global_resolved_open': 'UNKNOWN', 'P2_credit': 0,
    'HARNESS_AUTONOMY_V1': {'used': 29, 'ordinary_limit': 12, 'scope_used': 5, 'scope_limit': 6, 'capacity_for_other_roots': 0, 'ledger': 'lint-matching-authorization-and-ledger.json', 'previous_generator_root': 'harness-roots.json'},
    'B050_16_receipts': 'Unchanged exact receipts in prior-receipts.json; fresh fullsuite and targeted B050 regression PASS',
    'current_B051_completed_signatures': part['completed_current_receipts'],
    'B051_partition': 'completion-b051-partition.json',
    'current_completion_receipts': ['completion-receipt-' + s + '.json' for s in sorted(EXACT)],
    'prior_receipts': 'prior-receipts.json', 'current_validation': 'validation-summary.json',
    'prior_checkpoint': str((OLD / 'publication-completion-checkpoint.json').relative_to(OUT.parent.parent.parent.parent.parent)) if False else '../b051-recovery-benefits-69c71dc/publication-completion-checkpoint.json',
    'separate_unresolved_baseline_finding': 'separate-rot-baseline-finding.json',
    'no_authorized_production_packet_remaining': True,
    'next_minimum_decision': 'Authorize a bounded read-only preflight or an exact revalidation scope. No later production scope authorized.',
    'CATALOG_PILOT_GATE': 'REMEDIATION_REQUIRED',
})
assert len(cp['documented_campaign_signatures']) == 53
save('checkpoint.json', cp)
oracle = read(OUT / 'source-oracle.json')
for row in auth['signatures']:
    sig = row['signature_id']
    evidence = next(x for x in auth['source_evidence'] if x['signature'] == sig)
    save('completion-receipt-' + sig + '.json', {
        'classification': 'CURRENT_COMPLETION_RECEIPT_NOT_RECONSTRUCTED_HISTORICAL_CLOSURE',
        'signature': sig, 'status': 'PASS', 'original_binding': row,
        'tested_revision': BASE, 'candidate_identity_sha256': identity,
        'publication': 'Effective published completion only after secure publish.py verifies containing commit on remote main; no future SHA claimed as tested',
        'source_evidence': evidence['original_source_evidence'],
        'frozen_sources': auth['sources'],
        'canonical_contracts': [oracle['standard'][2]] if sig == 'a4e5c76df5cbf2af' else oracle['standard'][:2] + [oracle['plus']],
        'provenance_full_field_evidence': 'catalog-delta.json and R-051-PHYSICAL strict-source-fields-and-Pluss-inheritance',
        'permanent_test': 'tests/remediation-b-051-physical-exclusions.test.mjs',
        'selection_document_priority_proof': '164/164 matrix tests: silence/explicit choice/refusal/conflict/unknown, repeated enrichment, individual_agreement/unknown/general_terms, catalog/custom manual modes, additions, both comparison directions. Before/after status and complete provenance assertions.',
        'closure_gates': 'validation-summary.json', 'command_log_manifest': 'gate-results.json',
        'reverse_and_isolation': 'catalog-delta.json', 'prior_51_receipts': 'prior-receipts.json',
        'mechanical_roots': 'lint-matching-authorization-and-ledger.json; three earlier expectation roots in three-correction-authorization-and-ledger.json; initial generator root in harness-roots.json',
        'separate_rot_status_finding': 'Preserved unresolved baseline finding; no closure credit or status change in this scope',
        'global_resolved_open': 'UNKNOWN', 'P2_credit': 0,
        'CATALOG_PILOT_GATE': 'REMEDIATION_REQUIRED',
    })
(OUT / 'README.md').write_text('''# B-051 Skadedyr og øvrige skadeunntak

Status: komplette sluttgater PASS; to individuelle completion-receipts klare for autorisert
atomisk publisering. Faktisk publiseringsrevisjon er Git-committen som inneholder denne pakken.
Sikret publish.py skal verifisere remote main, HEAD/origin/main og ren arbeidskopi etter push.

Testet HEAD: 0be8fadb7e90fc527cd81c5ae5c89accabb2deb0 med den eksakte
[applikasjonskandidaten](final-candidate-identity.json). Ingen fremtidig commit hevdes testet.
Kun [a4e5c76df5cbf2af](completion-receipt-a4e5c76df5cbf2af.json) og
[af3a3ee673fedc83](completion-receipt-af3a3ee673fedc83.json), med fire originalbindinger.

[Kildefasiten](source-oracle.json) og [full-field reverse-auditen](catalog-delta.json)
beviser tre Standard-radendringer og én Pluss-overstyring. Kildene, metadata, 316 øvrige
komponenter, 4155 øvrige råfakta og 202 andre produkters effektive fakta er uendret.
Ingen engine-, canonical-, mapping-, selection- eller kildeadmissionendring er gjort.

[Ferske sluttgater](validation-summary.json): ny gate164/164, målrettet1251/1251,
remediering2439/2439 i54 filer og fullsuite4592/4592 i152 filer. Alle filer kjøres individuelt
etter eksakte manifester. Typegen/TypeScript, webpack-build og HTTP/PDF22/22 består.
ESLint0feil/27warnings; den kjente protectedCount-advarselen har bare flyttet én linje
etter planlagt import. [Lintdifferansen](lint-difference.json) dokumenterer dette.
[Kommandoer og tapstall](gate-results.json) binder alle ferske logger til samme kandidat.

Den opprinnelige [generatorfeilen](blocker.json) og [holdfeltrettingen](harness-roots.json)
bevares uendret. [De tre senere forventningsfeilene](validation-blocker.json) er rettet
kun etter eksplisitt fullmakt; [felt-/kildebeviset](three-correction-proof.json) beviser
uendret produksjon og full provenance. Originalfeil og originale logger er ikke omskrevet.
[Rotregnskapet](three-correction-authorization-and-ledger.json) fører29/12, scope5/6,
ordinær grense12 og ingen kapasitet til andre røtter. Historiske tellere er uendret.

[Checkpoint](checkpoint.json):53 unike dokumenterte signaturer,51 tidligere receipts uendret.
[B051-partisjonen](completion-b051-partition.json):27 fullført,8 kildeklare kandidater,
2 revalideringskandidater og2 holds. Manglende receipt betyr ikke automatisk produksjonsfeil.
Globalt resolved/open UKJENT; ingen P2-kreditt eller rekonstruksjon av gammel closure-kjede.
[Råtestatusfunnet](separate-rot-baseline-finding.json) er fortsatt uløst og utenfor scope.
Alle tidligere holds, inklusive SC035/SR031, vannmapping og HTU-konflikt, er bevart.

Kontroll: python docs/audit/checkpoints/b051-physical-exclusions-0be8fad/verify.py.
Eksakt staged-sett, aktive checksums, relative lenker, immutable tidligere receipts,
LF/whitespace og begge diffkontroller kreves før sikret publisering.
Logger lagres deterministisk gzip med originalhash; ingen dupliserte råloggkopier.
Historiske pakker refereres direkte og endres ikke. Neste scope krever eksplisitt fullmakt.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
''')
(ROOT / 'docs/development-agent/current-project-status.md').write_text('''# Aktuell dokumentert prosjektstatus

B-051 Skadedyr og øvrige skadeunntak: komplette sluttgater PASS; autorisert atomisk
publisering etter integritetskontroll. Git-committen som inneholder checkpointet identifiserer
publiseringsrevisjonen. Sikret publish.py verifiserer faktisk remote main og ren arbeidskopi.
[Checkpoint](../audit/checkpoints/b051-physical-exclusions-0be8fad/checkpoint.json),
[bevispakke](../audit/checkpoints/b051-physical-exclusions-0be8fad/README.md),
[a4e5c76df5cbf2af-receipt](../audit/checkpoints/b051-physical-exclusions-0be8fad/completion-receipt-a4e5c76df5cbf2af.json),
[af3a3ee673fedc83-receipt](../audit/checkpoints/b051-physical-exclusions-0be8fad/completion-receipt-af3a3ee673fedc83.json).

53 unike dokumenterte kampanjesignaturer etter verifisert publisering;51 tidligere receipts
byteidentiske. B05016, B07110 og B05127 aktuelle receipts. B051s eksakte39-partisjon:
27 fullført/8 kildeklare kandidater uten aktuelle receipts/2 revalideringskandidater/2 holds.
Fravær av receipt betyr ikke automatisk feil i produksjonen. Globalt resolved/open UKJENT;
historiske414/1589 er ikke ferskt globalt regnskap. Historiske tellere/DEFER_SAFE bevares,
ingen P2-kreditt og ingen historisk closure-kjede hevdes rekonstruert.

[Fersk validering](../audit/checkpoints/b051-physical-exclusions-0be8fad/validation-summary.json):
ny gate164/164, målrettet1251/1251, remediering2439/2439 i54 filer, fullsuite4592/4592 i152 filer.
Typegen/TypeScript, webpack-build og HTTP/PDF22/22 PASS. ESLint0feil/27uendrede warnings;
protectedCount har kun flyttet én linje. Full-field-isolasjon:316 øvrige komponenter,
4155 råfakta, metadata og202 øvrige produkter uendret.

HARNESS_AUTONOMY_V129/12, fysisk scope5/6. Ordinær grense12; ingen fremtidig kapasitet.
Én generatorrot, tre navngitte forventningsrøtter og én lintavstemmingsrot er ført separat under eksplisitte unntak.
Produksjonskandidaten er byteidentisk før/etter de tre siste harnessrettingene.
SC019/SR033/157c7afed18eb0fe, vannmapping25004bc4d7dd2c03, SC020/SR032, SC035/SR031,
B0715f31ff4946a666b5 og øvrige checkpoint-holds bevares. Råtestatusfunnet er separat uløst;
protectedCount-opprydding er urørt.

Neste sikre steg: eksplisitt autorisert read-only preflight av neste B051-bolk eller eksakt
revalideringsscope. Ingen senere produksjonsbolk eller egen deployhandling er autorisert.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
''')
print('Completion artifacts prepared; application identity', identity)
