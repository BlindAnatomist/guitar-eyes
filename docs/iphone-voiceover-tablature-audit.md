# iPhone Safari and VoiceOver Tablature Audit

Status: Source audit recorded; build and real-device runtime gates remain open.

Audit branch: `work/iphone-voiceover-tablature-audit`

Authoritative upstream: `Phlypper/guitar-eyes`

Fork: `BlindAnatomist/guitar-eyes`

Upstream and fork baseline commit: `60c2e5de0887b1bcdd426d932632946edd07d3c3`

## Purpose and collaboration boundary

Guitar Eyes is Jason Washburn's project for making spatial guitar and bass tablature intelligible to blind musicians. This extension must preserve Jason's authorship, repository history, desktop-oriented interaction, and project purpose.

The work is bounded to an additional iPhone Safari and VoiceOver mode. It must not remove or silently redesign the existing Mac keyboard mode. No upstream pull request will be opened unless the audit, proof, automated verification, hosted preview, and real-iPhone acceptance are complete and John explicitly authorizes presenting the work to Jason.

## Authoritative repository state

1. The upstream repository is public and uses `main` as its default branch.
2. The fork was created through GitHub's fork operation and its `main` history matches upstream through the baseline commit.
3. The fork's `main` branch is reserved as a clean upstream-tracking branch.
4. The audit branch begins at the exact upstream baseline commit.
5. No open upstream issues or pull requests were found at audit start.
6. The latest upstream commit deleted the prior GitHub Pages workflow. No current deployment configuration or confirmed hosted preview exists.
7. The project is a Create React App application using React 18, `react-scripts` 5, Chakra UI, and npm lockfile version 3.
8. The only committed test is the original Create React App test looking for a "Learn React" link. It does not test the current Guitar Eyes interface.
9. No license file was found. This audit makes no assumption about permissions beyond the existing public fork and the requested collaboration boundary.

## 1. Verified current behavior from source

### Upload and instrument selection

1. The interface accepts a `.txt` file through a labeled native file input.
2. The user can select guitar with six strings or bass with four strings.
3. The selected instrument determines only how many nonempty lines are grouped together. It does not validate string names, tuning, or tablature structure.
4. File reading uses the browser `FileReader` API and occurs locally in the browser. No account, database, server upload, or public file storage is present.

### Current parser

1. The file is split at newline characters.
2. Every line is trimmed before processing, removing leading and trailing whitespace.
3. Empty lines are ignored rather than treated as block boundaries.
4. Every group of six nonempty lines for guitar, or four for bass, is accepted as a tablature block.
5. A final incomplete group is also accepted when the end of the file is reached.
6. String labels and tuning are retained only as ordinary characters in each line.
7. Adjacent digits are scanned as one number only when the resulting value is from 10 through 22. The line is then rejoined as plain text rather than converted into synchronized musical positions.
8. All other notation is retained as ordinary text characters at this stage.

### Grid and keyboard interaction

1. Each parsed block is displayed as a separate grid.
2. Grid content is produced one row at a time from the raw string text.
3. Nearly every resulting character is rendered inside its own focusable `gridcell` with `tabIndex="0"`.
4. The desktop mode implements Mac-oriented VoiceOver modifier commands for vertical and horizontal navigation.
5. The application intercepts Tab and Shift-Tab to move among tablature wrappers.
6. Multi-column mode groups a selectable number of raw character columns.
7. Pressing Enter in multi-column mode invokes browser speech synthesis to read raw column contents.
8. Escape is intended to stop browser speech.

### Focus, status, and controls

1. After parsed tablature state changes, focus is moved to the first tablature wrapper.
2. The upload input, instrument selector, column selector, and information toggle have visible labels or explicit accessible names.
3. Parsing errors are written to the developer console.
4. No user-facing error region, upload status, parse summary, or restrained live announcement is present.
5. The multi-column checkbox has a visible label whose `htmlFor` value does not match any input `id`.

## 2. Likely defects supported by source evidence

These are source-supported findings. Items requiring Safari or VoiceOver confirmation remain in the runtime section.

### Spatial parsing and alignment

1. Trimming every line can destroy meaningful leading or trailing spacing.
2. Ignoring blank lines allows lines from separate visual blocks to be combined into one six-line or four-line group.
3. Grouping arbitrary nonempty lines can treat titles, chord names, lyrics, or instructions as strings.
4. Accepting incomplete final groups can create malformed blocks without warning.
5. Values above fret 22 are corrupted. For example, the current algorithm turns `23` into `2` and `100` into `1` because it advances across the complete digit sequence and then retains only its first digit.
6. Two-digit frets are collapsed independently within each string row. Because the application has no shared token-width or synchronized-position model, subsequent material on one string can shift against the other strings.
7. The first string's raw character length controls column options and multi-column boundaries. Longer lines can be truncated in multi-column mode, while shorter lines can produce blank or undefined cells.
8. Navigation calculations assume a rectangular grid even though rows can contain unequal numbers of rendered cells.
9. String labels and tunings are not separated from musical content. Alternate tuning cannot be described semantically.

### Technique notation

