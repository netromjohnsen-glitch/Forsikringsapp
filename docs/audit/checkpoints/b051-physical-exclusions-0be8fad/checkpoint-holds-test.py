"""Focused controls for the explicitly authorized generator correction."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PATH = "docs/audit/checkpoints/b051-recovery-benefits-69c71dc/publication-completion-checkpoint.json"
BASE = "0be8fadb7e90fc527cd81c5ae5c89accabb2deb0"
spec = importlib.util.spec_from_file_location("checkpoint_holds", HERE / "checkpoint-holds.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class HoldContract(unittest.TestCase):
    def setUp(self):
        self.raw = (ROOT / PATH).read_bytes()
        self.cp = json.loads(self.raw)
        self.before = copy.deepcopy(self.cp)
        self.digest = hashlib.sha256(self.raw).hexdigest()

    def preserve(self, cp):
        return module.preserve_hold_fields(cp, PATH, self.digest)

    def test_exact_separate_preservation_and_origin(self):
        result = self.preserve(self.cp)
        self.assertEqual(tuple(result), module.REQUIRED_FIELDS)
        for field in module.REQUIRED_FIELDS:
            self.assertEqual(result[field], {
                "origin_path": PATH, "origin_sha256": self.digest,
                "origin_field": field, "value": self.cp[field],
                "status": "UNCHANGED_FROM_REFERENCED_CHECKPOINT",
            })
            self.assertIsNot(result[field]["value"], self.cp[field])
        self.assertEqual(self.cp, self.before)
        self.assertEqual((ROOT / PATH).read_bytes(), self.raw)
        self.assertEqual(subprocess.check_output(["git", "show", f"{BASE}:{PATH}"], cwd=ROOT), self.raw)

    def test_each_missing_field_rejected(self):
        for field in module.REQUIRED_FIELDS:
            cp = copy.deepcopy(self.cp)
            del cp[field]
            with self.assertRaises(KeyError):
                self.preserve(cp)

    def test_each_wrong_type_rejected_without_mutation(self):
        for field in module.REQUIRED_FIELDS:
            for value in (None, {}, "SC-035/SR-031", [1], ["valid", None]):
                cp = copy.deepcopy(self.cp)
                cp[field] = value
                before = copy.deepcopy(cp)
                with self.assertRaises(TypeError):
                    self.preserve(cp)
                self.assertEqual(cp, before)


if __name__ == "__main__":
    unittest.main()
