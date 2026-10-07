"""Preserve required checkpoint hold fields with their individual provenance."""
from copy import deepcopy

REQUIRED_FIELDS = ("holds_unchanged", "additional_B051_holds_unchanged")


def preserve_hold_fields(checkpoint, origin_path, origin_sha256):
    result = {}
    for field in REQUIRED_FIELDS:
        value = checkpoint[field]
        if not isinstance(value, list) or any(type(item) is not str for item in value):
            raise TypeError(f"{field} must be a list of string identities")
        result[field] = {
            "origin_path": origin_path,
            "origin_sha256": origin_sha256,
            "origin_field": field,
            "value": deepcopy(value),
            "status": "UNCHANGED_FROM_REFERENCED_CHECKPOINT",
        }
    return result
