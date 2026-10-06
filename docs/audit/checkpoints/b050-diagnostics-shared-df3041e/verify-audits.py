#!/usr/bin/env python3
"""Scope A exact production diff, unchanged catalog, sources and 13 receipts."""
import csv, hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = 'df3041ee8488e2ef1e0aff59cfba0d6dc888afd6'
sha = lambda data: hashlib.sha256(data).hexdigest()
before = subprocess.check_output(['git', 'show', BASE + ':lib/coverage-fact-semantics.ts'], cwd=ROOT).decode()
assert (ROOT / 'lib/coverage-fact-semantics.ts').read_text() == before.replace(
    '  "hund.bruksverdi.grense",\n', '  "hund.bruksverdi.grense",\n  "dyr.diagnostikk.grense",\n')
after = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import {productCatalog} from './lib/product-catalog.ts';process.stdout.write(JSON.stringify(productCatalog));"], cwd=ROOT))
assert after == json.loads((OUT / 'catalog-before.json').read_text())
checkpoint = json.loads((ROOT / 'docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json').read_text())
assert len(checkpoint['campaign_members']) == 13
for member in checkpoint['campaign_members']:
    assert sha((ROOT / member['receipt']).read_bytes()) == member['receipt_sha256']
registry = list(csv.DictReader((ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open()))
assert len(registry) == len({r['signature_id'] for r in registry}) == 1589
for signature, gap, sf in [('7b2587a3bbc0c772', 'GAP-2876', 'SF-4027'), ('b5792662cc2fa9f8', 'GAP-2884', 'SF-4036')]:
    row = next(r for r in registry if r['signature_id'] == signature)
    assert json.loads(row['finding_ids']) == [gap] and json.loads(row['source_fact_ids']) == [sf]
manifest = json.loads((ROOT / 'catalog/sources/boat-pet/manifest.json').read_text())['documents']
hashes = {'gjensidige-dog-product.html': 'fd3fcb6e6b69803bcf7fdaeec80802fab764f74a0f465e5fd5c063c2eed8db58',
          'gjensidige-dog-treatment-terms.pdf': '8e62b121bdd630f1873803e2312150daa67186b52f744d3ab00f6d3c6de46cb6'}
for filename, expected in hashes.items():
    source = next(s for s in manifest if s['filename'] == filename)
    assert source['sha256'] == expected == sha((ROOT / source['localPath']).read_bytes())
changes = subprocess.check_output(['git', 'diff', '--name-only', BASE], cwd=ROOT).decode().splitlines()
assert set(changes) <= {'lib/coverage-fact-semantics.ts', 'tests/coverage-status.test.mjs'}
report = {'status': 'PASS', 'tested_base_revision': BASE, 'catalog_and_metadata_unchanged': True,
          'unchanged_catalog_components': len(after['facts']), 'prior_receipts_verified': 13,
          'exact_key_only': 'dyr.diagnostikk.grense', 'source_hashes': hashes,
          'signature_credit': [], 'global_resolved_open': 'UNKNOWN'}
(OUT / 'source-reverse-audit.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
