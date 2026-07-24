# Baseline Automated Audit Results

Generated from audit-branch commit: `ea86e1de18b3f4df290dcba40781d3683229043f`

Node version: `v20.20.2`

npm version: `10.8.2`

## Result summary

- npm ci exit code: `0`
- npm run build exit code: `0`
- existing test command exit code: `1`

Exit code 0 means success. Exit code 125 means the command was skipped because installation failed.

## npm ci log

    npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
    npm warn deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
    npm warn deprecated @babel/plugin-proposal-numeric-separator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-numeric-separator instead.
    npm warn deprecated @babel/plugin-proposal-nullish-coalescing-operator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-nullish-coalescing-operator instead.
    npm warn deprecated @babel/plugin-proposal-private-methods@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-private-methods instead.
    npm warn deprecated @babel/plugin-proposal-class-properties@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-class-properties instead.
    npm warn deprecated rollup-plugin-terser@7.0.2: This package has been deprecated and is no longer maintained. Please use @rollup/plugin-terser
    npm warn deprecated @humanwhocodes/config-array@0.11.14: Use @eslint/config-array instead
    npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
    npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
    npm warn deprecated @babel/plugin-proposal-optional-chaining@7.21.0: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-optional-chaining instead.
    npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
    npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
    npm warn deprecated domexception@2.0.1: Use your platform's native DOMException instead
    npm warn deprecated w3c-hr-time@1.0.2: Use your platform's native performance.now() and performance.timeOrigin.
    npm warn deprecated q@1.5.1: You or someone you depend on is using Q, the JavaScript Promise library that gave JavaScript developers strong feelings about promises. They can almost certainly migrate to the native JavaScript promise now. Thank you literally everyone for joining me in this bet against the odds. Be excellent to each other.
    npm warn deprecated
    npm warn deprecated (For a CapTP with native promises, see @endo/eventual-send and @endo/captp)
    npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
    npm warn deprecated workbox-cacheable-response@6.6.0: workbox-background-sync@6.6.0
    npm warn deprecated workbox-google-analytics@6.6.0: It is not compatible with newer versions of GA starting with v4, as long as you are using GAv3 it should be ok, but the package is not longer being maintained
    npm warn deprecated svgo@1.3.2: This SVGO version is no longer supported. Upgrade to v2.x.x.
    
    added 1678 packages, and audited 1679 packages in 11s
    
    262 packages are looking for funding
      run `npm fund` for details
    
    64 vulnerabilities (15 low, 15 moderate, 31 high, 3 critical)
    
    To address issues that do not require attention, run:
      npm audit fix
    
    To address all issues (including breaking changes), run:
      npm audit fix --force
    
    Run `npm audit` for details.

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
    
      71.15 kB  build/static/js/main.fd220db5.js
      1.77 kB   build/static/js/453.eaf0ef0f.chunk.js
      263 B     build/static/css/main.e6c13ad2.css
    
    The project was built assuming it is hosted at /.
    You can control this with the homepage field in your package.json.
    
    The build folder is ready to be deployed.
    You may serve it with a static server:
    
      npm install -g serve
      serve -s build
    
    Find out more about deployment here:
    
      https://cra.link/deployment
    

