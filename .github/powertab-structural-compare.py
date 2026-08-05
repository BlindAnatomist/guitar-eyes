#!/usr/bin/env python3

import gzip
import hashlib
import json
import os
from pathlib import Path


def load(path: Path):
    compressed = path.read_bytes()
    decompressed = gzip.decompress(compressed)
    value = json.loads(decompressed.decode("utf-8"))
    return compressed, decompressed, value


def describe(value):
    text = json.dumps(value, ensure_ascii=False, sort_keys=True)
    return text if len(text) <= 1000 else text[:1000] + "…"


def compare(left, right, path="$", differences=None):
    if differences is None:
        differences = []
    if type(left) is not type(right):
        differences.append(
            {
                "path": path,
                "kind": "type",
                "source": type(left).__name__,
                "editor": type(right).__name__,
            }
        )
        return differences
    if isinstance(left, dict):
        for key in sorted(set(left) | set(right)):
            child = f"{path}.{key}"
            if key not in left:
                differences.append(
                    {"path": child, "kind": "added", "editor": describe(right[key])}
                )
            elif key not in right:
                differences.append(
                    {"path": child, "kind": "removed", "source": describe(left[key])}
                )
            else:
                compare(left[key], right[key], child, differences)
    elif isinstance(left, list):
        if len(left) != len(right):
            differences.append(
                {
                    "path": path,
                    "kind": "length",
                    "source": len(left),
                    "editor": len(right),
                }
            )
        for index, (source_item, editor_item) in enumerate(zip(left, right)):
            compare(source_item, editor_item, f"{path}[{index}]", differences)
    elif left != right:
        differences.append(
            {
                "path": path,
                "kind": "value",
                "source": describe(left),
                "editor": describe(right),
            }
        )
    return differences


def file_record(compressed, decompressed, value):
    return {
        "compressedBytes": len(compressed),
        "compressedSha256": hashlib.sha256(compressed).hexdigest(),
        "decompressedBytes": len(decompressed),
        "decompressedSha256": hashlib.sha256(decompressed).hexdigest(),
        "internalVersion": value.get("version"),
    }


def main():
    evidence = Path(os.environ["EVIDENCE_DIR"])
    source_path = evidence / "source-derived-input.pt2"
    editor_path = Path(os.environ["EDITOR_FILE"])

    source_compressed, source_decompressed, source = load(source_path)
    editor_compressed, editor_decompressed, editor = load(editor_path)

    if source.get("version") != 11:
        raise SystemExit(
            f"source internal version is {source.get('version')!r}, expected 11"
        )
    if editor.get("version") != 11:
        raise SystemExit(
            f"editor internal version is {editor.get('version')!r}, expected 11"
        )

    (evidence / "source-derived-input.json").write_text(
        json.dumps(source, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    (evidence / "editor-resaved-output.json").write_text(
        json.dumps(editor, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    differences = compare(source, editor)
    report = {
        "source": file_record(source_compressed, source_decompressed, source),
        "editor": file_record(editor_compressed, editor_decompressed, editor),
        "jsonEqual": source == editor,
        "differenceCount": len(differences),
        "differences": differences,
    }
    (evidence / "structural-comparison.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
