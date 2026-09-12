# Semantic reliability checkpoint 1: bounded contract

Starting authority: work/accepted-bass-convergence at e1eacbb877c584c34fcacee905ac38c65311ae29. Assessment: audit/astra-system-assessment-2026-09 at a8ec2ab1e0481b0a22aad1247b6dc5ee2d0c860c. Work branch: work/semantic-reliability-checkpoint-1. This is an unaccepted implementation checkpoint, not operational convergence.

## Evidence and rejection

A pitched playable note requires a present integer string coordinate in its explicit tuning and a present nonnegative safe-integer fret. Zero is a value, never a replacement for null, undefined, empty text or malformed lexical input. An explicit muted note requires its string and mute evidence, not a guessed fret. Normalized `open` is itself the canonical zero state; its constructor must have validated source zero. A validator cannot recover evidence already destroyed by coercion.

Structured tuning and timing required by an importer remain mandatory. Missing names, titles, optional technique parameters, ASCII octaves and ASCII rhythm may remain unknown; they must not become pitch or time facts. Existing source-defined defaults for optional flags remain governed by the inherited adapters. No universal missing-data default is introduced.

## Duration

Retain `quarterNoteUnits` for elapsed musical time and current speech fields for compatibility. MusicXML additionally records source notated type/dots (or null) and elapsed divisions/divisions-per-quarter, with an explicit relationship. Supported here: ordinary type with zero, one or two dots matching elapsed time; elapsed-only input without type/dots, labelled in quarter-note units rather than inventing a notated type. Contradictory ordinary evidence rejects.

MusicXML time-modification/tuplet notation is explicitly unsupported in this checkpoint, even if musically valid. Reject it as an unsupported relationship, not as malformed music. This avoids claiming new MusicXML tuplet compatibility. Existing Guitar Pro-derived supported tuplet ratios remain intact; shared validation computes their dotted/ratio relationship rather than requiring notated and elapsed values to be equal. Do not infer actual seconds, tempo, expressive timing or repeat expansion.

MusicXML chord members must have the same supported duration evidence because the current shared event has one duration. Otherwise reject instead of assigning one member's duration to the whole chord. Explicit repeat/ending structures remain source-order only, with structured loss evidence and the existing warning channel. Other captured unsupported technical elements retain localized losses. This checkpoint is not a comprehensive audit of every discarded source field.

## Instrument

For Guitar Pro, the admitted evidence is the exact previously proved high-to-low MIDI profile: guitar [64,59,55,50,45,40], bass [43,38,33,28]. The inventory and normalizer share the same predicate. Count, filename and track name alone are insufficient. Other tunings remain generic fretted staves in inventory and cannot load as guitar/bass. No generic reader mode or instrument-program heuristic is added. This restricts unproven inputs; it does not broaden compatibility.

ASCII retains its expressly accepted structural/profile detection, including exact extended tunings. MusicXML, PowerTab and TuxGuitar retain their inherited source-specific admission checks. Their profile decisions are staged adapter authority, not new universal instrument inference. Their broader identity/capability generalization remains debt.

## Common trusted-reader boundary

Before a successful reader-document result is returned, validate the existing tablature-document type marker; recognized family and family/count consistency; nonempty blocks/positions; string identities and explicit tuning labels; present valid octave/MIDI values when supplied; ordered position-to-block string references; canonical open/fret state values; positive finite duration values when present; and touched notated/elapsed relationships. A missing optional schemaVersion is allowed because the accepted semantic document uses `type`; an explicitly incompatible schemaVersion is not.

Validate structured loss records when present. Warnings and losses are evidence, not a declaration of complete understanding. Absence of duration remains valid for untimed ASCII. This staged validator does not rewrite importers, canonicalize every nested navigation copy, certify third-party-decoder completeness, validate every technique parameter, or authorize playback.

## Execution and acceptance

Focused source probes precede repair; complete inherited tests and optimized build follow focused proof. Preserve fixtures, dependencies, workflows, public identity and excluded surfaces. No producer regeneration, hosted run, PR, merge or deployment. Local locked dependencies from the unchanged assessment checkout are reusable. Report local runtime and intentional skips explicitly. Changed rejection/disclosure outcomes require later bounded real-iPhone acceptance; DOM tests do not provide it. Investigate the mode-switch concern with deferred promises and preserve observed outcomes without a speculative runtime repair.
