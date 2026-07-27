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
      Guitar Eyes currently imports supported .txt and .tab ASCII tablature and
      uncompressed .musicxml or .xml guitar tablature containing explicit string and fret
      data. Compressed MusicXML, Guitar Pro, PowerTab, TuxGuitar, and TablEdit files are
      recognized but are not yet imported.
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
      positions. ASCII files retain their original spatial rows. MusicXML files provide a
      normalized MusicXML spatial layout derived from the structured string, fret,
      measure, chord, rest, and duration data.
    </p>

    <h3>Compatibility and unsupported formats</h3>
    <p>
      When an ASCII text file cannot yet be interpreted safely by the shared semantic
      model, the original Guitar Eyes grid remains available as a compatibility fallback
      rather than inventing musical meaning. Recognized unsupported formats and
      unsupported string counts produce an explicit message instead of a misleading
      reader result.
    </p>
  </>
);

export default InfoSection;
