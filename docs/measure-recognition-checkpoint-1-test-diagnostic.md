# Measure Recognition Checkpoint 1 Test Diagnostic

Source checkpoint: `98e712a960798b9d3d73c0c1b981d3f19b431df0`

Test exit status: `1`

```text

> guitar-eyes@0.1.0 test
> react-scripts test --watchAll=false

PASS src/iphoneTabModel.test.js
PASS src/tabImportCoordinator.test.js
PASS src/asciiRhythm.test.js
PASS src/IPhoneTabReader.test.js
  ● Console

    console.error
      Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.

    [0m [90m 33 |[39m describe([32m"IPhoneTabReader"[39m[33m,[39m () [33m=>[39m {
     [90m 34 |[39m   test([32m"centers the current-position action between quiet navigation controls"[39m[33m,[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 35 |[39m     [36mconst[39m { container } [33m=[39m render([33m<[39m[33mIPhoneTabReader[39m document[33m=[39m{document} [33m/[39m[33m>[39m)[33m;[39m
     [90m    |[39m                                 [31m[1m^[22m[39m
     [90m 36 |[39m
     [90m 37 |[39m     [36mconst[39m read [33m=[39m screen[33m.[39mgetByRole([32m"button"[39m[33m,[39m { name[33m:[39m [32m"Read current position"[39m })[33m;[39m
     [90m 38 |[39m     [36mconst[39m previous [33m=[39m screen[33m.[39mgetByRole([32m"button"[39m[33m,[39m { name[33m:[39m [32m"Previous position"[39m })[33m;[39m[0m

      at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
      at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
      at node_modules/@testing-library/react/dist/act-compat.js:63:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
      at render (node_modules/@testing-library/react/dist/pure.js:246:10)
      at Object.<anonymous> (src/IPhoneTabReader.test.js:35:33)

PASS src/measureModel.test.js
PASS src/realWorldCorpus.test.js
FAIL src/positionDescription.test.js
  ● describePlayablePosition › announces a mapped duration through the existing current-position action

    expect(received).toBe(expected) // Object.is equality

    Expected: "Position 1 of 1. Duration, quarter note. High E string, open."
    Received: "Measure 1 of 1. Position 1 of 1 in this measure. Duration, quarter note. High E string, open."

    [0m [90m 80 |[39m     [36mconst[39m document [33m=[39m buildReaderDocuments(source[33m,[39m [32m"guitar"[39m)[33m.[39msemanticDocument[33m;[39m
     [90m 81 |[39m
    [31m[1m>[22m[39m[90m 82 |[39m     expect(describePlayablePosition(document[33m,[39m [35m0[39m))[33m.[39mtoBe(
     [90m    |[39m                                                   [31m[1m^[22m[39m
     [90m 83 |[39m       [32m"Position 1 of 1. Duration, quarter note. High E string, open."[39m
     [90m 84 |[39m     )[33m;[39m
     [90m 85 |[39m   })[33m;[39m[0m

      at Object.<anonymous> (src/positionDescription.test.js:82:51)

PASS src/semanticDocument.test.js
PASS src/tabFormatDetector.test.js
PASS src/desktopSemanticAdapter.test.js
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

PASS src/parseFile.test.js
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
  
PASS src/App.test.js
  ● Console

    console.error
      Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`. Import `act` from `react` instead of `react-dom/test-utils`. See https://react.dev/warnings/react-dom-test-utils for more info.

    [0m [90m 44 |[39m describe([32m"Guitar Eyes application shell"[39m[33m,[39m () [33m=>[39m {
     [90m 45 |[39m   test([32m"preserves the desktop reader and exposes the iPhone mode"[39m[33m,[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 46 |[39m     render([33m<[39m[33mApp[39m [33m/[39m[33m>[39m)[33m;[39m
     [90m    |[39m           [31m[1m^[22m[39m
     [90m 47 |[39m
     [90m 48 |[39m     expect(
     [90m 49 |[39m       screen[33m.[39mgetByRole([32m"heading"[39m[33m,[39m {[0m

      at printWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:71:30)
      at error (node_modules/react-dom/cjs/react-dom-test-utils.development.js:45:7)
      at actWithWarning (node_modules/react-dom/cjs/react-dom-test-utils.development.js:1736:7)
      at node_modules/@testing-library/react/dist/act-compat.js:63:25
      at renderRoot (node_modules/@testing-library/react/dist/pure.js:159:26)
      at render (node_modules/@testing-library/react/dist/pure.js:246:10)
      at Object.<anonymous> (src/App.test.js:46:11)


Test Suites: 1 failed, 12 passed, 13 total
Tests:       1 failed, 69 passed, 70 total
Snapshots:   0 total
Time:        4.296 s
Ran all test suites.
```
