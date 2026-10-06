#!/usr/bin/env python3
"""Documentation integrity, exact LF equivalence and preserved evidence."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
OLD = OUT.parent / "b050-diagnostics-shared-df3041e"
sha = lambda data: hashlib.sha256(data).hexdigest()
receipt = json.loads((OUT / "receipt.json").read_text())
original = subprocess.check_output(["git", "show", receipt["base_revision"] + ":" + receipt["changed_authorization"]], cwd=ROOT)
current = (ROOT / receipt["changed_authorization"]).read_bytes()
assert original.replace(b"\r\n", b"\n") == current
assert original.splitlines() == current.splitlines()
assert sha(original) == receipt["before_sha256"] and sha(current) == receipt["after_sha256"]
for directory in [OLD, OUT]:
    for line in (directory / "SHA256SUMS").read_text().splitlines():
        expected, filename = line.split("  ", 1)
        assert sha((directory / filename).read_bytes()) == expected, filename
assert sha((OLD / "gate-results.json").read_bytes()) == receipt["historical_gate_results_sha256"]
checkpoint = json.loads((ROOT / "docs/audit/checkpoints/development-agent-ef5b0bc/checkpoint.json").read_text())
assert len(checkpoint["campaign_members"]) == 13
for member in checkpoint["campaign_members"]:
    assert sha((ROOT / member["receipt"]).read_bytes()) == member["receipt_sha256"]
for filename in ["lib/coverage-fact-semantics.ts", "tests/coverage-status.test.mjs"]:
    assert (ROOT / filename).read_bytes() == subprocess.check_output(["git", "show", receipt["base_revision"] + ":" + filename], cwd=ROOT)
subprocess.run(["git", "diff", "--check"], cwd=ROOT, check=True)
subprocess.run(["git", "diff", "--cached", "--check"], cwd=ROOT, check=True)
print("LF equivalence, checksums, 13 receipts, unchanged shared code, work/staged diff integrity PASS")