1. Hammer-ons, pull-offs, slides, bends, vibrato, muting, rests, and sustained-note notation are not interpreted.
2. Guitar Eyes generally retains these symbols as raw characters, but their relationship to neighboring frets is not modeled.
3. The companion Clean My Tab workflow can remove technique letters and symbols adjacent to fret numbers. It is therefore context for possible future integration, not a safe parser dependency for the first proof.
4. Unsupported or ambiguous notation is neither preserved in a structured model nor reported to the user as unsupported.

### Accessibility and interaction

1. A six-string block can create approximately one focusable gridcell per source character on every string, in addition to grid and wrapper stops. A block with 80 characters per string can therefore approach 480 focusable character cells before container stops.
2. Dashes, vertical bars, string-label characters, and technique symbols are exposed as focusable cells rather than summarized musical positions.
3. The checkbox label association is invalid because the checkbox has no matching `id`.
4. The outer tablature wrapper intercepts every Tab event that bubbles from the grid and cycles focus among tablature wrappers. This can create a desktop keyboard trap or at minimum override expected browser navigation.
5. Browser speech reads raw characters and column numbers rather than named strings, frets, open strings, silence, continuation, or unsupported notation.
6. Browser speech is not cancelled before new reading begins.
7. A new document-level Escape listener is added each time reading starts and is never removed.
8. The speech stop mechanism depends on a physical Escape key and has no equivalent labeled touch control.
9. Errors are invisible to ordinary users because they are sent only to the console.
10. Focus moves to a generic wrapper after upload rather than a semantic result heading, summary, or first mobile reading control.
11. The document title consists only of guitar and eyes emoji, and the metadata still describes a generic Create React App site.
12. Chakra UI components are used without a `ChakraProvider`. Compilation may still succeed, but component styling and runtime assumptions require build and browser verification.
13. The committed test suite does not exercise the current application and is expected to fail because the tested "Learn React" link no longer exists.

## 3. Behavior requiring runtime testing

### Automated runtime gate

1. Whether `npm ci` succeeds from the committed lockfile under a current supported Node version.
2. Whether the untouched application produces a production build.
3. The exact failure or success state of the stale automated test.
4. Whether dependency, peer-dependency, lint, or build warnings reveal additional constraints.

A branch-only GitHub Actions workflow was added solely to run separate baseline build and test jobs. GitHub has not executed it yet, consistent with Actions being disabled by default on a newly created fork. No application code was changed by that workflow commit.

### Real-iPhone Safari and VoiceOver gate

1. Exact VoiceOver swipe-stop count for a representative clean six-string block.
2. Whether each dash, separator, and character is individually encountered by VoiceOver.
3. Whether upload focus lands predictably and whether the focused wrapper gives useful context.
4. Whether Safari exposes the Chakra table as a coherent grid or as a confusing sequence of cells.
5. Whether browser speech synthesis talks over, interrupts, or otherwise conflicts with VoiceOver.
6. Whether file selection and instrument selection are understandable on an iPhone.
7. Whether multi-column mode and its checkbox are announced accurately.
8. Whether malformed files fail silently from the user's perspective.
9. Whether layout, zoom, or horizontal overflow causes additional mobile interaction problems.

No real-iPhone result has been recorded yet.

## 4. Proposed improvements

These proposals preserve the existing desktop mode and add a separate semantic path.

1. Introduce a minimal tablature document model with document, block, string, synchronized position, fret, open string, silence or continuation, technique notation, and unsupported or ambiguous notation.
2. Preserve original source text alongside parsed tokens so unsupported material is never silently discarded.
3. Parse one bounded clean six-string block first, with explicit validation and understandable errors.
4. Detect string labels and preserve tuning rather than treating labels as ordinary musical columns.
5. Tokenize multi-digit frets without collapsing spatial width independently on each string.
6. Construct synchronized positions across all six strings before rendering either interface.
7. Leave the current desktop grid available as Jason's desktop mode.
8. Add a clearly separated iPhone reading mode with:
   - Previous position
   - Next position
   - Read current position
9. Expose one semantic current-position description rather than hundreds of raw character cells.
10. Distinguish fretted notes, open strings, silent strings, continuation, technique notation, and unsupported notation.
11. Use restrained status messaging and deliberate focus placement after upload and control activation.
12. Provide visible and programmatic errors rather than console-only failures.
13. Repair control associations without changing Jason's desktop commands.
14. Add deterministic parser tests, semantic-description tests, and focused interface tests.
15. Deploy only to a new isolated nonproduction preview controlled by BlindAnatomist.

## Initial proof boundary

The first implementation proof will support one clean plain-text six-string tablature block. It will not add accounts, databases, AI services, paid services, public file storage, or unrelated features. Unsupported notation will be preserved or reported rather than guessed away.

## Audit completion gates

The audit is not final until:

1. baseline installation, test, and build results are captured;
2. a safe hosted baseline or proof preview exists;
3. required real-iPhone Safari and VoiceOver behavior is tested;
4. results are recorded in this repository;
5. the verified findings, likely defects, runtime findings, and proposed proof scope are reconciled into a final audit checkpoint.
