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

## GE-PT2-002 — A graphical producer can block canonical evidence even when the format is understood

State: `active`

### Symptom

The pinned Power Tab Editor release can open files from positional command-line arguments, but it exposes no noninteractive save, conversion, or export option. The available environment may also lack Windows, macOS, Wine, Snap, Flatpak, Qt, or another route for running the exact graphical application.

### Risk

Pressure to continue can encourage one of three invalid substitutions:

1. relabeling a source-derived container as an editor export;
2. treating an official fixture from an older internal version as proof of the current version;
3. widening support before the producer path has been exercised.

### Failed-do-not-repeat approaches

1. Do not infer save behavior from the ability to open a file from the command line.
2. Do not treat producer-maintained version-2 or version-4 fixtures as version-11 evidence.
3. Do not reconstruct an editor export from serializer source and then cite the reconstruction as producer output.
4. Do not dispatch paid or unauthorized automation merely to bypass a missing runtime.
5. Do not ask an iPhone-only tester to operate an unavailable desktop application.

### Proven containment

1. Audit the exact release assets and execution environment.
2. Audit the exact command-line parser for a real export route.
3. Search the pinned producer repository for committed fixtures.
4. Record each fixture's Git blob, byte count, hash, decompressed hash, and internal version.
5. Use older official fixtures only as format-family and version-gating evidence.
6. Stop the acceptance gate if no exact editor-produced current-version fixture can be obtained.
7. Preserve the provisional implementation without publishing or widening it.
8. Record the exact unblock procedure for a suitable Windows, macOS, Snap, or Flatpak environment.

### Derived standard

A missing producer runtime is an evidence blocker, not permission to redefine what counts as producer evidence. Honest stoppage preserves more progress than a counterfeit completion.
