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
      Accepted support currently includes selected .txt and .tab ASCII tablature and
      uncompressed .musicxml or .xml six-string guitar tablature containing explicit
      string and fret data. This unhosted branch also contains a project-authored Guitar
      Pro 7 dependency and normalization proof. That proof is not yet general Guitar Pro
      support and must not be treated as a published feature.
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
      rather than inventing musical meaning. Compressed MusicXML, Guitar Pro versions
      outside the internal proof, PowerTab, TuxGuitar, TablEdit, and unsupported string
      counts produce explicit messages instead of misleading reader results.
    </p>
  </>
);

export default InfoSection;
