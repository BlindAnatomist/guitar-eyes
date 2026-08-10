# Bounded iPhone Proof Automated Results

Generated from audit-branch commit: `730c81e48dc19eb88fde76c8681366bf10325cde`

Node version: `v20.20.2`

npm version: `10.8.2`

## Result summary

- npm ci exit code: `0`
- automated test exit code: `1`
- production build exit code: `0`

Exit code 0 means success. Exit code 125 means the command was skipped because installation failed.

## npm ci log

    npm warn deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
    npm warn deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
    npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
    npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
    npm warn deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
    npm warn deprecated workbox-google-analytics@6.6.0: It is not compatible with newer versions of GA starting with v4, as long as you are using GAv3 it should be ok, but the package is not longer being maintained
    npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
    npm warn deprecated
    npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
    npm warn deprecated workbox-cacheable-response@6.6.0: workbox-background-sync@6.6.0
    npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
    npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
    npm warn deprecated domexception@2.0.1: Use your platform's native DOMException instead
    npm warn deprecated svgo@1.3.2: This SVGO version is no longer supported. Upgrade to v2.x.x.
    npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
    npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
    npm warn deprecated @humanwhocodes/config-array@0.11.14: Use @eslint/config-array instead
    npm warn deprecated @babel/plugin-proposal-private-methods@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-private-methods instead.
    npm warn deprecated @babel/plugin-proposal-numeric-separator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-numeric-separator instead.
    npm warn deprecated @babel/plugin-proposal-optional-chaining@7.21.0: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-optional-chaining instead.
    npm warn deprecated @babel/plugin-proposal-class-properties@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-class-properties instead.
    npm warn deprecated @babel/plugin-proposal-nullish-coalescing-operator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-nullish-coalescing-operator instead.
    
    added 1679 packages in 16s

