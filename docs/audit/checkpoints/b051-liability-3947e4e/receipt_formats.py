"""Strict verification of explicitly inventoried immutable receipt formats."""
import csv
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]


def load_context():
    formats = json.loads((HERE / 'receipt-formats.json').read_text())['formats']
    with (ROOT / 'docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv').open() as stream:
        registry = {r['signature_id']: r for r in csv.DictReader(stream)}
    members = json.loads((HERE / 'receipt-schema-diagnostic.json').read_text())['receipts']
    assert len(registry) == 1589
    return formats, registry, members


def string_list(value):
    assert type(value) is list and value and all(type(x) is str for x in value)
    assert len(value) == len(set(value))
    return value


def verify_receipt(receipt, signature, formats, registry):
    assert type(receipt) is dict
    matches = [f for f in formats if sorted(receipt) == f['required_keys']
               and all(receipt[k] == v for k, v in f['discriminator'].items())
               and any(e['signature'] == signature for e in f['immutable_examples'])]
    assert len(matches) == 1, 'Unknown, missing-field or ambiguous receipt format'
    form = matches[0]
    assert type(signature) is str and signature in registry
    assert type(receipt['signature']) is str and receipt['signature'] == signature
    assert receipt['status'] == 'PASS'
    row = registry[signature]
    gaps = string_list(json.loads(row['finding_ids']))
    sfs = string_list(json.loads(row['source_fact_ids']))
    products = [json.loads(x) for x in string_list(json.loads(row['products']))]
    families = json.loads(row['provider_family_scope'])
    assert all(type(p) is list and len(p) == 5 for p in products)
    assert len(gaps) == len(sfs) == len(products)
    pairs = list(zip(gaps, sfs))
    represented = 0
    for key in ['original_binding', 'original_registry_binding']:
        if key in form['binding_fields']:
            assert type(receipt[key]) is dict and receipt[key] == row
            represented += 1
    if 'gap_ids' in form['binding_fields']:
        assert string_list(receipt['gap_ids']) == gaps
        assert string_list(receipt['sf_ids']) == sfs
        represented += 1
    if 'gap' in form['binding_fields']:
        assert type(receipt['gap']) is str and type(receipt['sf']) is str
        assert len(pairs) == 1 and (receipt['gap'], receipt['sf']) == pairs[0]
        represented += 1
    if 'GAP_SF_bindings' in form['binding_fields']:
        entries = receipt['GAP_SF_bindings']
        assert type(entries) is list and len(entries) == len(pairs)
        if all(type(e) is dict and set(e) == {'GAP', 'SF', 'product_identity'} for e in entries):
            for e, pair, product in zip(entries, pairs, products):
                assert all(type(e[k]) is str for k in e)
                assert (e['GAP'], e['SF']) == pair
                assert json.loads(e['product_identity']) == product
        else:
            assert all(type(e) is list and len(e) == 2 and all(type(x) is str for x in e) for e in entries)
            assert entries == [list(p) for p in pairs]
        represented += 1
    assert represented > 0, 'No explicit original binding representation'
    for key, expected in [('provider', {p[0] for p in products}),
                          ('scope', {p[2] for p in products}),
                          ('agreement_scope', {p[2] for p in products}),
                          ('insurance_type', {f[1] for f in families}),
                          ('type', {f[1] for f in families})]:
        if key in form['binding_fields']:
            assert type(receipt[key]) is str and expected == {receipt[key]}, key
    product_ids = list(dict.fromkeys(p[3] for p in products))
    for key in ['product', 'product_id']:
        if key in form['binding_fields']:
            assert type(receipt[key]) is str and product_ids == [receipt[key]], key
    if 'products' in form['binding_fields']:
        assert string_list(receipt['products']) == product_ids
    for key in ['version', 'terms_version']:
        if key in form['binding_fields']:
            assert type(receipt[key]) is str
            versions = {p[4] for p in products}
            if key in form['unknown_version_literals']:
                assert versions == {None} and receipt[key] == form['unknown_version_literals'][key]
            else:
                assert versions == {receipt[key]}
    return form['format_id']


def verify_all():
    formats, registry, members = load_context()
    checkpoint = json.loads((ROOT / 'docs/audit/checkpoints/b051-physical-exclusions-0be8fad/checkpoint.json').read_text())
    assert len(members) == len({r['signature'] for r in members}) == 53
    assert {r['signature'] for r in members} == set(checkpoint['documented_campaign_signatures'])
    result = []
    for member in members:
        raw = (ROOT / member['path']).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == member['sha256']
        format_id = verify_receipt(json.loads(raw), member['signature'], formats, registry)
        result.append({'signature': member['signature'], 'format': format_id,
                       'path': member['path'], 'sha256': member['sha256'], 'status': 'PASS'})
    return {'status': 'PASS', 'exact_receipts': 53, 'formats': len(formats), 'receipts': result}


if __name__ == '__main__':
    print(json.dumps(verify_all(), ensure_ascii=False, indent=2))
