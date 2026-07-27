from pathlib import Path
import json
import subprocess
import textwrap


def move(old: str, new: str) -> None:
    old_path = Path(old)
    new_path = Path(new)
    assert old_path.exists(), f"missing rename source: {old}"
    assert not new_path.exists(), f"rename destination already exists: {new}"
    subprocess.run(["git", "mv", old, new], check=True)


def read(path: str | Path) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str | Path, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    assert count == 1, (label, count)
    return text.replace(old, new, 1)


def insert_after_once(text: str, anchor: str, insertion: str, label: str) -> str:
    count = text.count(anchor)
    assert count == 1, (label, count)
    return text.replace(anchor, anchor + insertion, 1)


move(
    "scripts/generate-guitar-pro-7-proof.mjs",
    "scripts/generate-guitar-pro-shared-archive-proof.mjs",
)
move(
    "fixtures/real-world/guitar-pro-7-proof.atex",
    "fixtures/real-world/guitar-pro-shared-archive-proof.atex",
)
move(
    "fixtures/real-world/guitar-pro-7-proof.gp",
    "fixtures/real-world/guitar-pro-shared-archive-proof.gp",
)
move(
    "fixtures/real-world/guitar-pro-7-proof.gp.sha256",
    "fixtures/real-world/guitar-pro-shared-archive-proof.gp.sha256",
)

current_files: list[Path] = []
for root_name in ["src", "public", "scripts", "fixtures"]:
    root = Path(root_name)
    if not root.exists():
        continue
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() not in {
            ".gp",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
        }:
            current_files.append(path)
current_files.append(Path("package.json"))

replacements = [
    ("decodeGuitarPro7ProofFile", "decodeGuitarProArchiveProofFile"),
    (
        "buildGuitarPro7ProofReaderDocuments",
        "buildGuitarProArchiveProofReaderDocuments",
    ),
    ("guitar-eyes-gp7-import", "guitar-eyes-guitar-pro-import"),
    ("guitar-pro-7-proof", "guitar-pro-shared-archive-proof"),
    ("generate:gp7-proof", "generate:guitar-pro-archive-proof"),
    (
        "generate-guitar-pro-7-proof.mjs",
        "generate-guitar-pro-shared-archive-proof.mjs",
    ),
    ("Guitar Pro 7 proof 3A", "Guitar Pro shared-archive proof 3B"),
    ("Guitar Pro 7 tablature", "Guitar Pro archive tablature"),
    ("Guitar Pro 7 dependency", "Guitar Pro shared-archive dependency"),
    ('"guitar-pro-7"', '"guitar-pro-archive"'),
    ("CORRUPT_GP7_ARCHIVE", "CORRUPT_GUITAR_PRO_ARCHIVE"),
    ("The GP7 archive is corrupt.", "The Guitar Pro archive is corrupt."),
    ("Corrupt GP7 archive", "Corrupt Guitar Pro archive"),
    ("GP7 proof decoder", "Guitar Pro archive proof decoder"),
    ("GP7_PLUS_ZIP", "GUITAR_PRO_SHARED_ZIP"),
    ("Guitar Eyes GP7 Proof", "Guitar Eyes Shared Archive Proof"),
    ("Original GP7 proof", "Original shared archive proof"),
    (
        "project-authored Guitar Pro 7 binary proof",
        "project-authored Guitar Pro shared-archive binary proof",
    ),
    ("generated GP7 fixture", "generated shared-archive fixture"),
    ("GP7 fixture", "shared-archive fixture"),
    ("GP7 track", "GP8-semantic shared-archive track"),
    ("alphaTab GP7 export", "alphaTab shared-archive export"),
    ("generated GP7 proof", "generated shared-archive proof"),
    ("GP7 proof", "shared-archive proof"),
]

for path in current_files:
    if not path.exists():
        continue
    original = read(path)
    changed = original
    for old, new in replacements:
        changed = changed.replace(old, new)
    if changed != original:
        write(path, changed)


