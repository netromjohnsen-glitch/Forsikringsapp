#!/usr/bin/env python3
"""Publish an explicitly staged scope; every failed prerequisite aborts."""
import argparse
import json
import subprocess
from pathlib import Path
from unittest.mock import Mock

ROOT = Path(__file__).resolve().parents[4]


def checked_sequence(run, message):
    # No shell command chaining: check=True aborts before the next operation.
    for command in (["git", "diff", "--check"],
                    ["git", "diff", "--cached", "--check"],
                    ["git", "commit", "-m", message],
                    ["git", "push", "origin", "HEAD:main"]):
        run(command, cwd=ROOT, check=True)


def self_test():
    for failed_index in range(3):
        calls = []

        def simulate(command, **options):
            assert options["check"] is True
            calls.append(command)
            if len(calls) - 1 == failed_index:
                raise subprocess.CalledProcessError(1, command)

        try:
            checked_sequence(simulate, "synthetic")
        except subprocess.CalledProcessError:
            pass
        else:
            raise AssertionError("Failure must propagate")
        assert len(calls) == failed_index + 1
        assert not any(c[1] == "push" for c in calls)
    successful = Mock()
    checked_sequence(successful, "synthetic")
    assert [c.args[0][1] for c in successful.call_args_list] == ["diff", "diff", "commit", "push"]
    print("Publication failure/success exit-status controls PASS")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--self-test", action="store_true")
    p.add_argument("--expected-files")
    p.add_argument("--expected-head")
    p.add_argument("--message")
    args = p.parse_args()
    if args.self_test:
        self_test()
    else:
        assert args.expected_files and args.expected_head and args.message
        expected = json.loads(Path(args.expected_files).read_text())
        actual = subprocess.check_output(["git", "diff", "--cached", "--name-only", "-z"], cwd=ROOT).decode().split("\0")[:-1]
        assert set(actual) == set(expected) and len(actual) == len(expected), (actual, expected)
        head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT).decode().strip()
        remote = subprocess.check_output(["git", "ls-remote", "origin", "refs/heads/main"], cwd=ROOT).decode().split()[0]
        assert head == remote == args.expected_head
        checked_sequence(subprocess.run, args.message)
        published = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT).decode().strip()
        remote = subprocess.check_output(["git", "ls-remote", "origin", "refs/heads/main"], cwd=ROOT).decode().split()[0]
        tracking = subprocess.check_output(["git", "rev-parse", "origin/main"], cwd=ROOT).decode().strip()
        assert published == remote == tracking
        assert not subprocess.check_output(["git", "status", "--porcelain"], cwd=ROOT)
        print("Verified HEAD = origin/main = GitHub main; clean:", published)