## Existing test log

      ● renders learn react link
    
        TestingLibraryElementError: Unable to find an element with the text: /learn react/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
    
        Ignored nodes: comments, script, style
        [36m<body>[39m
          [36m<div>[39m
            [36m<div>[39m
              [36m<h1>[39m
                [36m<strong>[39m
                  [0mGuitar Eyes for Mac - The Guitar Tablature reader for the Visually Impaired Guitarist[0m
                [36m</strong>[39m
              [36m</h1>[39m
              [36m<section>[39m
                [36m<button[39m
                  [33maria-label[39m=[32m"Close info section"[39m
                [36m>[39m
                  [0mClose info section[0m
                [36m</button>[39m
                [36m<p>[39m
                  [0mWelcome to Guitar Eyes for Mac! To use this app, you can upload either a .txt file with guitar tablature and it will be placed into multiple grids for each six strings of the tab or four strings, if you choose “Bass” from the instrument drop-down menu. Once uploaded, you have the choice of navigating the tablature either one cell at a time or you can select the 'Multi-Column Navigation' checkbox, select how many columns you wish to navigate at a time, and the app will create multi-column groups within each grid which you can have read aloud vertically.[0m
                [36m</p>[39m
                [36m<p>[39m
                  [0mHere are the key commands for using this app:[0m
                  [36m<br />[39m
                  [36m<strong>[39m
                    [0mNAVIGATION of the Tablature Grids:[0m
                  [36m</strong>[39m
                  [36m<br />[39m
                  [0mTab Key & Shift+Tab Key - Jump to next tablature grid and back to previous tablature grid[0m
                  [36m<br />[39m
                  [36m<br />[39m
                  [36m<strong>[39m
                    [0mNON-MULTI-COLUMN NAVIGATION:[0m
                  [36m</strong>[39m
                  [36m<br />[39m
                  [0mctrl+option+arrowUp & ctrl+option+arrowDown - Vertical navigation of the grid rows[0m
                  [36m<br />[39m
                  [0mctrl+option+arrowLeft & ctrl+option+arrowRight - Horizontal navigation of each cell on a row[0m
                  [36m<br />[39m
                  [36m<br />[39m
                  [36m<strong>[39m
                    [0mMULTI-COLUMN NAVIGATION:[0m
                  [36m</strong>[39m
                  [36m<br />[39m
                  [0mctrl+command+shift+arrowRight - Move to the next multi-column group[0m
                  [36m<br />[39m
                  [0mctrl+command+shift+arrowLeft - Move to previous multi-column group[0m
                  [36m<br />[39m
                  [0mctrl+command+shift+ the “=“ Key to extend the groups one column at a time[0m
                  [36m<br />[39m
                  [0mctrl+command+shift+ the “-“ key to reduce the groups one column at a time[0m
                  [36m<br />[39m
                  [0mPress ENTER to have the group read aloud vertically[0m
                  [36m<br />[39m
                  [0mPress ESC to stop the reading.[0m
                [36m</p>[39m
              [36m</section>[39m
              [36m<div>[39m
                [36m<label[39m
                  [33mfor[39m=[32m"file-upload"[39m
                [36m>[39m
                  [0mUpload .txt file:[0m
                [36m</label>[39m
                [0m [0m
                [36m<input[39m
                  [33maccept[39m=[32m".txt"[39m
                  [33mid[39m=[32m"file-upload"[39m
                  [33mtype[39m=[32m"file"[39m
                [36m/>[39m
              [36m</div>[39m
              [36m<div>[39m
                [36m<label[39m
                  [33mfor[39m=[32m"instrument-dropdown"[39m
                [36m>[39m
                  [0mChoose Instrument: [0m
                [36m</label>[39m
                [36m<select[39m
                  [33mid[39m=[32m"instrument-dropdown"[39m
                [36m>[39m
                  [36m<option[39m
                    [33mvalue[39m=[32m"guitar"[39m
                  [36m>[39m
                    [0mGuitar (6 strings)[0m
                  [36m</option>[39m
                  [36m<option[39m
                    [33mvalue[39m=[32m"bass"[39m
                  [36m>[39m
                    [0mBass (4 strings)[0m
                  [36m</option>[39m
                [36m</select>[39m
              [36m</div>[39m
              [36m<div>[39m
                [36m<input[39m
                  [33mtype[39m=[32m"checkbox"[39m
                [36m/>[39m
                [36m<label[39m
                  [33mfor[39m=[32m"multi-column"[39m
                [36m>[39m
                  [0mMulti-Column Navigation[0m
                [36m</label>[39m
              [36m</div>[39m
              [36m<div>[39m
                [36m<label[39m
                  [33mfor[39m=[32m"column-dropdown"[39m
                [36m>[39m
                  [0mNumber of Columns: [0m
                [36m</label>[39m
                [36m<select[39m
                  [33mid[39m=[32m"column-dropdown"[39m
                [36m>[39m
                  [36m<option[39m
                    [33mvalue[39m=[32m"1"[39m
                  [36m>[39m
                    [0m1[0m
                  [36m</option>[39m
                [36m</select>[39m
              [36m</div>[39m
            [36m</div>[39m
          [36m</div>[39m
        [36m</body>[39m
    
        [0m [90m 4 |[39m test([32m'renders learn react link'[39m[33m,[39m () [33m=>[39m {
         [90m 5 |[39m   render([33m<[39m[33mApp[39m [33m/[39m[33m>[39m)[33m;[39m
        [31m[1m>[22m[39m[90m 6 |[39m   [36mconst[39m linkElement [33m=[39m screen[33m.[39mgetByText([35m/learn react/i[39m)[33m;[39m
         [90m   |[39m                              [31m[1m^[22m[39m
         [90m 7 |[39m   expect(linkElement)[33m.[39mtoBeInTheDocument()[33m;[39m
         [90m 8 |[39m })[33m;[39m
         [90m 9 |[39m[0m
    
          at Object.getElementError (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/config.js:37:19)
          at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
          at node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
          at getByText (node_modules/@testing-library/react/node_modules/@testing-library/dom/dist/query-helpers.js:95:19)
          at Object.<anonymous> (src/App.test.js:6:30)
          at TestScheduler.scheduleTests (node_modules/@jest/core/build/TestScheduler.js:333:13)
          at runJest (node_modules/@jest/core/build/runJest.js:404:19)
          at _run10000 (node_modules/@jest/core/build/cli/index.js:320:7)
          at runCLI (node_modules/@jest/core/build/cli/index.js:173:3)
    
    Test Suites: 1 failed, 1 total
    Tests:       1 failed, 1 total
    Snapshots:   0 total
    Time:        1.48 s
    Ran all test suites.
    Jest did not exit one second after the test run has completed.
    
    This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
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
      
