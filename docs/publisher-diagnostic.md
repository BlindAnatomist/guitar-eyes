# Temporary Publisher Diagnostic

Workflow commit: `51573ac73890407dc2420591ae1bb804fc09e79a`

Install exit code: `0`

Test exit code: `1`

Build exit code: `0`

## Test log

    
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
    
    FAIL src/App.test.js
      ● Console
    
        console.error
          Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.
    
        [0m [90m 18 |[39m describe([32m"Guitar Eyes application shell"[39m[33m,[39m () [33m=>[39m {
         [90m 19 |[39m   test([32m"preserves the desktop reader and exposes the iPhone mode"[39m[33m,[39m () [33m=>[39m {
        [31m[1m>[22m[39m[90m 20 |[39m     render([33m<[39m[33mApp[39m [33m/[39m[33m>[39m)[33m;[39m
         [90m    |[39m           [31m[1m^[22m[39m
         [90m 21 |[39m
         [90m 22 |[39m     expect(
         [90m 23 |[39m       screen[33m.[39mgetByRole([32m"heading"[39m[33m,[39m {[0m
    
          at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
          at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
          at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
          at node_modules/@testing-library/react/dist/act-compat.js:63:25
          at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
          at render (node_modules/@testing-library/react/dist/pure.js:246:10)
          at Object.<anonymous> (src/App.test.js:20:11)
    
      ● Guitar Eyes application shell › preserves the desktop reader and exposes the iPhone mode
    
        TypeError: expect(...).toBeExpanded is not a function
    
        [0m [90m 34 |[39m     expect(
         [90m 35 |[39m       screen[33m.[39mgetByRole([32m"button"[39m[33m,[39m { name[33m:[39m [32m"Close Mac keyboard instructions"[39m })
        [31m[1m>[22m[39m[90m 36 |[39m     )[33m.[39mtoBeExpanded()[33m;[39m
         [90m    |[39m       [31m[1m^[22m[39m
         [90m 37 |[39m   })[33m;[39m
         [90m 38 |[39m
         [90m 39 |[39m   test([32m"allows the reader mode to change without removing desktop controls"[39m[33m,[39m () [33m=>[39m {[0m
    
          at Object.<anonymous> (src/App.test.js:36:7)
    
      ● Guitar Eyes application shell › puts iPhone controls before collapsed Mac instructions on a touch device
    
        TypeError: expect(...).not.toBeExpanded is not a function
    
        [0m [90m 72 |[39m
         [90m 73 |[39m     expect(iphoneMode)[33m.[39mtoBeChecked()[33m;[39m
        [31m[1m>[22m[39m[90m 74 |[39m     expect(instructionsButton)[33m.[39mnot[33m.[39mtoBeExpanded()[33m;[39m
         [90m    |[39m                                    [31m[1m^[22m[39m
         [90m 75 |[39m     expect(screen[33m.[39mqueryByText([35m/Welcome to Guitar Eyes for Mac!/i[39m))[33m.[39mnot[33m.[39mtoBeInTheDocument()[33m;[39m
         [90m 76 |[39m     expect(
         [90m 77 |[39m       upload[33m.[39mcompareDocumentPosition(instructionsButton) [33m&[39m [33mNode[39m[33m.[39m[33mDOCUMENT_POSITION_FOLLOWING[39m[0m
    
          at Object.<anonymous> (src/App.test.js:74:36)
    
    A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
    Test Suites: 1 failed, 2 passed, 3 total
    Tests:       2 failed, 11 passed, 13 total
    Snapshots:   0 total
    Time:        3.144 s
    Ran all test suites.

## Build log

    
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
    
      74.47 kB  build/static/js/main.27f696db.js
      1.77 kB   build/static/js/453.eaf0ef0f.chunk.js
      841 B     build/static/css/main.e7bcd723.css
    
    The project was built assuming it is hosted at /guitar-eyes/.
    You can control this with the homepage field in your package.json.
    
    The build folder is ready to be deployed.
    
    Find out more about deployment here:
    
      https://cra.link/deployment
    
