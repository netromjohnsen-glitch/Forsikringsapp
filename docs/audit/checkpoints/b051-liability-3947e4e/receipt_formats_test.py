"""All established formats: identity, type, completeness and conflict controls."""
import copy
import json
import unittest

from receipt_formats import ROOT, load_context, verify_all, verify_receipt


class ReceiptFormatTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.formats, cls.registry, cls.members = load_context()

    def rejected(self, receipt, signature, formats=None):
        with self.assertRaises((AssertionError, KeyError, TypeError, ValueError)):
            verify_receipt(receipt, signature, self.formats if formats is None else formats, self.registry)

    def test_exact_53_immutable_receipts(self):
        self.assertEqual(verify_all()['exact_receipts'], 53)

    def test_each_format_negative_controls(self):
        exercised = set()
        for member in self.members:
            receipt = json.loads((ROOT / member['path']).read_text())
            form_id = verify_receipt(receipt, member['signature'], self.formats, self.registry)
            form = next(f for f in self.formats if f['format_id'] == form_id)
            exercised.add(form_id)
            with self.subTest(signature=member['signature'], format=form_id):
                for key in form['required_keys']:
                    changed = copy.deepcopy(receipt)
                    del changed[key]
                    self.rejected(changed, member['signature'])
                for key in form['binding_fields'] + ['signature', 'status']:
                    changed = copy.deepcopy(receipt)
                    changed[key] = None
                    self.rejected(changed, member['signature'])
                changed = copy.deepcopy(receipt)
                changed['signature'] = '0000000000000000'
                self.rejected(changed, member['signature'])
                # Every represented binding is checked, including redundant ones.
                for key in ['original_binding', 'original_registry_binding']:
                    if key in receipt:
                        for field in ['signature_id', 'finding_ids', 'source_fact_ids', 'products']:
                            changed = copy.deepcopy(receipt)
                            changed[key][field] = 'WRONG_BINDING'
                            self.rejected(changed, member['signature'])
                for key in ['gap_ids', 'sf_ids', 'gap', 'sf', 'GAP_SF_bindings']:
                    if key in receipt:
                        changed = copy.deepcopy(receipt)
                        if key == 'GAP_SF_bindings':
                            if type(changed[key][0]) is dict:
                                for field in ['GAP', 'SF', 'product_identity']:
                                    altered = copy.deepcopy(receipt)
                                    altered[key][0][field] = 'WRONG_BINDING'
                                    self.rejected(altered, member['signature'])
                            else:
                                for index in [0, 1]:
                                    altered = copy.deepcopy(receipt)
                                    altered[key][0][index] = 'WRONG_BINDING'
                                    self.rejected(altered, member['signature'])
                        else:
                            changed[key] = ['WRONG_BINDING'] if type(changed[key]) is list else 'WRONG_BINDING'
                            self.rejected(changed, member['signature'])
                for key in ['provider', 'insurance_type', 'type', 'scope', 'agreement_scope',
                            'product', 'product_id', 'products', 'version', 'terms_version']:
                    if key in receipt:
                        changed = copy.deepcopy(receipt)
                        changed[key] = ['WRONG_VARIANT'] if type(receipt[key]) is list else 'WRONG_VARIANT'
                        self.rejected(changed, member['signature'])
                # Unknown and ambiguous formats cannot acquire permissive fallback.
                changed = copy.deepcopy(receipt)
                changed['unregistered_binding_representation'] = {}
                self.rejected(changed, member['signature'])
                for discriminator in form['discriminator']:
                    changed = copy.deepcopy(receipt)
                    changed[discriminator] = 'UNKNOWN_FORMAT'
                    self.rejected(changed, member['signature'])
                self.rejected(receipt, member['signature'], self.formats + [copy.deepcopy(form)])
        self.assertEqual(exercised, {f['format_id'] for f in self.formats})


if __name__ == '__main__':
    unittest.main()
