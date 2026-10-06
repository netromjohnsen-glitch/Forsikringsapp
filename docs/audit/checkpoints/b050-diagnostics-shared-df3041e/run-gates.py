#!/usr/bin/env python3
"""Current scope gates, exact candidate identity, retained logs and hard stop."""
import gzip, hashlib, json, os, re, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = 'df3041ee8488e2ef1e0aff59cfba0d6dc888afd6'
FILES = ['lib/coverage-fact-semantics.ts', 'tests/coverage-status.test.mjs']
sha = lambda data: hashlib.sha256(data).hexdigest()

def identity():
    data = {'tested_base_revision': BASE,
            'files_sha256': {f: sha((ROOT / f).read_bytes()) for f in FILES},
            'diff_sha256': sha(subprocess.check_output(['git', 'diff', BASE, '--', *FILES], cwd=ROOT))}
    data['candidate_identity'] = sha(json.dumps(data, sort_keys=True).encode())
    return data

def run(label, command):
    start = time.monotonic()
    env = dict(os.environ, XDG_CONFIG_HOME='/tmp/b050-diagnostics-build-config')
    proc = subprocess.run(command, cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    log = label + '.log.gz'
    assert not (OUT / log).exists(), 'Retain previous runs; use a new label'
    (OUT / log).write_bytes(gzip.compress(proc.stdout, mtime=0))
    text = proc.stdout.decode(errors='replace')
    tap = {k: int(m[-1]) for k in ['tests', 'pass', 'fail', 'cancelled', 'skipped']
           if (m := re.findall(r'^# ' + k + r' (\d+)\s*$', text, re.M))}
    result = {'label': label, 'command': command, 'exit_code': proc.returncode,
              'duration_seconds': round(time.monotonic() - start, 3), 'log': log,
              'log_sha256': sha((OUT / log).read_bytes()), 'output_sha256': sha(proc.stdout),
              'environment_overrides': {'XDG_CONFIG_HOME': env['XDG_CONFIG_HOME']}, 'tap': tap, **identity()}
    ok = proc.returncode == 0 and not tap.get('fail', 0)
    if label == 'eslint':
        reports = json.loads(text)
        result['errors'] = sum(r['errorCount'] for r in reports)
        result['warnings'] = sum(r['warningCount'] for r in reports)
        ok = ok and result['errors'] == 0
    if label == 'http-pdf-runtime':
        decoder = json.JSONDecoder()
        report = None
        for index, char in enumerate(text):
            if char == '{':
                try: candidate, _ = decoder.raw_decode(text[index:])
                except ValueError: continue
                if isinstance(candidate, dict) and candidate.get('result') == 'PASS':
                    report = candidate
                    break
        result['runtime'] = report
        ok = ok and report is not None
    result['status'] = 'PASS' if ok else 'FAIL'
    path = OUT / 'gate-results.json'
    results = json.loads(path.read_text()) if path.exists() else {'results': []}
    results['results'].append(result)
    path.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
    print(label, result['status'], tap, flush=True)
    if not ok:
        print(text[-14000:], flush=True)
        sys.exit(1)

if sys.argv[1] == 'targeted':
    for name in ['coverage-status', 'remediation-b-050', 'nito-remediation-b018',
                 'nito-remediation-b022', 'remediation-b-071', 'remediation-b-072',
                 'liv-reduction-selection-evidence', 'supporting-terms',
                 'catalog-enrichment-provenance', 'product-comparison']:
        run('targeted-' + name, ['node', '--test-reporter=tap', 'tests/' + name + '.test.mjs'])
elif sys.argv[1] == 'full':
    manifest = sorted(str(p.relative_to(ROOT)) for p in (ROOT / 'tests').glob('*.test.mjs'))
    (OUT / 'test-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    for path in manifest:
        run('full-' + Path(path).stem, ['node', '--test-reporter=tap', path])
    for label, command in [
        ('typegen', ['npx', '--no-install', 'next', 'typegen']),
        ('typescript', ['npx', '--no-install', 'tsc', '--noEmit', '--incremental', 'false']),
        ('eslint', ['node', 'node_modules/eslint/bin/eslint.js', '.', '--format', 'json']),
        ('production-build', ['npx', '--no-install', 'next', 'build', '--webpack']),
        ('http-pdf-runtime', ['node', 'scripts/verify-analysis-http.mjs']),
        ('diff-check', ['git', 'diff', '--check']),
    ]:
        run(label, command)
else:
    raise SystemExit('Use targeted or full')
