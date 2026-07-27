from pathlib import Path
import json
import textwrap


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    assert count == 1, (label, count)
    return text.replace(old, new, 1)


path = "package.json"
package = json.loads(read(path))
package["scripts"]["generate:guitar-pro-multi-track-proof"] = (
    "node scripts/generate-guitar-pro-multi-track-proof.mjs"
)
write(path, json.dumps(package, indent=2) + "\n")

path = "src/guitarProBinaryProof.test.js"
text = read(path)
text = replace_once(
    text,
    'import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";\n',
    'import { inspectGuitarProArchiveVersion } from "./guitarProArchiveVersion";\nimport { buildGuitarProArchiveProofReaderDocuments } from "./guitarProReaderDocuments";\n',
    "binary reader coordinator import",
)
new_test = textwrap.dedent(
    '''\

      test("drives inventory and explicit bass selection from project-authored multi-track bytes", async () => {
        const bytes = fixture("guitar-pro-multi-track-proof.gp");
        const versionEvidence = await inspectGuitarProArchiveVersion(
          new Uint8Array(bytes),
          { inflateRaw }
        );
        const settings = new alphaTab.Settings();
        const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
          new Uint8Array(bytes),
          settings
        );
        const intermediate = alphaTabScoreToGuitarProIntermediate(score, {
          versionEvidence,
        });
        const file = {
          name: "guitar-pro-multi-track-proof.gp",
          size: bytes.byteLength,
        };
        const decode = jest.fn();

        const selectionRequest = await buildGuitarProArchiveProofReaderDocuments(file, {
          intermediate,
          decode,
        });

        expect(decode).not.toHaveBeenCalled();
        expect(score.tracks.map((track) => track.name)).toEqual([
          "Proof Guitar",
          "Proof Bass",
        ]);
        expect(selectionRequest).toMatchObject({
          requiresTrackSelection: true,
          supportOutcome: "track-selection-required",
          guitarProIntermediate: intermediate,
        });
        expect(
          selectionRequest.trackInventory.supportedItems.map((item) => ({
            name: item.trackName,
            strings: item.stringCount,
            measures: item.measureCount,
          }))
        ).toEqual([
          { name: "Proof Guitar", strings: 6, measures: 2 },
          { name: "Proof Bass", strings: 4, measures: 2 },
        ]);

        const selected = await buildGuitarProArchiveProofReaderDocuments(file, {
          intermediate,
          selection: { trackIndex: 1, staffIndex: 0 },
          decode,
        });

        expect(decode).not.toHaveBeenCalled();
        expect(selected.requiresTrackSelection).toBe(false);
        expect(selected.semanticDocument).toMatchObject({
          sourceTrackIndex: 1,
          sourceStaffIndex: 0,
          sourceTrackName: "Proof Bass",
          instrument: "bass",
          stringCount: 4,
        });
        expect(selected.semanticDocument.positions).toHaveLength(6);
        expect(describePlayablePosition(selected.semanticDocument, 0)).toContain(
          "E string, fret 3."
        );
      });
    '''
)
closing = "  });\n});\n"
assert text.endswith(closing)
text = text[: -len(closing)] + "  });" + new_test + "\n});\n"
write(path, text)

path = "fixtures/real-world/corpus-manifest.json"
manifest = json.loads(read(path))
manifest["updated"] = "2026-07-27"
entry = {
    "path": "guitar-pro-multi-track-proof.gp",
    "family": "guitar-pro-shared-archive",
    "provenance": "Project-authored two-track alphaTex exported by pinned alphaTab 1.8.4",
    "license": "CC0-1.0",
    "features": [
        "GP8 semantic evidence in shared 7.0 archive family",
        "six-string guitar track",
        "four-string bass track",
        "two measures per track",
        "selection required",
        "decoded intermediate reused after selection",
    ],
    "currentExpectation": "Direct binary decoding returns two supported inventory items; no track is silently selected; explicit bass coordinates normalize without a second decode",
}
manifest["fixtures"] = [
    item for item in manifest["fixtures"] if item.get("path") != entry["path"]
] + [entry]
write(path, json.dumps(manifest, indent=2) + "\n")

for path in ["src/App.js", "public/index.html", "src/App.test.js", "src/buildIdentity.test.js"]:
    text = read(path).replace(
        "Guitar Pro track selection proof 3C",
        "Guitar Pro multi-track binary proof 3D",
    )
    write(path, text)

path = "docs/implementation-status.md"
text = read(path)
start = text.index("## Current bounded checkpoint:")
end = text.index("## Testing responsibility", start)
section = textwrap.dedent(
    '''\
    ## Current bounded checkpoint: Guitar Pro multi-track binary proof 3D

    Verify the accepted track-inventory and selector contract against one project-authored `.gp` archive containing both a six-string guitar track and a four-string bass track.

    Checkpoint 3D must:

    1. export the original two-track alphaTex deterministically through pinned alphaTab 1.8.4;
    2. reload exactly two named tracks with one staff and two measures each;
    3. inspect GP8 semantic evidence from the generated archive bytes;
    4. extract the real alphaTab score into the serializable Guitar Eyes intermediate;
    5. return two supported inventory items and require selection;
    6. reuse that intermediate for explicit bass selection without another decoder call;
    7. normalize the bass track into the shared desktop and iPhone semantic document;
    8. preserve all 29 suites and 173 tests from checkpoint 3C and add direct binary coverage;
    9. preserve the lazy decoder and no-audio/no-renderer asset boundary;
    10. stop before publication and real-iPhone testing.

    The branch remains an unhosted proof. Playback, teacher mode, looping, bookmarks, pattern analysis, AI work, commercial scraping, a pull request, merge, upstream change, and production publication remain outside this checkpoint.

    '''
)
text = text[:start] + section + text[end:]
write(path, text)

print("Guitar Pro multi-track binary checkpoint source prepared")
