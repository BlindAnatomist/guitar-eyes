# iPhone MusicXML Picker Repair Publication

Date: July 26-27, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/tablature-intake-expansion`

Exact repaired source: `9f171e6c00c1a8265e66f35d55fa0c9aea7f7fc7`

Temporary main trigger: `1c564999a094f3544ef34f3f090dc77f12cdc72e`

Preview: `https://blindanatomist.github.io/guitar-eyes/`

Status: repaired publication and live bundle read-back passed; real-iPhone selection retry remains required

## Verified repair gate

Run `30230707944` passed:

1. exact repaired source checkout;
2. MusicXML implementation ancestry;
3. source-level absence of an `accept` attribute in `src/Upload.js`;
4. 20 of 20 automated suites;
5. 117 of 117 automated tests;
6. production build;
7. compiled post-selection validation description;
8. compiled absence of the former extension-list filter;
9. preserved MusicXML import and compressed-MusicXML non-support contracts;
10. current MusicXML checkpoint identity.

## Publication and hosted read-back

Run `30230820831` passed:

1. exact repaired source checkout;
2. production Pages build for `/guitar-eyes`;
3. artifact-level absence of the former extension-list filter;
4. GitHub Pages deployment;
5. live HTML read-back;
6. live primary-bundle read-back;
7. live presence of the unrestricted-picker help contract;
8. live absence of the former `.txt,.tab,.musicxml,.xml,.mxl` filter string;
9. live presence of MusicXML import, compressed-MusicXML non-support, and accepted position controls.

Commit status `guitar-eyes/picker-repair-readback` reported success.

## Main restoration

Fork `main` was restored by ref to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

Independent comparison reported:

- identical;
- zero ahead;
- zero behind;
- zero changed files.

## Remaining acceptance boundary

Automated tests and live-bundle inspection prove that Guitar Eyes no longer asks the browser to filter by extension or MIME type. They cannot operate the owner's native iPhone Files picker.

The next real-device action is therefore deliberately narrower than the previous handoff:

1. open the repaired preview;
2. activate Upload tablature file;
3. locate the same `.musicxml` file;
4. report whether the file is now selectable rather than dimmed;
5. only after selection succeeds, continue to import, focus, position, chord, and rest testing.
