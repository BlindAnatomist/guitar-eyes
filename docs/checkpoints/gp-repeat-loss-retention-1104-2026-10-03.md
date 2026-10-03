# Guitar Pro measure-local repeat-loss retention

Date: 2026-10-03. Bounded technical continuation only; no accepted-baseline promotion.

## Exact source

- Reviewed runtime/tests: `57c1695f6219b2e9a4666dd4551efb65e10aa1fe`.
- Completed source/evidence closure: `24a7b47e588c6820e35b4834ddec91323bb95284`.
- Implementation base: `3c6254239ab8a157a10dcda0c69f9eb308cbd071`.
- Public parent: `43a53d559e55d3cc8443311f6418c78990f83a13`, tree `c73e4c816812f3b8b58da2090c4220c14ae449b4`.

These source hashes identify the independently reviewed snapshot; they do not assert that historical source/evidence commits are public Git objects. This save changes exactly `src/guitarProSourceNormalizer.js` and `src/semanticDocumentValidation.js`, adds `src/crossFormatRepeatLosses.test.js` and adds this independently authored checkpoint. Every other existing public file is preserved.

## Bounded contract

The verified Guitar Pro wrapper retains three already-decoded fields: `repeatStart`, `repeatCount` and `alternateEndings`. Each selected-track/staff bar satisfying the existing repeat-warning predicate adds one `source-order-only` / `not-expanded` semantic-loss record. It carries the zero-based `sourceMeasureIndex`, retained source measure label, exact canonical measure ID and all three decoded values, including false/zero companions. The ending value remains a bit mask; it is not translated into an ending number.

Common localized-loss validation checks this GP loss kind against the document format, safe nonnegative ordinal, exact canonical measure at that ordinal, agreeing source label and measure-only scope. Wrong-but-existing targets, dangling references, contradictory ordinals and position-scoped repeat records reject. Duplicate labels are not identities. Existing omitted-locality and explicit-unlocalized compatibility remain deliberate.

Zero-repeat GP input acquires no loss array. Existing warnings and their wording, source-order positions, desktop data and explicit Read instructions remain exact. No traversal, repeat expansion or performance order is computed.

The lower shared normalizer, GP decoder/adapter, all parsers, supported profiles, source-version policy, limits, UI, focus, navigation, session marking, speech, identity, dependencies, fixtures, workflows and public-static inputs remain unchanged. PowerTab and TuxGuitar keep their repeat/ending rejection boundaries; GP empty measures still reject.

Encoded positive evidence is a test-only mutation of the locked original CC0 GP7 phrase. The five accepted GP3/4/5/6/7 byte fixtures remain unchanged and contain zero repeat metadata. Isolated-field and selected-track/staff probes use the established intermediate boundary. This does not establish arbitrary GP3-7 repeat compatibility, new external producer provenance, universal source-loss completeness, or stronger malformed/missing/coerced upstream-field guarantees. MusicXML retains its existing native attributes and localized loss policy.

## Verified local gates

- New permanent suite: 59 tests pass.
- Seven focused suites: 229 tests pass.
- Complete inherited gate: 90 active suites / 1,104 tests pass; the same producer-dependent suite / four tests remain intentionally skipped.
- Exact-base comparison: 73 checks / 21 GP cases pass. Removing only the additive loss array restores the exact complete loaded result, desktop data and every Read string. Three PT2 controls, all six accepted TG generations and the MusicXML repeat diagnostic also remain exact.
- Changed-file ESLint: zero errors/warnings across the three source/test files. This is not a whole-repository clean-lint claim.
- Optimized production build passes with installed locked dependencies through the resource-only serial-minifier harness below.
- All 30 emitted files and eight JavaScript assets are inventoried. All 83 embedded application-source entries match source; only the two intended runtime inputs differ from the base. alphaTab remains lazy. Format-only configuration and static identity remain unchanged; excluded audio/font/binary-tab/executable assets remain absent.
- Local production-bundle JSDOM preflight: 33 checks pass, including accepted imports, attached-technique Read, quiet navigation/mark/return/beginning, cancellation preservation, invalid replacement clearing and valid retry.