## Automated test log

          at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
          at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
          at warnIfUpdatesNotWrappedWithActDEV (node_modules/react-dom/cjs/react-dom.development.js:27628:9)
          at scheduleUpdateOnFiber (node_modules/react-dom/cjs/react-dom.development.js:25547:5)
          at setAuditionStatus (node_modules/react-dom/cjs/react-dom.development.js:16708:7)
          at auditionCurrentPosition (src/IPhoneTabReader.js:160:7)
    
        console.error
          Warning: An update to ForwardRef(IPhoneTabReader) inside a test was not wrapped in act(...).
          
          When testing, code that causes React state updates should be wrapped into act(...):
          
          act(() => {
            /* fire events that update state */
          });
          /* assert on the output */
          
          This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act
              at IPhoneTabReader (/home/runner/work/guitar-eyes/guitar-eyes/src/IPhoneTabReader.js:25:63)
    
        [0m [90m 158 |[39m         parts[33m.[39mpush([32m`${muted} muted ${muted === 1 ? "string" : "strings"}`[39m)[33m;[39m
         [90m 159 |[39m       }
        [31m[1m>[22m[39m[90m 160 |[39m       setAuditionStatus(
         [90m     |[39m       [31m[1m^[22m[39m
         [90m 161 |[39m         [32m`Auditioned current position with ${parts.join(" and ")}.`[39m
         [90m 162 |[39m       )[33m;[39m
         [90m 163 |[39m     } [36mcatch[39m (error) {[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom.development.js:86:30)
          at error (node_modules/react-dom/cjs/react-dom.development.js:60:7)
          at warnIfUpdatesNotWrappedWithActDEV (node_modules/react-dom/cjs/react-dom.development.js:27628:9)
          at scheduleUpdateOnFiber (node_modules/react-dom/cjs/react-dom.development.js:25547:5)
          at setAuditionStatus (node_modules/react-dom/cjs/react-dom.development.js:16708:7)
          at auditionCurrentPosition (src/IPhoneTabReader.js:160:7)
    
    PASS src/asciiRhythm.test.js
    PASS src/positionDescription.test.js
    PASS src/proceduralPluckedStringDelay.test.js
    PASS src/App.sharedCore.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 45 |[39m describe([32m"shared semantic core in the iPhone workflow"[39m[33m,[39m () [33m=>[39m {
         [90m 46 |[39m   test([32m"auto-detects and loads four-string bass into the semantic iPhone reader"[39m[33m,[39m [36masync[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 47 |[39m     render([33m<[39m[33mApp[39m [33m/[39m[33m>[39m)[33m;[39m
         [90m    |[39m           [31m[1m^[22m[39m
         [90m 48 |[39m
         [90m 49 |[39m     expect(screen[33m.[39mgetByLabelText([32m"Choose Instrument:"[39m))[33m.[39mtoHaveValue([32m"guitar"[39m)[33m;[39m
         [90m 50 |[39m[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/App.sharedCore.test.js:47:11)
    
    PASS src/measureModel.test.js
    PASS src/powerTabTrackInventory.test.js
    PASS src/powerTabLegacySourceNormalizer.test.js
    PASS src/guitarProVersionNeutralIntermediate.test.js
    PASS src/semanticDocument.test.js
    PASS src/powerTabLegacyHistoricalSourceNormalizer.test.js
    PASS src/App.convergence.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 20 |[39m describe([32m"desktop and iPhone convergence from the accepted semantic core"[39m[33m,[39m () [33m=>[39m {
         [90m 21 |[39m   test([32m"loads the accepted rhythm and measure document into the desktop semantic reader"[39m[33m,[39m [36masync[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 22 |[39m     render([33m<[39m[33mApp[39m [33m/[39m[33m>[39m)[33m;[39m
         [90m    |[39m           [31m[1m^[22m[39m
         [90m 23 |[39m
         [90m 24 |[39m     fireEvent[33m.[39mchange(screen[33m.[39mgetByLabelText([32m"Upload tablature file:"[39m)[33m,[39m {
         [90m 25 |[39m       target[33m:[39m { files[33m:[39m [makeRhythmMeasureFile()] }[33m,[39m[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/App.convergence.test.js:22:11)
    
    PASS src/guitarProDecodeIntegrity.test.js
    PASS src/powerTabLegacyDecoder.test.js
    PASS src/desktopSemanticAdapter.test.js
    PASS src/powerTabReaderDocuments.test.js
    PASS src/formatOnlyReaderSurface.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 27 |[39m   test([32m"keeps semantic navigation while omitting every playback control and label"[39m[33m,[39m () [33m=>[39m {
         [90m 28 |[39m     window[33m.[39m[33mGUITAR_EYES_FORMAT_ONLY[39m [33m=[39m [36mtrue[39m[33m;[39m
        [31m[1m>[22m[39m[90m 29 |[39m     render([33m<[39m[33mIPhoneTabReader[39m document[33m=[39m{document} [33m/[39m[33m>[39m)[33m;[39m
         [90m    |[39m           [31m[1m^[22m[39m
         [90m 30 |[39m
         [90m 31 |[39m     expect(screen[33m.[39mgetByRole([32m"group"[39m[33m,[39m { name[33m:[39m [32m"Position navigation"[39m }))[33m.[39mtoBeInTheDocument()[33m;[39m
         [90m 32 |[39m     expect(screen[33m.[39mgetByRole([32m"button"[39m[33m,[39m { name[33m:[39m [32m"Previous position"[39m }))[33m.[39mtoBeDisabled()[33m;[39m[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/formatOnlyReaderSurface.test.js:29:11)
    
    PASS src/powerTabLegacyHistoricalReaderDocuments.test.js
    PASS src/audiblePlaybackCorpus.test.js
    PASS src/Upload.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 4 |[39m describe([32m"Upload"[39m[33m,[39m () [33m=>[39m {
         [90m 5 |[39m   test([32m"keeps the picker unrestricted and its adjacent help out of the control name"[39m[33m,[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 6 |[39m     render([33m<[39m[33mUpload[39m onFileUpload[33m=[39m{jest[33m.[39mfn()} [33m/[39m[33m>[39m)[33m;[39m
         [90m   |[39m           [31m[1m^[22m[39m
         [90m 7 |[39m
         [90m 8 |[39m     [36mconst[39m input [33m=[39m screen[33m.[39mgetByLabelText([32m"Upload tablature file:"[39m)[33m;[39m
         [90m 9 |[39m     [36mconst[39m help [33m=[39m screen[33m.[39mgetByText([35m/checks the selected file after selection/i[39m)[33m;[39m[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/Upload.test.js:6:11)
    
    PASS src/powerTabLegacyReaderDocuments.test.js
    PASS src/buildIdentity.test.js
    PASS src/checkpointBuildIdentity.test.js
    PASS src/DataGrid.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 13 |[39m describe([32m"DataGrid compatibility fallback"[39m[33m,[39m () [33m=>[39m {
         [90m 14 |[39m   test([32m"keeps raw cells out of the ordinary Tab sequence"[39m[33m,[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 15 |[39m     render(
         [90m    |[39m           [31m[1m^[22m[39m
         [90m 16 |[39m       [33m<[39m[33mDataGrid[39m
         [90m 17 |[39m         data[33m=[39m{data}
         [90m 18 |[39m         numColumns[33m=[39m{[35m1[39m}[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/DataGrid.test.js:15:11)
    
    PASS src/parseFile.test.js
    
    Summary of all failing tests
    FAIL src/structuredTabReaderDocuments.test.js
      ● buildStructuredTabReaderDocuments › loads legacy PowerTab v1.7 through its separate lazy reader
    
        expect(received).toMatchObject(expected)
    
        - Expected  - 1
        + Received  + 1
    
        @@ -9,7 +9,7 @@
                  "staves": Array [],
                },
              ],
            },
            "sourceFormat": "powertab-legacy",
        -   "sourceFormatLabel": "PowerTab 1.7 tablature",
        +   "sourceFormatLabel": "PowerTab legacy tablature",
          }
    
        [0m [90m 72 |[39m     })[33m;[39m
         [90m 73 |[39m
        [31m[1m>[22m[39m[90m 74 |[39m     expect(result)[33m.[39mtoMatchObject({
         [90m    |[39m                    [31m[1m^[22m[39m
         [90m 75 |[39m       requiresTrackSelection[33m:[39m [36mtrue[39m[33m,[39m
         [90m 76 |[39m       sourceFormat[33m:[39m [32m"powertab-legacy"[39m[33m,[39m
         [90m 77 |[39m       sourceFormatLabel[33m:[39m [32m"PowerTab 1.7 tablature"[39m[33m,[39m[0m
    
          at Object.<anonymous> (src/structuredTabReaderDocuments.test.js:74:20)
    
    
    Test Suites: 1 failed, 60 passed, 61 total
    Tests:       1 failed, 364 passed, 365 total
    Snapshots:   0 total
    Time:        10.07 s
    Ran all test suites.

## Production build log

    
    > guitar-eyes@0.1.0 build
    > react-scripts build
    
    Creating an optimized production build...
    Browserslist: caniuse-lite is outdated. Please run:
      npx update-browserslist-db@latest
      Why you should do it regularly: https://github.com/browserslist/update-db#readme
    [0;33mOne of your dependencies, babel-preset-react-app, is importing the
    "@babel/plugin-proposal-private-property-in-object" package without
    declaring it in its dependencies. This is currently working because
    "@babel/plugin-proposal-private-property-in-object" is already in your
    node_modules folder for unrelated reasons, but it [1mmay break at any time[0;33m.
    
    babel-preset-react-app is part of the create-react-app project, [1mwhich
    is not maintianed anymore[0;33m. It is thus unlikely that this bug will
    ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
    your devDependencies to work around this error. This will make this message
    go away.[0m
      
    Browserslist: caniuse-lite is outdated. Please run:
      npx update-browserslist-db@latest
      Why you should do it regularly: https://github.com/browserslist/update-db#readme
    Compiled successfully.
    
    File sizes after gzip:
    
      290.32 kB  build/static/js/600.ad1fcd35.chunk.js
      107.37 kB  build/static/js/main.fa3ab5dd.js
      9.72 kB    build/static/js/982.2f45a094.chunk.js
      8.33 kB    build/static/js/502.11df3731.chunk.js
      5.86 kB    build/static/js/guitar-eyes-guitar-pro-import.36039740.chunk.js
      1.77 kB    build/static/js/453.eaf0ef0f.chunk.js
      1.19 kB    build/static/css/main.43c0fc34.css
      256 B      build/static/js/257.ae3770e0.chunk.js
    
    The project was built assuming it is hosted at /.
    You can control this with the homepage field in your package.json.
    
    The build folder is ready to be deployed.
    You may serve it with a static server:
    
      npm install -g serve
      serve -s build
    
    Find out more about deployment here:
    
      https://cra.link/deployment
    
