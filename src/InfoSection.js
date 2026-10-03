import React from "react";

const InfoSection = () => (
  <>
    <p>
      Welcome to Guitar Eyes for Mac. Supported ASCII, MusicXML, compressed MusicXML,
      Guitar Pro, PowerTab, and TuxGuitar profiles are imported into the same synchronized
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
      tablature containing explicit string and fret data.
    </p>
    <p>
      Guitar Pro support is bounded to the verified GP3, GP4, GP5, GP6 GPX, and GP7
      shared .gp corpus and profiles. Shared .gp archives require internal version
      evidence and a supported four-string bass or six-string guitar track with exact
      string, fret, measure, and supported duration data. The existing GP8-style project
      proofs do not establish general GP8 compatibility.
    </p>

    <h3>PowerTab profiles</h3>
    <p>
      PowerTab .pt2 supports internal versions 1 through 11 within the accepted
      six-string guitar profiles. Exact standard four-string bass in high-to-low tuning
      G2, D2, A1, E1 is supported only for internal version 11. Internal versions 1
      through 10 do not support bass.
    </p>
    <p>
      Legacy PowerTab .ptb supports file version 1 (PowerTab 1.0), file version 2
      (PowerTab 1.0.2), file version 3 (PowerTab 1.5), and file version 4 (PowerTab 1.7).
      Each has bounded six-string guitar and exact standard four-string bass profiles.
      The bass tuning must be G2, D2, A1, E1 from highest to lowest.
    </p>

    <h3>TuxGuitar profiles</h3>
    <p>
      TuxGuitar .tg supports native generations 1.0, 1.1, 1.2, 1.3, and 1.5 plus
      modern native file format 2.0.0 within bounded six-string guitar and exact standard
      four-string bass profiles. The bass tuning must be G2, D2, A1, E1 from highest to
      lowest. The modern file format was validated against TuxGuitar 2.1.0 producer
      evidence; the application version and native file-format version are distinct.
      Native 0.7, 0.8, and 0.9 remain unsupported, and no native 1.4 route is inferred.
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
      bounded octave evidence, Guitar Pro 2 .gtp, TablEdit .tef, and unsupported
      structures within Guitar Pro, PowerTab, or TuxGuitar produce explicit messages
      instead of misleading reader results. Recognition by filename does not establish
      reading support. PowerTab and TuxGuitar support is limited to the version-specific
      profiles above; arbitrary files, alternate or extended bass tunings, and other
      unproved structures are not supported.
    </p>
  </>
);

export default InfoSection;
