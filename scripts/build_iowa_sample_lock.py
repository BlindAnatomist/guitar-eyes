#!/usr/bin/env python3
"""Build a deterministic source lock for the audited Iowa 1K sample set."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--derivation", required=True, type=Path)
    parser.add_argument("--audit", required=True, type=Path)
    parser.add_argument("--run-id", required=True, type=int)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    derivation = json.loads(args.derivation.read_text(encoding="utf-8"))
    audit = json.loads(args.audit.read_text(encoding="utf-8"))
    audit_by_filename = {
        sample["derivedFilename"]: sample
        for sample in audit["samples"]
    }

    samples = []
    for target in derivation["targets"]:
        filename = target["derived_filename"]
        measured = audit_by_filename.get(filename)
        if not measured:
            raise RuntimeError(f"Audit is missing {filename}")
        if measured["derivedSha256"] != target["derivedSha256"]:
            raise RuntimeError(f"Audit hash mismatch for {filename}")
        if measured["derivedBytes"] != target["derivedBytes"]:
            raise RuntimeError(f"Audit byte mismatch for {filename}")

        samples.append(
            {
                "stringIndex": target["string_index"],
                "stringNumber": target["string_number"],
                "anchorMidi": target["target_midi"],
                "anchorName": target["anchor_name"],
                "sourceFilename": target["source_filename"],
                "sourceSha256": target["sourceSha256"],
                "sourceNoteCount": target["source_note_count"],
                "sourceTargetOrdinal": target["target_note_ordinal"] + 1,
                "selectedOnsetSeconds": target["selectedOnsetSeconds"],
                "selectedDurationSeconds": target["selectedDurationSeconds"],
                "derivedFilename": filename,
                "derivedBytes": target["derivedBytes"],
                "derivedSha256": target["derivedSha256"],
                "activeRmsDbfs": measured["activeRmsDbfs"],
                "peakDbfs": measured["peakDbfs"],
                "targetPitchScore": measured["targetPitchScore"],
                "estimatedMidi": measured["estimatedMidi"],
                "motionRatio": measured["motionRatio"],
                "zeroCrossingHz": measured["zeroCrossingHz"],
            }
        )

    manifest = {
        "schemaVersion": 2,
        "proofIdentity": "Guitar Eyes Iowa systemic sample repair proof 1K",
        "collectionUrl": derivation["collectionUrl"],
        "guitarCatalogUrl": derivation["guitarCatalogUrl"],
        "usageStatement": derivation["usageStatement"],
        "derivationRun": args.run_id,
        "selectionMethod": audit["selectionMethod"],
        "sampleRate": derivation["sampleRate"],
        "normalization": audit["normalization"],
        "setActiveLoudnessSpreadDb": audit["setActiveLoudnessSpreadDb"],
        "samples": samples,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(manifest, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
