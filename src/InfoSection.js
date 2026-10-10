import React from 'react';

const InfoSection = () => (
  <>
    <p>
      Welcome to Guitar Eyes for Mac! To use this app, you can upload either a .txt file with guitar tablature and it will be placed into multiple grids for each six strings of the tab or four strings, if you choose “Bass” from the instrument drop-down menu.
      Once uploaded, you have the choice of navigating the tablature either one cell at a time or you can select the 'Multi-Column Navigation' checkbox, select how many columns you wish to navigate at a time, and the app will create multi-column groups within each grid which you can have read aloud vertically.
    </p>
    <p>
      Upload plain-text tab blocks with six guitar rows or four bass rows. Rows in a block must have equal text width. Labels, bars, spaces, and notation are kept as written. Frets use one or two digits; separate distinct notes with notation such as dashes. Titles, incomplete blocks, and misaligned rows show an error. Multi-column groups can extend past the chosen width to keep every fret whole.
      <br />
      Here are the key commands for using this app:
      <br />
      <strong>NAVIGATION of the Tablature Grids:</strong>
      <br />
      Tab Key & Shift+Tab Key - Move between tablature grids and the controls; arrow commands enter and navigate a grid
      <br />
      <br />
      <strong>NON-MULTI-COLUMN NAVIGATION:</strong>
      <br />
      ctrl+option+arrowUp & ctrl+option+arrowDown - Vertical navigation of the grid rows
      <br />
      ctrl+option+arrowLeft & ctrl+option+arrowRight - Horizontal navigation of each cell on a row
      <br />
      <br />
      <strong>MULTI-COLUMN NAVIGATION:</strong>
      <br />
      ctrl+command+shift+arrowRight - Move to the next multi-column group
      <br />
      ctrl+command+shift+arrowLeft - Move to previous multi-column group
      <br />
      ctrl+command+shift+ the “=“ Key to extend the groups one column at a time
      <br />
      ctrl+command+shift+ the “-“ key to reduce the groups one column at a time
      <br />
      Press ENTER to have the group read aloud vertically
      <br />
      Press ESC to stop the reading.
    </p>
  </>
);

export default InfoSection;

