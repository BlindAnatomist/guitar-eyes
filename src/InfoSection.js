import React from "react";

const InfoSection = () => (
  <>
    <p>
      Guitar Eyes now parses each uploaded text file once into synchronized musical
      positions. The desktop and iPhone readers use that same document, including the
      same blocks, string identities, frets, open strings, technique notation, measure
      boundaries, warnings, and unsupported symbols.
    </p>
    <h3>Desktop navigation</h3>
    <p>
      Tab to the Position keyboard navigator. With that control focused, use Left and
      Right Arrow to move one synchronized position, Home and End to jump to the first
      or last position, and Enter to read the current position. These plain-key commands
      are handled only inside the navigator. Guitar Eyes no longer intercepts
      Control+Option commands that VoiceOver uses for its own navigation.
    </p>
    <p>
      The Semantic tablature overview is a standard table. Use ordinary VoiceOver table
      navigation to move vertically among strings and horizontally among synchronized
      musical positions. Each table cell names the string and its musical state rather
      than exposing dashes and separators as separate focus stops.
    </p>
    <h3>Reading controls</h3>
    <p>
      Previous position, Read current position, and Next position are available in both
      reading modes. When a file contains more than one complete tablature block,
      Previous tablature block and Next tablature block jump directly to the first
      position of the neighboring block. The current description identifies the block
      and the position within its measure when that context is present.
    </p>
  </>
);

export default InfoSection;
