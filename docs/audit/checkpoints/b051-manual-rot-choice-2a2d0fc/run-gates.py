"""Reuse the committed checked runner; bind every log to exact application bytes."""
from pathlib import Path
import sys, json, hashlib
sys.dont_write_bytecode = True
R = Path(__file__).resolve().parents[4]
O = Path(__file__).resolve().parent
source = R / 'docs/audit/checkpoints/b051-physical-exclusions-0be8fad/run-final-gates.py'
ns = {'__file__': str(source), '__name__': 'existing_runner_reused'}
exec(compile(source.read_text().split('mode=sys.argv[1]')[0], str(source), 'exec'), ns)
auth = json.loads((O / 'authorization.json').read_text())
app = auth['production_files'] + auth['planned_test_files']
ns.update(ROOT=R, OUT=O, BASE=auth['baseline'], APP=app)
mode = sys.argv[1]
old = ['nito-remediation-b020', 'remediation-b-050', 'remediation-b-051',
       *['remediation-b-051-' + n for n in ['rot', 'legal', 'smart', 'health-help', 'liability',
       'garden', 'events-buildings', 'craftsmanship', 'settlement-age', 'recovery-benefits', 'physical-exclusions']]]
if mode == 'targeted':
    names = ['remediation-b-051-rot-status', *old, 'nito-remediation-wave1', 'remediation-b-071',
             'nito-remediation-b018', 'nito-remediation-b022', 'remediation-b-072',
             'liv-reduction-selection-evidence', 'supporting-terms', 'catalog-enrichment-provenance',
             'coverage-status', 'insurance-normalization', 'catalog-comparison', 'product-comparison-hardening',
             'product-comparison', 'product-comparison-semantic', 'manual-agreement', 'boat-pet-catalog',
             'gjensidige-hus-catalog', 'mc-bobil-addon-selection', 'manual-runtime-flow', 'mc-bobil-manual', 'product-coverage-evidence']
    commands = [('targeted-' + n, ['node', '--test-reporter=tap', 'tests/' + n + '.test.mjs']) for n in names]
elif mode == 'targeted-recovery':
    commands = [('targeted-mc-bobil-manual', ['node', '--test-reporter=tap', 'tests/mc-bobil-manual.test.mjs'])]
elif mode == 'audit-lint':
    commands = [('eslint-audit-final', ['node', 'node_modules/eslint/bin/eslint.js', '.', '--format', 'json'])]
elif mode == 'full':
    manifest = sorted(str(p.relative_to(R)) for p in (R / 'tests').glob('*.test.mjs'))
    rem = [p for p in manifest if 'remediation' in Path(p).name or Path(p).name == 'b043-status-parser.test.mjs']
    for name, data in [('test-manifest.json', manifest), ('remediation-manifest.json', rem)]:
        (O / name).write_text(json.dumps(data, indent=2) + '\n')
    commands = [('full-' + Path(p).stem, ['node', '--test-reporter=tap', p]) for p in manifest]
elif mode == 'quality':
    commands = [('typegen', ['npx', '--no-install', 'next', 'typegen']),
                ('typescript', ['npx', '--no-install', 'tsc', '--noEmit', '--incremental', 'false']),
                ('eslint', ['node', 'node_modules/eslint/bin/eslint.js', '.', '--format', 'json']),
                ('production-build', ['npx', '--no-install', 'next', 'build', '--webpack']),
                ('http-pdf-runtime', ['node', 'scripts/verify-analysis-http.mjs']),
                ('diff-check', ['git', 'diff', '--check'])]
else:
    raise ValueError(mode)
params = {'existing_runner': str(source.relative_to(R)), 'existing_runner_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
          'baseline': auth['baseline'], 'output': str(O.relative_to(R)), 'application_files': app,
          'reuse': 'Original checked run function; only scope parameters and explicit command manifest supplied'}
p = O / 'runner-parameters.json'
if p.exists():
    assert json.loads(p.read_text()) == params
else:
    p.write_text(json.dumps(params, indent=2) + '\n')
results = []
for label, command in commands:
    ok = ns['run'](label if mode in ['quality', 'audit-lint'] else 'final-' + label, command)
    results.append(ok)
    if not ok and mode == 'quality':
        break
sys.exit(0 if all(results) else 1)