gp8_evidence = textwrap.dedent(
    '''\
    const GP8_VERSION_EVIDENCE = Object.freeze({
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      rootVersion: "7.0",
      gpVersion: "8.1.3",
      encodingDescription: "GP8",
      sourceVersion: "GP8",
      entryCount: 6,
    });

    '''
)
gp7_evidence = textwrap.dedent(
    '''\
    const GP7_VERSION_EVIDENCE = Object.freeze({
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      rootVersion: "7.0",
      gpVersion: "7.5.0",
      encodingDescription: "GP7",
      sourceVersion: "GP7",
      entryCount: 2,
    });

    '''
)

# Normalizer proof defaults to the actual GP8 semantic evidence. GP7 remains a
# deliberate rejection test.
path = "src/guitarProNormalizer.test.js"
text = read(path)
text = insert_after_once(
    text,
    "const STANDARD_BASS = [43, 38, 33, 28];\n\n",
    gp8_evidence + gp7_evidence,
    "normalizer evidence constants",
)
assert text.count('sourceVersion: "GP7",') == 2
text = text.replace('sourceVersion: "GP7",', 'sourceVersion: "GP8",', 2)
helper_start = text.index("function intermediate(")
helper_end = text.index("\n}\n\nfunction expectErrorCode", helper_start) + 2
helper = text[helper_start:helper_end]
helper = replace_once(
    helper,
    '    sourceVersion: "GP8",\n',
    '    sourceVersion: "GP8",\n    versionEvidence: GP8_VERSION_EVIDENCE,\n',
    "normalizer helper evidence",
)
text = text[:helper_start] + helper + text[helper_end:]
old_version_test = textwrap.dedent(
    '''\
      test("rejects untested Guitar Pro versions", () => {
        expectErrorCode(
          () => normalizeGuitarProIntermediate(intermediate([track()], { sourceVersion: "GP8" })),
          "UNTESTED_GUITAR_PRO_VERSION"
        );
      });'''
)
new_version_test = textwrap.dedent(
    '''\
      test("rejects GP7 until direct project evidence is accepted", () => {
        expectErrorCode(
          () =>
            normalizeGuitarProIntermediate(
              intermediate([track()], {
                sourceVersion: "GP7",
                versionEvidence: GP7_VERSION_EVIDENCE,
              })
            ),
          "UNTESTED_GUITAR_PRO_VERSION"
        );
      });'''
)
text = replace_once(
    text,
    old_version_test,
    new_version_test,
    "normalizer GP7 rejection test",
)
write(path, text)

# Application proof fixture.
path = "src/App.guitarPro.test.js"
text = read(path)
text = insert_after_once(
    text,
    "const originalMatchMedia = window.matchMedia;\n\n",
    gp8_evidence,
    "app evidence constant",
)
text = replace_once(
    text,
    '    sourceVersion: "GP7",\n    title: "Application GP proof",',
    '    sourceVersion: "GP8",\n    versionEvidence: GP8_VERSION_EVIDENCE,\n    title: "Application GP proof",',
    "app proof evidence",
)
write(path, text)

# Shared reader projection proof fixture.
path = "src/guitarProReaderDocuments.test.js"
text = read(path)
text = insert_after_once(
    text,
    "const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];\n\n",
    gp8_evidence,
    "reader evidence constant",
)
text = replace_once(
    text,
    '    sourceVersion: "GP7",\n    title: "Reader proof",',
    '    sourceVersion: "GP8",\n    versionEvidence: GP8_VERSION_EVIDENCE,\n    title: "Reader proof",',
    "reader proof evidence",
)
write(path, text)

