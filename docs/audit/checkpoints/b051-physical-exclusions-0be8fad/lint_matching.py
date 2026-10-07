"""Exact, order-independent, multiplicity-preserving lint reconciliation."""
from collections import Counter
import json


def fingerprint(warning):
    # Every supplied field participates, including positions and nested metadata.
    return json.dumps(warning, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def reconcile(historical, current, documented_moves=()):
    old = Counter(fingerprint(w) for w in historical)
    new = Counter(fingerprint(w) for w in current)
    common = old & new
    missing = old - common
    extra = new - common
    moves = []
    for move in documented_moves:
        assert move['evidence'], 'Position changes need independent evidence'
        assert move['before'].keys() == move['after'].keys(), 'A position move cannot add or remove fields'
        positions = {'line', 'column', 'endLine', 'endColumn'}
        for field in move['before'].keys() - positions:
            assert move['before'][field] == move['after'][field], 'A documented position move cannot change other lint fields'
        before, after = fingerprint(move['before']), fingerprint(move['after'])
        assert before != after, 'An unchanged occurrence must match exactly'
        assert missing[before] > 0 and extra[after] > 0, 'A move must consume one unmatched occurrence on each side'
        missing[before] -= 1
        extra[after] -= 1
        moves.append(move)
    assert not +missing and not +extra, {'missing': list((+missing).elements()), 'extra': list((+extra).elements())}
    return {
        'status': 'PASS',
        'historical_count': sum(old.values()),
        'current_count': sum(new.values()),
        'exact_match_count': sum(common.values()),
        'unchanged_occurrences': [json.loads(k) for k in sorted(common.elements())],
        'documented_moves': sorted(moves, key=lambda m: (fingerprint(m['before']), fingerprint(m['after']))),
    }
