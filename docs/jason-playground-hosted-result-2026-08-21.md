# Jason playground hosted result — 2026-08-21

## Result

The one-link Jason playground is deployed at:

`https://blindanatomist.github.io/guitar-eyes/?demo=jason`

The deployed source candidate is commit
`d7cb96a2a66c14949701cde4eea67cfc58cb44fb`, tree
`1660be8cc42e09d54713c5b8fca0b8b1316fde27`.

The bundled original ASCII passage is 363 bytes with SHA-256
`6f8be865a3401e175fe6ec602665ff82f823488114453adcddce8738345cfd90`.
It contains seven positions across two measures with the progression C, G,
A minor, F, C, G, C and durations Q, Q, Q, Q, Q, Q, H.

## Hosted verification

Corrective workflow run:

- Run: `32511667205`
- Build job: `96863960536`
- Deploy/readback job: `96864322066`
- Launcher commit: `68e273ef869ff9ff68ad307d815194641c6a737f`

The clean Ubuntu 24.04 build job completed successfully:

- Exact candidate checkout confirmed.
- Locked dependency installation completed.
- Playground-focused tests: 5 suites and 17 tests passed.
- Complete inherited suite: 72 suites and 430 tests passed; 1 suite and 4
  tests were intentionally skipped.
- Production build compiled successfully.
- All 8 production JavaScript assets passed marker inspection.
- The GitHub Pages artifact uploaded successfully.

The deployment step completed successfully. The workflow's final readback
step failed before making a request because its generated Node script contained
a literal `\n` token between two statements. No third hosted checkpoint was
launched.

An independent cache-busted readback was then run directly against the deployed
site. It confirmed:

- The expected title occurs exactly once.
- The expected checkpoint heading occurs exactly once and precedes the React
  root.
- The minified format-only assignment is active.
- The asset manifest exposes 8 JavaScript assets.
- Every deployed JavaScript asset was fetched successfully.
- The deployed assets contain the expected start action and playground identity
  markers.

The earlier hosted run `32510942128` also passed the exact checkout, dependency
installation, focused tests, complete suite, and production build. It stopped
before deployment because its artifact inspector required source whitespace that
the HTML minifier legitimately removed.

## Repository safety

- Fork `main` is restored to
  `60c2e5de0887b1bcdd426d932632946edd07d3c3`.
- The accepted base remains
  `e1eacbb877c584c34fcacee905ac38c65311ae29`.
- The deployed application source is isolated on `work/jason-playground`.
- No message or invitation was sent to Jason.

## Remaining acceptance

The owner must perform the final real-iPhone Safari and VoiceOver acceptance:

1. Open the one-link playground URL.
2. Activate **Start the Guitar Eyes demo**.
3. Confirm focus lands on **iPhone tablature reader**.
4. Try **Read current** and **Next** and listen for coherent movement through
   the bundled passage.
5. Switch to **Desktop grid reader** and confirm focus moves to that reader.
6. Report any unexpected speech, silence, duplicated announcement, or focus
   location before the link is shared with Jason.