# Adapter must receive and serialize byte-derived version evidence.
path = "src/guitarProAlphaTabAdapter.test.js"
text = read(path)
text = insert_after_once(
    text,
    'import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";\n\n',
    gp8_evidence,
    "adapter evidence constant",
)
text = text.replace(
    "alphaTabScoreToGuitarProIntermediate(makeScore())",
    "alphaTabScoreToGuitarProIntermediate(makeScore(), { versionEvidence: GP8_VERSION_EVIDENCE })",
)
text = text.replace(
    "alphaTabScoreToGuitarProIntermediate(makeScore(beat))",
    "alphaTabScoreToGuitarProIntermediate(makeScore(beat), { versionEvidence: GP8_VERSION_EVIDENCE })",
)
text = text.replace(
    "alphaTabScoreToGuitarProIntermediate(score)",
    "alphaTabScoreToGuitarProIntermediate(score, { versionEvidence: GP8_VERSION_EVIDENCE })",
)
text = replace_once(
    text,
    '      sourceVersion: "GP7",\n      title: "Original shared archive proof",',
    '      sourceVersion: "GP8",\n      versionEvidence: GP8_VERSION_EVIDENCE,\n      title: "Original shared archive proof",',
    "adapter expected evidence",
)
assert text.count("alphaTabScoreToGuitarProIntermediate(") == 4
assert text.count("versionEvidence: GP8_VERSION_EVIDENCE") == 5
write(path, text)

# Direct binary proof derives evidence from the generated bytes.
path = "src/guitarProBinaryProof.test.js"
text = read(path)
text = insert_after_once(
    text,
    'import { alphaTabScoreToGuitarProIntermediate } from "./guitarProAlphaTabAdapter";\n',
    'import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";\n',
    "binary inspector import",
)
text = replace_once(
    text,
    '  test("decodes and normalizes the generated shared-archive fixture through alphaTab", () => {',
    '  test("decodes and normalizes the generated GP8-semantic shared archive through alphaTab", async () => {',
    "binary async test",
)
text = replace_once(
    text,
    '    const bytes = fixture("guitar-pro-shared-archive-proof.gp");\n    const settings = new alphaTab.Settings();',
    '    const bytes = fixture("guitar-pro-shared-archive-proof.gp");\n    const versionEvidence = await inspectGuitarProArchiveVersion(new Uint8Array(bytes));\n    const settings = new alphaTab.Settings();',
    "binary evidence inspection",
)
text = replace_once(
    text,
    textwrap.dedent(
        '''\
            const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
              sourceVersion: "GP7",
            });'''
    ),
    textwrap.dedent(
        '''\
            const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
              versionEvidence,
            });'''
    ),
    "binary adapter evidence",
)
text = replace_once(
    text,
    '      sourceVersion: "GP7",',
    '      sourceVersion: "GP8",',
    "binary expected GP8",
)
write(path, text)

# Worker client must not send a caller-invented version.
path = "src/guitarProWorkerClient.test.js"
text = read(path)
text = replace_once(
    text,
    '    expect(worker.message.sourceVersion).toBe("GP7");',
    '    expect(worker.message).not.toHaveProperty("sourceVersion");',
    "worker no caller version",
)
text = replace_once(
    text,
    '    const expected = { schemaVersion: 1, sourceVersion: "GP7", tracks: [] };',
    '    const expected = { schemaVersion: 1, sourceVersion: "GP8", tracks: [] };',
    "worker expected GP8 intermediate",
)
write(path, text)

path = "src/guitarProArchiveVersion.js"
text = read(path).replace(
    "tested GP7-plus archive family",
    "shared .gp archive family",
)
write(path, text)

path = "src/tabFormatDetector.js"
text = read(path).replace(
    "general Guitar Pro 7 or 8 support has not yet been accepted",
    "general Guitar Pro shared-archive support has not yet been accepted",
)
write(path, text)

