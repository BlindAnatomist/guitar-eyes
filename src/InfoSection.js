import React from "react";

const InfoSection = () => (
  <>
    <p>
      Welcome to Guitar Eyes for Mac. Supported guitar and bass text files are parsed
      once into the same synchronized musical document used by the iPhone reader. The
      desktop view preserves strings as rows and musical positions as columns while
      retaining rhythm, measures, open strings, frets, and supported notation.
    </p>

    <h3>Position navigation</h3>
    <p>
      Tab to the Position keyboard navigator. With that control focused, use Left and
      Right Arrow to move one synchronized position, Home and End to jump to the first or
      last position, and Enter to read the current position. These plain-key commands are
      handled only inside the navigator. Guitar Eyes does not intercept VoiceOver
      Control+Option commands.
    </p>

    <h3>Reading controls</h3>
    <p>
      Previous position and Next position move quietly. Read current position is the only
      control that announces the complete playing instruction. When a file contains more
      than one tablature block, Previous tablature block and Next tablature block jump
      quietly between blocks.
    </p>

    <h3>Spatial overview</h3>
    <p>
      The Semantic tablature overview is a standard table. Use ordinary VoiceOver table
      navigation to move vertically among strings and horizontally among synchronized
      positions. The original source rows remain available in a collapsed Original
      spatial source layout disclosure for comparison without forcing every dash into the
      ordinary navigation path.
    </p>

    <h3>Compatibility fallback</h3>
    <p>
      When a text file cannot yet be interpreted safely by the shared semantic model, the
      original Guitar Eyes grid remains available as a compatibility fallback rather than
      inventing musical meaning.
    </p>
  </>
);

export default InfoSection;
