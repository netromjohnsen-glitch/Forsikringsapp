"""Positive and negative occurrence/field controls against immutable evidence."""
import copy
import gzip
import json
from pathlib import Path
import unittest

from lint_matching import reconcile

OUT = Path(__file__).resolve().parent
OLD = OUT.parent / 'b051-recovery-benefits-69c71dc'


def warnings(path):
    return [dict(path=r['filePath'].split('/Forsikringsapp/')[-1], filePath=r['filePath'], **m)
            for r in json.loads(gzip.decompress(path.read_bytes())) for m in r['messages']]


class LintMatchingTests(unittest.TestCase):
    def setUp(self):
        self.old = warnings(OLD / 'final-eslint.log.gz')
        self.duplicates = [w for w in self.old if w['path'] == 'tests/catalog-enrichment-provenance.test.mjs'
                           and w['message'] == "'_sourceType' is defined but never used."]

    def test_historical_evidence_matches_itself(self):
        result = reconcile(self.old, copy.deepcopy(self.old))
        self.assertEqual(result['exact_match_count'], 27)
        self.assertEqual(result['historical_count'], result['current_count'])

    def test_same_message_at_two_lines_keeps_positions(self):
        self.assertEqual([w['line'] for w in self.duplicates], [44, 103])
        result = reconcile(self.duplicates, self.duplicates[::-1])
        self.assertEqual(result['exact_match_count'], 2)
        self.assertEqual(sorted(w['line'] for w in result['unchanged_occurrences']), [44, 103])

    def test_input_order_does_not_change_result(self):
        self.assertEqual(reconcile(self.old, self.old), reconcile(self.old[::-1], self.old[9:] + self.old[:9]))

    def test_extra_occurrence_rejected(self):
        with self.assertRaises(AssertionError):
            reconcile(self.old, self.old + [self.old[0]])

    def test_missing_occurrence_rejected(self):
        with self.assertRaises(AssertionError):
            reconcile(self.old, self.old[1:])

    def test_every_field_is_protected(self):
        for field in self.old[0]:
            with self.subTest(field=field):
                changed = copy.deepcopy(self.old)
                changed[0][field] = {'unexpected_value': changed[0][field]}
                with self.assertRaises(AssertionError):
                    reconcile(self.old, changed)
                changed = copy.deepcopy(self.old)
                del changed[0][field]
                with self.assertRaises(AssertionError):
                    reconcile(self.old, changed)

    def test_identical_duplicates_keep_exact_multiplicity(self):
        identical = [copy.deepcopy(self.old[0]) for _ in range(3)]
        result = reconcile(identical, identical[::-1])
        self.assertEqual(result['exact_match_count'], 3)
        self.assertEqual(result['unchanged_occurrences'], identical)
        with self.assertRaises(AssertionError):
            reconcile(identical, identical[:2])
        with self.assertRaises(AssertionError):
            reconcile(identical, identical + [identical[0]])

    def test_position_move_requires_explicit_separate_evidence(self):
        changed = copy.deepcopy(self.old[:1])
        changed[0]['line'] += 1
        changed[0]['endLine'] += 1
        with self.assertRaises(AssertionError):
            reconcile(self.old[:1], changed)
        move = {'before': self.old[0], 'after': changed[0], 'evidence': 'Synthetic position move for matcher control only'}
        result = reconcile(self.old[:1], changed, [move])
        self.assertEqual(result['exact_match_count'], 0)
        self.assertEqual(len(result['documented_moves']), 1)
        with self.assertRaises(AssertionError):
            reconcile(self.old[:1], changed, [move, move])
        with self.assertRaises(AssertionError):
            reconcile(self.old[:1], changed, [{**move, 'evidence': ''}])
        for field in ['path', 'ruleId', 'severity', 'message']:
            altered = copy.deepcopy(changed)
            altered[0][field] = 'Unexpected non-position change'
            with self.subTest(field=field), self.assertRaises(AssertionError):
                reconcile(self.old[:1], altered, [{**move, 'after': altered[0]}])


if __name__ == '__main__':
    unittest.main()