# Current status must describe the corrected evidence without rewriting the
# historical evaluation and correction records.
path = "docs/implementation-status.md"
text = read(path)
text = text.replace(
    "8. The first fixture must be generated from project-authored alphaTex and exported as an original GP7 `.gp` file.",
    "8. The first fixture is generated from project-authored alphaTex. Its root archive marker is 7.0, while its internal GPIF evidence identifies GP8 semantics; it must therefore be treated as a shared-archive GP8 specimen rather than a clean GP7 file.",
)
start = text.index("## Current bounded checkpoint:")
end = text.index("## Testing responsibility", start)
current_section = textwrap.dedent(
    '''\
    ## Current bounded checkpoint: Guitar Pro shared-archive proof 3B

    Correct the proof identity and require archive-derived version evidence before normalization.

    Checkpoint 3B must:

    1. retain exact `@coderline/alphatab` version `1.8.4` and its MPL-2.0 notice;
    2. inspect `VERSION` and `Content/score.gpif` before alphaTab normalization;
    3. identify the current project-authored fixture as GP8 semantic material inside the shared 7.0 `.gp` archive family;
    4. reject missing, malformed, duplicate, contradictory, encrypted, oversized, or unsupported version evidence;
    5. reject GP7 as untested until a genuine, clearly licensed GP7 specimen is obtained and verified;
    6. keep alphaTab lazy-loaded in a dedicated bounded worker;
    7. transfer only the Guitar Eyes-owned serializable intermediate representation;
    8. preserve the existing timing, tuning, notes, chords, rests, techniques, measures, and desktop/iPhone projections;
    9. retain the prohibition on silent track or voice selection;
    10. verify all inherited tests, archive-evidence tests, the production build, and emitted asset isolation;
    11. stop before publication and real-iPhone testing.

    The current branch contains an unhosted proof only. GP3, GP4, GP5, GP6, GP7, GP2, PowerTab, TuxGuitar, TablEdit, compressed MusicXML, playback, teacher mode, AI work, a pull request, merge, upstream change, and production publication remain outside this checkpoint.

    '''
)
text = text[:start] + current_section + text[end:]
text = text.replace(
    "John is needed only after a stable hosted GP7 candidate exists and a bounded real-iPhone Safari and VoiceOver test is necessary.",
    "John is needed only after a stable hosted shared-archive candidate exists and a bounded real-iPhone Safari and VoiceOver test is necessary.",
)
write(path, text)

# Register the project-authored archive in the corpus manifest.
manifest_path = Path("fixtures/real-world/corpus-manifest.json")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["updated"] = "2026-07-27"
fixture_entry = {
    "path": "guitar-pro-shared-archive-proof.gp",
    "family": "guitar-pro-shared-archive",
    "provenance": "Project-authored alphaTex exported by pinned alphaTab 1.8.4",
    "license": "CC0-1.0",
    "features": [
        "root VERSION marker 7.0",
        "internal GPVersion 8.1.3",
        "EncodingDescription GP8",
        "standard six-string tuning",
        "two measures",
        "chord onset",
        "timed rest",
        "six synchronized positions",
    ],
    "currentExpectation": "Archive inspection proves GP8 semantic evidence in the shared .gp family; normalization succeeds; GP7 remains unaccepted without a genuine fixture",
}
manifest["fixtures"] = [
    entry
    for entry in manifest["fixtures"]
    if entry.get("path")
    not in {"guitar-pro-7-proof.gp", fixture_entry["path"]}
] + [fixture_entry]
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

required = {
    "src/App.js": [
        "buildGuitarProArchiveProofReaderDocuments",
        "Guitar Pro shared-archive proof 3B",
    ],
    "src/guitarProWorkerClient.js": ["decodeGuitarProArchiveProofFile"],
    "src/guitarProReaderDocuments.js": [
        "buildGuitarProArchiveProofReaderDocuments",
        "Guitar Pro archive tablature",
    ],
    "src/guitarProBrowserWorkerFactory.js": ["guitar-eyes-guitar-pro-import"],
    "src/guitarProArchiveVersion.js": ["GUITAR_PRO_SHARED_ZIP"],
    "src/guitarProNormalizer.js": [
        "GUITAR_PRO_SHARED_ZIP",
        "guitar-pro-archive",
    ],
    "package.json": [
        "generate:guitar-pro-archive-proof",
        "generate-guitar-pro-shared-archive-proof.mjs",
    ],
    "public/index.html": ["Guitar Pro shared-archive proof 3B"],
}
for file, markers in required.items():
    value = read(file)
    for marker in markers:
        assert marker in value, (file, marker)

assert Path("fixtures/real-world/guitar-pro-shared-archive-proof.atex").exists()
assert Path("fixtures/real-world/guitar-pro-shared-archive-proof.gp").exists()
assert Path("fixtures/real-world/guitar-pro-shared-archive-proof.gp.sha256").exists()
print("marker-based identity correction completed")
