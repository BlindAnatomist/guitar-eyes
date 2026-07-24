# Bounded iPhone Proof Automated Results

Generated from audit-branch commit: `6882c3af634a8d72d46f4b0269b7236421ee5bad`

Node version: `v20.20.2`

npm version: `10.8.2`

## Result summary

- npm ci exit code: `0`
- automated test exit code: `0`
- production build exit code: `0`

Exit code 0 means success. Exit code 125 means the command was skipped because installation failed.

## npm ci log

    npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
    npm warn deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated. See the compatibility table on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#browser_compatibility
    npm warn deprecated @babel/plugin-proposal-private-methods@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-private-methods instead.
    npm warn deprecated @babel/plugin-proposal-nullish-coalescing-operator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-nullish-coalescing-operator instead.
    npm warn deprecated @babel/plugin-proposal-numeric-separator@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-numeric-separator instead.
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
    
    added 1678 packages, and audited 1679 packages in 12s
    
    262 packages are looking for funding
      run `npm fund` for details
    
    64 vulnerabilities (15 low, 15 moderate, 31 high, 3 critical)
    
    To address issues that do not require attention, run:
      npm audit fix
    
    To address all issues (including breaking changes), run:
      npm audit fix --force
    
    Run `npm audit` for details.

## Automated test log

    
    > guitar-eyes@0.1.0 test
    > react-scripts test --watchAll=false
    
    PASS src/iphoneTabModel.test.js
    PASS src/IPhoneTabReader.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 16 |[39m describe([32m"IPhoneTabReader"[39m[33m,[39m () [33m=>[39m {
         [90m 17 |[39m   test([32m"exposes the three bounded iPhone controls"[39m[33m,[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 18 |[39m     render([33m<[39m[33mIPhoneTabReader[39m document[33m=[39m{document} [33m/[39m[33m>[39m)[33m;[39m
         [90m    |[39m           [31m[1m^[22m[39m
         [90m 19 |[39m
         [90m 20 |[39m     expect(screen[33m.[39mgetByRole([32m"button"[39m[33m,[39m { name[33m:[39m [32m"Previous position"[39m }))[33m.[39mtoBeDisabled()[33m;[39m
         [90m 21 |[39m     expect(screen[33m.[39mgetByRole([32m"button"[39m[33m,[39m { name[33m:[39m [32m"Next position"[39m }))[33m.[39mtoBeEnabled()[33m;[39m[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/IPhoneTabReader.test.js:18:11)
    
    PASS src/App.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 4 |[39m describe([32m"Guitar Eyes application shell"[39m[33m,[39m () [33m=>[39m {
         [90m 5 |[39m   test([32m"preserves the desktop reader and exposes the iPhone mode"[39m[33m,[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 6 |[39m     render([33m<[39m[33mApp[39m [33m/[39m[33m>[39m)[33m;[39m
         [90m   |[39m           [31m[1m^[22m[39m
         [90m 7 |[39m
         [90m 8 |[39m     expect(
         [90m 9 |[39m       screen[33m.[39mgetByRole([32m"heading"[39m[33m,[39m {[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/App.test.js:6:11)
    
    A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
    
    Test Suites: 3 passed, 3 total
    Tests:       12 passed, 12 total
    Snapshots:   0 total
    Time:        2.595 s
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
    
      74.44 kB  build/static/js/main.79af68fa.js
      1.77 kB   build/static/js/453.eaf0ef0f.chunk.js
      841 B     build/static/css/main.e7bcd723.css
    
    The project was built assuming it is hosted at /.
    You can control this with the homepage field in your package.json.
    
    The build folder is ready to be deployed.
    You may serve it with a static server:
    
      npm install -g serve
      serve -s build
    
    Find out more about deployment here:
    
      https://cra.link/deployment
    
