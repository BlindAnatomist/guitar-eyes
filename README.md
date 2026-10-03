# Guitar Eyes

Guitar Eyes is a format-only semantic tablature reader with desktop and iPhone presentations of the same musical document. Support is bounded by verified file versions, instrument profiles, and notation evidence, rather than by filename alone.

Read [AGENTS.md](AGENTS.md), [BRANCH_AUTHORITY.md](BRANCH_AUTHORITY.md), and the [continuation record](docs/continuation-state-2026-10-02.md) before changing the project. The reader-reliability branch contains later candidate work; it does not replace the accepted operational baseline. Fork `main` remains the clean upstream-tracking branch. Do not open a pull request or merge without the owner's explicit authorization.

## Installation

Node.js and npm are required. The project declares its dependencies in `package.json` and locks their versions in `package-lock.json`; it does not currently pin a Node.js version.

Clone the technical reader-reliability candidate branch:

```bash
git clone --branch work/reader-reliability-checkpoints-2026-10-02 --single-branch https://github.com/BlindAnatomist/guitar-eyes.git
cd guitar-eyes
npm ci
```

For an existing checkout, verify its branch and source against the repository authority before running or editing it.

## Running locally

```bash
npm start
```

The development server normally opens at `http://localhost:3000/`. The shipped entry point defaults to the format-only reader.

## Verification

Run the complete inherited suite without watch mode:

```bash
CI=true npm test -- --watchAll=false --runInBand
```

The producer-dependent legacy-bass suite retains its intentional skips unless its external producer prerequisites are available. Preserve accepted fixtures instead of regenerating them to repair an unrelated test or build failure. See the current checkpoint records for exact test counts and verification limits.

## Production build

```bash
npm run build
```

The production files are written to `build/`. Building does not publish or deploy them. Publication, repository saves, and real-device acceptance each have separate requirements in the governing records.

This app was created with the help of multiple AI GPTs.
