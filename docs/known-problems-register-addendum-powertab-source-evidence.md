# Known-Problems Addendum: PowerTab Source Evidence

Date: August 5, 2026

Repository: `BlindAnatomist/guitar-eyes`

Status: active addendum for the `.pt2` version-11 line

## GE-PT2-001 — A serializer-shaped `.pt2` can create false compatibility confidence

State: `candidate`

### Symptom

A project can construct JSON matching the documented Power Tab Editor serializer, gzip it, and successfully pass its own decoder. That proves the decoder and fixture agree with one another. It does not prove that the pinned Power Tab Editor application exports the same structure in practice.

### Risk

Treating source-derived evidence as an editor-exported fixture can turn an internally consistent test loop into an unsupported product claim.

### Failed-do-not-repeat approaches

1. Do not call a source-derived gzip file an editor export.
2. Do not infer general `.pt2` compatibility from extension recognition.
3. Do not claim support because focused parser tests pass.
4. Do not copy an upstream fixture without a file-level provenance and redistribution decision.
5. Do not widen internal-version support beyond the exact version carried by verified evidence.

### Candidate solution

1. Mark the source-derived fixture explicitly with `editorExported: false`.
2. Preserve the source JSON, deterministic generator, hashes, and original musical-content license.
3. Use it only for source-checkpoint decoder, rejection, inventory, and normalization work.
4. Require a second canonical fixture produced by the pinned Power Tab Editor application.
5. Record the editor release, commit, operating environment, binary hash, decompressed audit, and semantic expectation.
6. Compare the editor-produced structure with the source-derived fixture.
7. Run the complete inherited suite and production build.
8. Require hosted real-iPhone Safari and VoiceOver acceptance before support is claimed.

### Derived standard

A fixture can prove parser consistency without proving producer compatibility. The provenance of the producing application is part of the format contract, not an administrative footnote.
