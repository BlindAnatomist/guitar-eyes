# Jason Playground Preflight

Date: August 21, 2026

Repository: `BlindAnatomist/guitar-eyes`

Starting authority: final documentation-closure head `e1eacbb877c584c34fcacee905ac38c65311ae29` on `work/accepted-bass-convergence`.

Work branch: `work/jason-playground`.

## Purpose

Create a genuine one-link Guitar Eyes playground that lets Jason Washburn encounter one original musical passage without downloading, unpacking, locating, or uploading a fixture.

The playground is an invitation surface, not a new tablature format, reader, semantic model, playback feature, teaching feature, or compatibility claim.

The bundled fixture is 363 bytes with SHA-256 `6f8be865a3401e175fe6ec602665ff82f823488114453adcddce8738345cfd90`.

## Success contract

1. `?demo` and `?demo=jason` expose one clear `Start the Guitar Eyes demo` action.
2. The action loads a bundled, project-authored, CC0 chord passage through the accepted ASCII importer and shared semantic document.
3. No file picker, download, ZIP, setup, or repository navigation is required.
4. After activation, focus moves to the active iPhone or desktop reader heading.
5. The same parsed document survives switching between the iPhone sequential reader and Jason's desktop spatial reader.
6. Existing upload, importer, focus, speech, control-order, and format-only contracts remain unchanged.
7. The production playground exposes no playback or audition controls.

## Rejection and stop conditions

Stop before publication if the playground creates a second parser or musical model, weakens accepted reader behavior, exposes experimental sound, changes the ordinary upload route, requires an external fixture, fails focused or inherited tests, fails the production build, or cannot be given a unique hosted identity.

One failed hosted run triggers full diagnosis outside Actions. At most one corrective run is permitted. A second hosted defect opens the circuit.

## Intended source boundary

Expected product and evidence changes are limited to:

- `src/App.js` and its directly matching application-shell assertion;
- a bounded `JasonPlayground` invitation component;
- one bundled playground source module;
- focused playground tests;
- one original CC0 fixture plus provenance;
- checkpoint build identity in `public/index.html` and its existing identity tests;
- this preflight and later exact result records;
- a temporary publication workflow only after all local gates pass.

No importer, semantic-document, position-description, iPhone-reader, desktop-reader, playback, dependency, `main`, or upstream source change is intended.

## Tool and authority boundary

Local Node, npm, Git, source editing, tests, and production build are available. The connected GitHub account reports administrative and push authority for the fork. Local Git push and GitHub CLI authentication are unavailable, so branch publication must use connected GitHub repository writes. The one intentional hosted checkpoint will use only a standard zero-dollar Linux runner with a bounded timeout after complete local preparation.

John is required only for the final bounded real-iPhone Safari and VoiceOver acceptance. Jason is not required for implementation or acceptance.
