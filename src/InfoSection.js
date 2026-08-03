import React from "react";

const InfoSection = () => (
  <>
    <p>
      Welcome to Guitar Eyes for Mac. Supported ASCII guitar and bass files and
      uncompressed MusicXML guitar tablature are imported into the same synchronized
      musical document used by the iPhone reader. The desktop view preserves strings as
      rows and musical positions as columns while retaining rhythm, measures, rests,
      open strings, frets, chords, and supported notation.
    </p>

    <h3>Supported file intake</h3>
    <p>
      Accepted ASCII support includes standard six-string guitar and four-string bass,
      plus exact standard seven-string guitar and five-string bass when every string
      label includes the expected octave. Uncompressed .musicxml or .xml support remains
      bounded to six-string guitar tablature containing explicit string and fret data.
      This branch also retains the accepted bounded Guitar Pro import described by the
      repository records; it is not general Guitar Pro compatibility.
    </p>

    <h3>Instrument family selector</h3>
    <p>
      Guitar and Bass are family preferences rather than fixed string counts. Guitar Eyes
      uses complete string structure and safe tuning evidence to detect a supported family
      and updates the selector when the uploaded tablature proves the other family.
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
      quietly between blocks.
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
      bounded octave evidence, other unsupported string counts, unsupported Guitar Pro
      families, PowerTab, TuxGuitar, and TablEdit produce explicit messages instead of
      misleading reader results.
    </p>
  </>
);

export default InfoSection;