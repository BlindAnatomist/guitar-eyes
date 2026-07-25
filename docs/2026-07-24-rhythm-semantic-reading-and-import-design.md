# Guitar Eyes rhythm, semantic reading, and import design

Date: July 24, 2026
Status: Planning record only. No implementation is authorized by this document.
Branch: `work/iphone-voiceover-tablature-audit`

## Purpose

This note preserves the substantive design ideas developed during an accidental Work-mode brainstorming thread so that the project can resume without reconstructing the discussion.

The central principle is source fidelity:

> Guitar Eyes should preserve and expose every rhythmic, structural, and technical cue that the source actually contains, while clearly distinguishing known information from missing or uncertain information.

The application must not reduce tablature to string-and-fret positions when the source contains more musical structure.

## Existing project constraints

- The iPhone experience is the primary accessibility target.
- Real iPhone Safari and VoiceOver acceptance remains required.
- Jason's desktop-oriented mode must be preserved rather than replaced.
- `main` remains a clean upstream-tracking branch.
- Work remains confined to `work/iphone-voiceover-tablature-audit` unless a later task explicitly changes that rule.
- This note does not authorize a pull request, upstream change, deployment change, or implementation expansion.

## Semantic musical-event model

Each playable event should be capable of retaining the following information when the source provides it:

- measure number;
- beat location or subdivision;
- duration or rhythmic value;
- event type: single note, chord, rest, or other grouped event;
- string and fret assignments;
- note names or pitches when available;
- techniques such as slides, bends, hammer-ons, pull-offs, vibrato, palm muting, harmonics, ties, or sustained notes;
- tempo;
- time signature;
- measure boundaries;
- source confidence or completeness;
- the original source text or notation needed for later verification.

The semantic model should retain structure once and allow multiple interfaces to interpret it. Reader, teaching, and playback behavior should not require separate incompatible representations of the same tablature.

## Reader modes

### 1. Concise reader mode

The ordinary iPhone reader should announce only what the player needs at that moment. It should remain direct and navigable rather than becoming a wall of notation.

Examples of useful information include:

- what to play now;
- whether notes are played together;
- the current measure or beat when orientation requires it;
- a brief duration cue when the rhythm is explicit;
- a technique instruction when it changes execution.

The existing simplified interaction remains the baseline: Back, Next, and Repeat instruction, with focus returning to the current instruction after navigation.

### 2. Teaching mode

Teaching mode may explain information that concise reader mode suppresses, including:

- what a rhythmic value means;
- where the event falls within the measure;
- how long to hold it;
- how a rest or tie functions;
- how the written technique changes the physical action;
- how the current event relates to the surrounding phrase.

Teaching mode should explain the music, not merely read more words from the screen.

### 3. Playback or timing mode

Playback behavior may use:

- tempo;
- time signature;
- measure and beat positions;
- duration values;
- rests;
- ties and sustained events;
- synchronized event boundaries.

Playback must derive timing from explicit or reliably parsed information. It must not silently invent rhythm where the source provides none.

## Source-quality levels

Imported tablature should be classified by the musical information it actually contains.

### Level A: Full rhythmic tablature

The source contains explicit durations or rhythmic stems, measure structure, and enough timing information to reconstruct the passage with meaningful accuracy.

The application should preserve and expose those durations rather than flattening the source into positions.

### Level B: Measured tablature with incomplete rhythm

The source contains bar lines or measure groupings, and possibly time signatures or tempo, but does not provide reliable duration for every event.

The application may orient the player by measure and event sequence, but must identify rhythm as incomplete rather than implying exact timing.

### Level C: Position-only tablature

The source primarily contains string and fret positions with little or no dependable rhythmic information.

The application should still make the fingering sequence accessible, but must not claim to know exact beats or durations.

These levels are not judgments of whether a source is useful. They are declarations of what the source can support without fabrication.

## Import preservation rules

An importer should retain all useful notation and metadata it encounters, including:

- rhythmic guide lines;
- duration legends;
- bar lines and repeat marks;
- measure numbers;
- time signatures;
- tempo markings;
- rests;
- ties and sustain marks;
- chord groupings;
- technique symbols;
- textual performance instructions.

Parsing should be additive, not destructive. The original source should remain available for verification even after a semantic representation has been created.

When the importer cannot determine rhythm reliably, it should preserve the ambiguity and classify the source accordingly. Missing information must remain missing rather than being converted into false precision.

## Candidate import paths

The architecture should be extensible enough to support:

1. pasted tablature text;
2. uploaded plain-text tablature;
3. common structured tablature file formats;
4. permitted source-specific import adapters where access and licensing allow them.

Each import path should produce the same general semantic event model while retaining source-specific evidence and limitations.

## Design consequences

- String-and-fret positions remain essential, but they are only one layer of the musical event.
- Measure and beat information should be available without forcing it into every spoken instruction.
- Concise reading and detailed teaching are different presentations of the same underlying event data.
- Playback quality depends on source quality and must communicate those limits honestly.
- Importers should never discard information simply because the first iPhone interface does not yet use it.
- Future source adapters should not require redesigning the reader's core data model.

## Open questions for the next session

1. What is the minimum event schema required for the next bounded implementation step?
2. Which rhythmic cues should concise reader mode announce automatically, and which should be available on demand?
3. How should VoiceOver phrase beat locations and durations without making each instruction cumbersome?
4. How should the interface identify Level A, Level B, and Level C sources to the user?
5. Which existing source format should become the first structured-import proof?
6. Should original notation be exposed through a separate source-inspection view, or only retained internally at first?
7. How should confidence and ambiguity be represented without burdening ordinary navigation?

## Restart point

Resume by defining the smallest semantic event schema that can preserve measure, beat, duration, grouped notes, rests, and techniques without changing the already verified iPhone navigation flow.

Do not begin by redesigning the reader. Begin by determining what information the reader must be capable of retaining.