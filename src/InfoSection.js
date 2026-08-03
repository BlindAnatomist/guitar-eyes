import React from "react";

const InfoSection = () => (
  <>
    <p>
      Welcome to Guitar Eyes for Mac. Supported ASCII, MusicXML, compressed MusicXML,
      and bounded Guitar Pro guitar and bass files are imported into the same synchronized
      musical document used by the iPhone reader. The desktop view preserves strings as
      rows and musical positions as columns while retaining rhythm, measures, rests,
      open strings, frets, chords, and supported notation.
    </p>

    <h3>Supported file intake</h3>
    <p>
      Accepted ASCII support includes standard six-string guitar and four-string bass,
      plus exact standard seven-string and eight-string guitar and five-string and
      six-string bass when every string label includes the expected octave. Uncompressed
      .musicxml or .xml and compressed .mxl support remain bounded to six-string guitar
      tablature containing explicit string and fret data. The current Guitar Pro
      foundation accepts internally verified GP3, GP4, GP5, GP6 GPX, and supported GP7 or
      GP8 .gp files when alphaTab preserves a four-string bass or six-string guitar staff,
      exact string and fret identity, measures, and supported duration. This is bounded
      cross-format intake, not a claim that every feature in every Guitar Pro file is
      supported.
    </p>

    <h3>Guitar Pro track selection</h3>
    <p>
      A Guitar Pro file with one supported tablature staff loads that staff directly. A
      file with more than one supported guitar or bass staff presents an explicit track
      selector. Guitar Eyes does not silently choose a track. Percussion, unsupported
      string counts, conflicting voices, missing coordinates, unsafe timing, and malformed
      internal version evidence are rejected rather than guessed.
    </p>

    <h3>Instrument family selector</h3>
    <p>
      Guitar and Bass are family preferences rather than fixed string counts. Guitar Eyes
      uses complete string structure and safe tuning evidence to detect a supported family
      and updates the selector when the uploaded tablature proves the other family. The
      family selector does not filter tracks inside a structured Guitar Pro file.
    </p>

    <h3>Extended-string boundary</h3>
    <p>
      Extended-string ASCII is accepted only for the exact octave-qualified profiles
      recorded by the project. Eight-string guitar uses E4, B3, G3, D3, A2, E2, B1, F
      sharp 1 from highest to lowest. Six-string bass uses C3, G2, D2, A1, E1, B0 from
      highest to lowest. Missing octaves and alternate profiles are rejected rather than
      guessed.
    </p>

    <h3>Position navigation</h3>
    <p>
      Tab to the Position keyboard navigator. With that control focused, use Left and
      Right Arrow to move one synchronized position and Home and End to jump to the first
      or last position. These plain-key commands are handled only inside the navigator.
      Guitar Eyes does not intercept VoiceOver Control+Option commands.
    </p>

    <h3>Reading controls</h3>
    <p>
      Previous position and Next position move quietly. Read current position is the only
      action that announces the complete playing instruction. When a file contains more
      than one tablature block, Previous tablature block and Next tablature block jump
      quietly between blocks. The accepted format-only surface contains no audition,
      sound-delay, or position-audio controls.
    </p>

    <h3>Spatial overview</h3>
    <p>
      The Semantic tablature overview is a standard table. Use ordinary VoiceOver table
      navigation to move vertically among strings and horizontally among synchronized
      positions. ASCII files retain their original spatial rows. Structured imports
      provide an honestly labeled normalized spatial layout derived from their source
      tuning, measures, strings, frets, chords, rests, and durations.
    </p>

    <h3>Compatibility and unsupported formats</h3>
    <p>
      When an ASCII text file cannot yet be interpreted safely by the shared semantic
      model, the original Guitar Eyes grid remains available as a compatibility fallback
      rather than inventing musical meaning. Extended-string ASCII without the exact
      bounded octave evidence, Guitar Pro 2 .gtp, unsupported Guitar Pro structures,
      PowerTab, TuxGuitar, and TablEdit produce explicit messages instead of misleading
      reader results.
    </p>
  </>
);

export default InfoSection;