Independent review restored the complete-history runtime bundle, verified exact source/tree and clean `git fsck --full`, reran full/focused gates and rebuilt all 30 assets byte-for-byte. It reproduced four expected base retention failures plus the base's wrong-existing-measure validation defect, then verified all five corrected outcomes. Six additional hostile frozen-input probes reject without mutation. Numeric probes preserve count 7 and ending mask 129 exactly. Independent exact-baseline comparison and all 33 production-artifact checks also pass.

## Resource-constrained build and preserved limits

Two default parallel build attempts and one 768 MB parallel command exited before completion with CRA's SIGKILL/early-exit diagnostic. They are not passing builds. The successful local build uses the installed CRA production pipeline with only Terser and CSS-minifier worker fan-out disabled.

For reproduction, save this harness outside the checkout as `build-serial.cjs`, then run it from the checkout with already installed lockfile-matching dependencies:

```javascript
const path = require('path');
const { createRequire } = require('module');
const assert = require('assert/strict');
const root = process.cwd();
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
process.env.CI = 'true';
const local = createRequire(path.join(root, 'package.json'));
const configPath = local.resolve('react-scripts/config/webpack.config');
const factory = require(configPath);
require.cache[configPath].exports = (...args) => {
  const config = factory(...args);
  assert.equal(config.optimization.minimize, true);
  assert.equal(config.devtool, 'source-map');
  assert.deepEqual(
    config.optimization.minimizer.map(item => item.constructor.name),
    ['TerserPlugin', 'CssMinimizerPlugin']
  );
  config.optimization.minimizer.forEach(item => {
    assert.equal(item.options.parallel, true);
    item.options.parallel = false;
  });
  return config;
};
require(local.resolve('react-scripts/scripts/build'));
```

```sh
NODE_OPTIONS=--max-old-space-size=768 node ../build-serial.cjs
```

A separate independent property-descriptor audit of 190 actual CRA configuration objects proves exactly two changes: the Terser and CSS minimizers' `parallel` properties switch from true to false. Every other property/reference is preserved; production optimization, source maps and build lint stay enabled. That audit is distinct from the independently executed real production build. No package, lockfile, product source or tracked build configuration changed to obtain success. An unmodified parallel `npm run build` is not claimed to have passed.

Preparatory failures remain recorded in source evidence: an initial test assumed full GP/XML speech equality despite a pre-existing XML-only hammer-on; a focused launch named nonexistent suites; a timing utility was absent; a relative harness output path needed correction; and a verifier initially treated generated chunk-specific webpack bootstrap text as shared source input. Corrected checks preserve each format's own instructions and compare actual source inputs. None required fixture, dependency or product-boundary changes.

## Publication and acceptance boundary

This verifies metadata retention and document-local attachment. It adds no executable repeats, playback, new format/profile support, speech/UI surface or accepted operational baseline. Automated JSDOM with a byte-preserving File API shim is not native-browser, picker, iPhone or VoiceOver evidence. No new device acceptance is claimed.

This save targets only the existing technical branch. It includes no pull request, merge, main/accepted-branch change, default-branch change, workflow modification, Actions dispatch, charge, upstream change or application deployment. Inherited workflows remain manual-only; this commit uses skip-CI markers. Repository save, preview and complete recovery delivery are separate results.


## Exact source/test blob mapping

- src/guitarProSourceNormalizer.js: Git blob f1efc479b2dcbb50e33b2c46a05652e66913f950; SHA-256 9f0686727b8ca6518b2891d56032715c0da795f68adb1d8eff807fff22843464.
- src/semanticDocumentValidation.js: Git blob c3e515f13f2d44c40a8710a164baa03cf3e6e80b; SHA-256 5bd371206651eec141f73ea8988264f6577554a7869e8adc31aaf4120cd973fc.
- src/crossFormatRepeatLosses.test.js: Git blob 97e7fea9dac200eca3e16c1d03ff088e8ec459a2; SHA-256 506611bd0511bbc431d42ef31e10b0e7c26feaef08e2c21a65b1212680f18746.

Reviewed complete src tree: 33d07eb7d5b3f6563e54947789c76c5395c0db55. Unchanged public-static tree: 02fe095b52b9b67381018a86a6b07e4e10b90b1b.
