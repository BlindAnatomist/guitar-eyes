#!/usr/bin/env python3
"""Verify the frozen archive and every asset before extracting or installing tools."""
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile

HERE = Path(__file__).resolve().parent
RUNTIME = "c8376b990874eee60f31b5aaad47cd8b12ca3f19"
CLOSURE = "f07c679005c4948640f8aa7371a82c5cc7b79981"
SOURCE_OBJECTS = {
    "src": "c8ad19eb3ee15625240ec43d7bc06e2e3cc0ad16",
    "public": "1a5d97cb24950f5dc31f3224340ab9e4e21f94b8",
    "package.json": "8b8f39cc6d52174cbadddd02b67e659518433a89",
    "package-lock.json": "145a4dadf237906d301554655ca895365acb8505",
}


def require(condition, label):
    if not condition:
        raise ValueError(label)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def safe_name(name):
    return (isinstance(name, str) and bool(name) and "\\" not in name
            and not name.startswith("/")
            and all(part not in ("", ".", "..") for part in name.split("/")))


def verify(destination, checkout):
    manifest = json.loads((HERE / "reviewed-build-manifest.json").read_text())
    require(manifest["schemaVersion"] == 1, "manifest schema must be 1")
    require(manifest["runtimeCommit"] == RUNTIME, "reviewed runtime identity mismatch")
    require(manifest["closureCommit"] == CLOSURE, "reviewed closure identity mismatch")
    archive = HERE / "reviewed-build.tar.gz"
    require(archive.stat().st_size == manifest["archive"]["bytes"], "archive byte count mismatch")
    require(archive.stat().st_size < 25_000_000, "archive exceeds 25 MB bound")
    require(sha256(archive.read_bytes()) == manifest["archive"]["sha256"], "archive SHA-256 mismatch")
    rows = manifest["assets"]
    require(len(rows) == manifest["assetCount"] == 30, "expected exactly 30 reviewed assets")
    expected = {}
    for row in rows:
        name = row["path"]
        require(safe_name(name), f"unsafe manifest asset path: {name!r}")
        require(name not in expected, f"duplicate manifest asset: {name}")
        require(re.fullmatch(r"[0-9a-f]{64}", row["sha256"]) is not None, f"bad SHA-256: {name}")
        require(type(row["bytes"]) is int and 0 <= row["bytes"] < 25_000_000, f"bad size: {name}")
        expected[name] = row
    require(sum(row["bytes"] for row in rows) < 50_000_000, "expanded build exceeds 50 MB bound")
    require("index.html" in expected and "asset-manifest.json" in expected, "missing build entrypoints")
    fixture = manifest["teacherFixture"]
    require(fixture["path"] == "fixtures/teacher/pattern-and-ending.musicxml", "fixture path mismatch")
    fixture_bytes = (checkout / fixture["path"]).read_bytes()
    require(len(fixture_bytes) == fixture["bytes"], "teacher fixture byte count mismatch")
    require(sha256(fixture_bytes) == fixture["sha256"], "teacher fixture SHA-256 mismatch")
    require(manifest["checkoutGitObjects"] == SOURCE_OBJECTS, "reviewed source-object manifest mismatch")
    for name, expected_object in SOURCE_OBJECTS.items():
        actual_object = subprocess.check_output(
            ["git", "-C", str(checkout), "rev-parse", f"HEAD:{name}"], text=True).strip()
        require(actual_object == expected_object,
                f"checkout source identity mismatch for {name}: expected {expected_object}, got {actual_object}")
    status = subprocess.check_output(
        ["git", "-C", str(checkout), "status", "--porcelain=v1", "--untracked-files=all", "--", *SOURCE_OBJECTS], text=True)
    require(not status, f"reviewed source paths have changed working files: {status.strip()}")
    require(not destination.exists(), "extraction destination must not already exist")
    contents = {}
    with tarfile.open(archive, "r:gz") as package:
        for member in package:
            require(member.isfile(), f"only regular asset files are allowed: {member.name}")
            require(safe_name(member.name), f"unsafe archive path: {member.name!r}")
            require(member.name not in contents, f"duplicate archive path: {member.name}")
            require(member.name in expected, f"unreviewed archive member: {member.name}")
            row = expected[member.name]
            require(member.size == row["bytes"], f"asset byte count mismatch: {member.name}")
            data = package.extractfile(member).read()
            require(sha256(data) == row["sha256"], f"asset SHA-256 mismatch: {member.name}")
            contents[member.name] = data
    require(set(contents) == set(expected), f"missing archive assets: {sorted(set(expected) - set(contents))}")
    # Materialize only validated bytes; tar extraction never writes paths or links.
    destination.mkdir(parents=True)
    for name, data in contents.items():
        output = destination.joinpath(*PurePosixPath(name).parts)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
    actual = sorted(path.relative_to(destination).as_posix() for path in destination.rglob("*") if path.is_file())
    require(actual == sorted(expected), "extracted asset inventory mismatch")
    receipt = {"status": "passed", "runtimeCommit": RUNTIME, "closureCommit": CLOSURE,
               "archiveSha256": manifest["archive"]["sha256"], "assetCount": len(actual),
               "expandedBytes": sum(row["bytes"] for row in rows),
               "checkoutGitObjects": SOURCE_OBJECTS,
               "teacherFixtureSha256": fixture["sha256"]}
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    try:
        require(len(sys.argv) == 3, "usage: verify-reviewed-build.py EMPTY_DESTINATION CHECKOUT")
        verify(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve())
    except Exception as error:
        print(f"Reviewed-build preflight failed: {error}", file=sys.stderr)
        sys.exit(1)
