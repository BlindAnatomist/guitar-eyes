# Guitar Eyes browser repair verification

Target: `BlindAnatomist/guitar-eyes`, review branch `review/fret-integrity-2026-10-10`.
Original application repair baseline: `543f3beecde5be80fccf4457d36ebbf58a9ed30e`.

This isolated test harness builds the locked application and runs one headless Chromium session against a loopback-only static server. Application dependencies stay unchanged. The separately approved focus repair changes only DataGrid and its React regressions; workflow guards verify their exact reviewed Git blobs and all other baseline files. Playwright 1.63.0 is installed in the runner's temporary directory from npm; its official Chromium is installed separately. Network requests from the test page are limited to that loopback server. Test uploads contain synthetic tablature only.

Coverage includes all fret values 0–99, source-text and colspan preservation, actual six-string table geometry around fret 12, all target widths and cascading cross-string boundaries, keyboard navigation and source-column anchors, native Tab/Shift+Tab, short final groups, focus restoration, real Shift-minus (`_`) key events and width clamps, invalid-file rejection/recovery, bass switching, and mocked speech sequencing and cancellation including stale callbacks.

Speech mocks do not test audible output, VoiceOver, macOS shortcut interception, or compatibility with assistive technology. Those require acceptance on the intended device/browser.

The workflow has an exact review-branch push filter and a unique commit-message gate. It only runs on attempt 1, uses one standard Ubuntu runner with a 12-minute job limit and read-only contents permission, disables persisted checkout credentials, and has no deployment or hosting steps. Each intentional run requires approval; reruns are never automatic. Small synthetic diagnostics expire after one day. The expected parent, exact reviewed focus-fix blobs, and all other unchanged application baseline content are checked before dependency installation.

For an explicitly authorized local test on a browser-capable machine, install Playwright 1.63.0 into an isolated prefix, install Chromium with its CLI, build the app, then run:

    PLAYWRIGHT_PREFIX=/path/to/isolated/prefix node tests/browser/fret-integrity.mjs build /path/to/results

Syntax/fixture validation without launching a browser:

    node --check tests/browser/fret-integrity.mjs
    node tests/browser/fret-integrity.mjs --check-fixtures
