# TuxGuitar `.tg` Provenance Reconciliation

Date: 2026-08-11

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tuxguitar-tg-intake-investigation`

Recovered starting head for this reconciliation: `399a14110f993e4f8505058009a3554d34549d79`.

Status: provenance reconciliation only. This record does not claim accepted `.tg` support and does not replace the required focused, inherited-suite, build, hosted, or real-iPhone gates.

## Why this reconciliation exists

The interrupted `.tg` implementation sequence preserved six lawful project-authored source-derived fixtures and a bounded decoder, but two different upstream roles were described with one generic `upstreamRelease` concept:

1. TuxGuitar `2.0.1` at commit `533efa74e6a56bdae28bb776358305607c79cbff` was the exact source state used to derive the fixture serialization contracts and the decoder's version evidence.
2. TuxGuitar `2.1.0` at commit `2c46e2a1cccdfdfa6e6f2692f241bd60bf418129` is the current producer release used to re-check the same native-format family after recovery.

Those are compatible facts, not competing authorities. The first is serialization provenance. The second is current-producer compatibility and safety cross-check evidence.

## Upstream comparison result

The modern native 2.x writer `common/TuxGuitar-lib/src/main/java/app/tuxguitar/io/tg/TGSongWriterImpl.java` has the same Git blob SHA in TuxGuitar 2.0.1 and 2.1.0:

`4caca728a6e8136691574f5e832da553f2e578fc`

Therefore the modern writer is byte-for-byte unchanged across those two releases.

The legacy compatibility writers for 1.0, 1.1, 1.2, 1.3, and 1.5 do have different source blobs between the release lines. The inspected upstream change is compiler cleanup that removes redundant Java casts from iteration and model access. It does not change the serialized field order, version signatures, flag layout, primitive widths, strings, note/beat structure, or other byte-writing operations used by the Guitar Eyes six-position proof profile.

Accordingly, no accepted or preserved fixture evidence is regenerated merely to change the current producer release number.

## Fixture evidence classification

The six fixtures under `fixtures/tuxguitar-tg/` remain classified as:

`TUXGUITAR_TG_SOURCE_DERIVED`

They are derived from the existing Guitar Eyes CC0 six-position musical source and the TuxGuitar 2.0.1 serialization source. They are not TuxGuitar application exports and must never be described as producer-exported files.

TuxGuitar 2.1.0 is recorded as a compatibility cross-check, not as retroactive fixture provenance.

## Fail-forward consequence

The existing fixture bytes, base64 transport twins, byte counts, SHA-256 hashes, preserved modern XML, and deterministic generator remain lasting evidence. They must not be regenerated merely because current-release metadata was clarified after the interruption.

A clean checkout must materialize the binary `.tg` files from the deterministic generator before running the focused compatibility test. Package scripts should expose both operations explicitly.

## Remaining gates

Before `.tg` support can be claimed:

1. deterministic generation must reproduce every manifest byte count and SHA-256 hash;
2. the focused `.tg` decoder/normalizer/reader-document test must pass for 1.0, 1.1, 1.2, 1.3, 1.5, and modern 2.0;
3. deferred 0.7-0.9 signatures must continue to fail explicitly rather than be guessed;
4. the complete inherited regression suite must pass;
5. the optimized production build and asset boundary must pass;
6. one intentional hosted proof may occur only after the source gates pass;
7. real-iPhone Safari/VoiceOver acceptance remains mandatory before support is accepted.

No GitHub Actions exploration, deployment, merge, pull request, `main` modification, playback work, or teacher-mode work is authorized by this record.
