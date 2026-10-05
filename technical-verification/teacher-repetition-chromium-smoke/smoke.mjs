import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { createRequire } from 'node:module';

// This is intentionally a CI-only script, not a replacement for Safari/VoiceOver
// acceptance. It uses the exact reviewed production artifact, with no app mocks.
const require = createRequire(import.meta.url);
const [buildArg, fixtureArg, repetitionArg, outputArg] = process.argv.slice(2);
assert(buildArg && fixtureArg && repetitionArg && outputArg, 'usage: smoke.mjs BUILD TEACHER_FIXTURE REPETITION_FIXTURE OUTPUT');
assert(process.env.CI === 'true', 'Browser smoke is restricted to the approved CI job');
assert(process.env.PLAYWRIGHT_PREFIX, 'An isolated Playwright installation is required');
const build = resolve(buildArg);
const output = resolve(outputArg);
const manifest = JSON.parse(await readFile(new URL('./reviewed-build-manifest.json', import.meta.url)));
const fixture = await readFile(fixtureArg);
const repetitionFixture = await readFile(repetitionArg);
assert.equal(createHash('sha256').update(repetitionFixture).digest('hex'), manifest.repetitionFixture.sha256);
assert.equal(createHash('sha256').update(fixture).digest('hex'), manifest.teacherFixture.sha256);
const packageRoot = join(process.env.PLAYWRIGHT_PREFIX, 'node_modules', 'playwright');
const playwrightPackage = require(join(packageRoot, 'package.json'));
assert.equal(playwrightPackage.version, '1.63.0', 'Playwright version must remain pinned');
const { chromium } = require(packageRoot);
await mkdir(output, { recursive: true });

const result = {
  status: 'running', commit: process.env.GITHUB_SHA || null,
  runtimeCommit: manifest.runtimeCommit, closureCommit: manifest.closureCommit,
  archiveSha256: manifest.archive.sha256, assetCount: manifest.assetCount,
  playwrightVersion: playwrightPackage.version, browserVersion: null,
  checks: [], error: null,
  limitations: ['Chromium technical smoke only; no Safari, VoiceOver, native picker, or teaching-value acceptance.'],
};
const diagnostics = [];
const record = (type, text) => {
  if (diagnostics.length < 30) diagnostics.push({ type, text: String(text).slice(0, 1200) });
};
const assets = new Map();
for (const asset of manifest.assets) {
  const bytes = await readFile(join(build, asset.path));
  assert.equal(bytes.length, asset.bytes, `served byte count: ${asset.path}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `served SHA-256: ${asset.path}`);
  assets.set('/' + asset.path, bytes);
}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain', '.map': 'application/json' };
const server = createServer((request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1').pathname;
  const key = path === '/' ? '/index.html' : path;
  if (!['GET', 'HEAD'].includes(request.method) || !assets.has(key)) {
    response.writeHead(404); response.end(); return;
  }
  response.writeHead(200, { 'Content-Type': mime[extname(key)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  response.end(request.method === 'HEAD' ? undefined : assets.get(key));
});
let browser;
let currentPage;
const watchdog = setTimeout(() => {
  result.status = 'failed'; result.error = 'The bounded 150-second smoke deadline expired';
  writeFile(join(output, 'result.json'), JSON.stringify(result, null, 2)).finally(() => process.exit(1));
}, 150_000);

try {
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ channel: 'chromium', headless: true, timeout: 30_000 });
  result.browserVersion = browser.version();
  for (const profile of [
    { name: 'desktop', viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false, mode: 'Desktop grid reader' },
    { name: 'mobile-size', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, mode: 'iPhone semantic reader' },
  ]) {
    const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile,
      hasTouch: profile.hasTouch, deviceScaleFactor: 1, serviceWorkers: 'block' });
    // No app request is allowed to leave this ephemeral loopback server.
    await context.route('**/*', async (route) => {
      if (new URL(route.request().url()).origin === origin) await route.continue();
      else { record('external-request-blocked', 'An unexpected off-origin request was blocked'); await route.abort(); }
    });
    const page = await context.newPage();
    currentPage = page;
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => record('pageerror', error.message));
    page.on('console', message => { if (message.type() === 'error') record('console-error', message.text()); });
    page.on('response', response => { if (response.status() >= 400) record('http-error', `${response.status()} ${new URL(response.url()).pathname}`); });
    const button = name => page.getByRole('button', { name, exact: true });
    const click = name => button(name).click();
    const description = () => page.locator('.position-description');
    const live = () => page.locator('.visually-hidden[aria-live]');
    async function textIs(locator, expected, exact = false) {
      await locator.waitFor({ state: 'attached' });
      const element = await locator.elementHandle();
      await page.waitForFunction(({ element, expected, exact }) => element.isConnected &&
        (exact ? element.textContent === expected : element.textContent.includes(expected)), { element, expected, exact });
    }
    async function focused(locator) {
      await locator.waitFor({ state: 'attached' });
      await page.waitForFunction(element => element.isConnected && document.activeElement === element, await locator.elementHandle());
    }
    async function check(name, work) {
      try { await work(); result.checks.push({ viewport: profile.name, name, status: 'passed' }); }
      catch (error) { result.checks.push({ viewport: profile.name, name, status: 'failed' }); throw new Error(`${profile.name}: ${name}: ${error.message}`); }
    }
    const quiet = () => textIs(live(), '', true);
    async function contained() {
      if (!profile.isMobile) return;
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth }));
      assert(sizes.content <= sizes.viewport + 1, `mobile horizontal overflow: ${JSON.stringify(sizes)}`);
    }
    const readerHeading = () => page.getByRole('heading', { name: profile.name === 'desktop' ? 'Desktop tablature reader' : 'iPhone tablature reader', exact: true });
    const changed = 'Inspect changed ending: measure 3, position 4';
    const recurrence = 'Inspect recurrence: measure 2';
    const changedDescription = 'Measure 3 of 3. Position 4 of 4 in this measure. Duration, quarter note. High E string, fret 5.';
    const recurrenceDescription = 'Measure 2 of 3. Position 1 of 4 in this measure. Duration, quarter note. B string, fret 1. High E string, open.';
    let marked;
    await check('production identity and original example', async () => {
      await page.goto(origin, { waitUntil: 'networkidle', timeout: 15_000 });
      assert.equal(await page.title(), 'Guitar Eyes repetition prototype 2');
      await textIs(page.locator('h1').first(), 'Guitar Eyes repetition prototype 2', true);
      await page.getByRole('radio', { name: profile.mode, exact: true }).check();
      assert.equal(await page.getByLabel('Upload tablature file:').getAttribute('accept'), null);
      await click('Load original teacher example');
      await focused(readerHeading());
      await textIs(description(), 'Measure 1 of 3. Position 1 of 4');
      await quiet();
      assert.equal(await button('Return to mark').isDisabled(), true);
    });
    await check('independent mark and lesson explanation', async () => {
      await click('Next position'); await click('Mark current position');
      marked = await description().textContent();
      assert(marked.includes('Position 2 of 4'));
      await click('Open pattern lesson');
      await focused(page.getByRole('heading', { name: 'Pattern and changed ending', exact: true }));
      const lesson = page.locator('.teacher-lesson');
      await textIs(lesson, 'Measures 1 and 2 have the same imported string-and-fret positions, simultaneous notes, rests and notated durations.');
      await textIs(lesson, 'Measure 3 shares the first 3 positions with measure 1, then changes position 4, the final position.');
      await textIs(lesson, 'B string, fret 1. High E string, open.');
      await textIs(lesson, 'G string, open.');
      await textIs(lesson, 'Rest.');
      await textIs(lesson, 'High E string, fret 3.');
      await textIs(lesson, 'High E string, fret 5.');
      await page.getByRole('heading', { name: 'Suggested rehearsal order', exact: true }).waitFor();
      await textIs(lesson, 'Guitar Eyes does not listen to or assess your playing.');
      assert.equal(await lesson.locator('[aria-live]').count(), 0);
      assert.equal(await page.getByRole('button', { name: /played it|audition|playback/i }).count(), 0);
      assert.equal(await page.getByRole('group', { name: 'Inspect lesson evidence', exact: true }).getByRole('button').count(), 5);
      await quiet();
      await contained();
      await lesson.screenshot({ path: join(output, `${profile.name}-lesson.png`) });
    });
    await check('changed ending, explicit Read, and exact return focus', async () => {
      await click(changed);
      await focused(button('Read current position'));
      await textIs(description(), changedDescription, true);
      await quiet();
      await contained();
      assert.equal(await button('Next position').isDisabled(), true);
      assert.deepEqual(await page.getByRole('group', { name: 'Position navigation', exact: true }).getByRole('button').allTextContents(),
        ['Previous position', 'Read current position', 'Next position']);
      await click('Read current position');
      await textIs(live(), changedDescription, true);
      await click('Return to pattern lesson');
      await focused(button(changed)); await quiet();
    });
    await check('recurrence, preserved mark, and quiet ordinary navigation', async () => {
      await click(recurrence); await focused(button('Read current position'));
      await textIs(description(), recurrenceDescription, true); await quiet();
      await click('Return to mark'); await textIs(description(), marked, true); await quiet();
      await click('Go to beginning'); await textIs(description(), 'Measure 1 of 3. Position 1 of 4');
      await click('Next position'); await textIs(description(), marked, true); await quiet();
      await click('Previous position'); await textIs(description(), 'Measure 1 of 3. Position 1 of 4'); await quiet();
      await click('Return to pattern lesson'); await focused(button(recurrence));
      await click('Close pattern lesson'); await focused(button('Open pattern lesson'));
      await click('Open pattern lesson'); await click(changed);
      await click('Return to pattern lesson'); await focused(button(changed));
      await click('Close pattern lesson'); await focused(button('Open pattern lesson')); await quiet();
    });
    async function upload(buffer, name, heading = 'Pattern and changed ending') {
      await page.getByLabel('Upload tablature file:').setInputFiles({ name, mimeType: 'text/plain', buffer });
      await focused(readerHeading());
      assert.equal(await button('Return to mark').isDisabled(), true);
      await click('Open pattern lesson');
      await focused(page.getByRole('heading', { name: heading, exact: true }));
    }
    await check('unchanged original upload is eligible', async () => {
      await upload(fixture, 'unchanged-original.musicxml');
      await button(changed).waitFor({ state: 'visible' });
      await textIs(page.locator('.teacher-lesson'), 'Measures 1 and 2 have the same imported');
    });
    await check('changed source has an honest teacher limitation', async () => {
      await upload(Buffer.concat([fixture, Buffer.from('\n')]), 'changed-source.musicxml', 'Pattern lesson unavailable');
      await textIs(description(), 'Measure 1 of 3. Position 1 of 4');
      await textIs(page.locator('.teacher-lesson'), 'Teaching is available only for the reviewed original examples, including unchanged uploads of them.');
      assert.equal(await button(changed).count(), 0);
      assert.equal(await button('Return to pattern lesson').count(), 0);
    });
    await check('ordinary upload remains readable with an honest limitation', async () => {
      const ordinary = 'e|--0--2--3--|\nB|-----------|\nG|-----------|\nD|-----------|\nA|-----------|\nE|-----------|';
      await upload(Buffer.from(ordinary), 'original-smoke-example.tab', 'Pattern lesson unavailable');
      await textIs(description(), 'High E string, open.');
      await textIs(page.locator('.teacher-lesson'), 'Other files may omit notation the reader cannot yet interpret; no warnings does not prove they are safe to compare.');
      assert.equal(await button(changed).count(), 0);
      await click('Close pattern lesson'); await focused(button('Open pattern lesson'));
      await click('Next position'); await textIs(description(), 'High E string, fret 2.'); await quiet();
      await click('Read current position'); await textIs(live(), await description().textContent(), true);
    });
    await check('empty browser storage and mobile-width containment', async () => {
      assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
      await contained();
    });
    let repetitionMark;
    await check('repetition choice, exact scope and reusable measure', async () => {
      assert.deepEqual(await page.getByRole('group', { name: 'Choose a reviewed lesson example', exact: true }).getByRole('button').allTextContents(),
        ['Load repetition study', 'Load original teacher example']);
      await click('Load repetition study'); await focused(readerHeading());
      assert.equal(await button('Return to mark').isDisabled(), true);
      await click('Next position'); await click('Mark current position'); repetitionMark = await description().textContent();
      await click('Open pattern lesson');
      await focused(page.getByRole('heading', { name: 'Recognize exact repetition', exact: true }));
      const lesson = page.locator('.teacher-lesson');
      await textIs(lesson, 'Measures 1, 2 and 3 have the same imported string-and-fret positions, simultaneous notes, rests and notated durations.');
      await textIs(lesson, 'The whole measure can be reused at each listed occurrence, including its simultaneous notes, rest and rhythm.');
      await textIs(lesson, 'Try the selected measures in written order: 1, 2 and 3.');
      await textIs(lesson, 'This suggestion covers only those measures');
      assert.equal(await page.getByRole('heading', { name: 'The two endings', exact: true }).count(), 0);
      assert.equal(await button(changed).count(), 0);
      assert.equal(await page.getByRole('group', { name: 'Inspect lesson evidence', exact: true }).getByRole('button').count(), 3);
      assert.equal(await lesson.locator('[aria-live]').count(), 0);
      await quiet(); await contained();
      await lesson.screenshot({ path: join(output, `${profile.name}-repetition-lesson.png`) });
    });
    await check('every recurrence traverses canonical evidence and preserves the mark', async () => {
      for (let measure = 1; measure <= 3; measure += 1) {
        const label = `Inspect ${measure === 1 ? 'first pattern' : 'recurrence'}: measure ${measure}`;
        await click(label); await focused(button('Read current position')); await quiet(); await contained();
        for (let position = 1; position <= 4; position += 1) {
          await textIs(description(), `Measure ${measure} of 3. Position ${position} of 4`);
          await click('Read current position');
          const instruction = await description().textContent(); await textIs(live(), instruction, true);
          if (position < 4) {
            await click('Next position');
            // Ordinary desktop movement retains the previous announcement without writing one.
            if (profile.isMobile) await quiet(); else await textIs(live(), instruction, true);
          }
        }
        await click('Return to pattern lesson'); await focused(button(label)); await quiet();
      }
      await click('Inspect recurrence: measure 3'); await click('Return to mark');
      await textIs(description(), repetitionMark, true); await quiet();
      await click('Return to pattern lesson'); await focused(button('Inspect recurrence: measure 3'));
    });
    await check('repetition source admission and separate original comparison', async () => {
      await upload(repetitionFixture, 'original-repetition.musicxml', 'Recognize exact repetition');
      await button('Inspect recurrence: measure 3').waitFor({ state: 'visible' });
      await upload(Buffer.concat([repetitionFixture, Buffer.from('\n')]), 'changed-repetition.musicxml', 'Pattern lesson unavailable');
      await textIs(page.locator('.teacher-lesson'), 'Teaching is available only for the reviewed original examples');
      assert.equal(await button('Inspect recurrence: measure 3').count(), 0);
      await click('Load original teacher example'); await focused(readerHeading()); await click('Open pattern lesson');
      await focused(page.getByRole('heading', { name: 'Pattern and changed ending', exact: true }));
      await button(changed).waitFor({ state: 'visible' }); await click(changed); await click('Mark current position');
      await click('Load repetition study'); await focused(readerHeading());
      assert.equal(await button('Return to mark').isDisabled(), true);
      assert.equal(await button('Return to pattern lesson').count(), 0);
      await click('Open pattern lesson'); await focused(page.getByRole('heading', { name: 'Recognize exact repetition', exact: true }));
      assert.equal(await button(changed).count(), 0);
    });
    await check('repetition cancellation, mode reset and repeated returns stay bounded', async () => {
      await click('Inspect recurrence: measure 3'); await click('Mark current position');
      const markedHere = await description().textContent();
      // An empty selection exercises App cancellation; it is not a native picker gesture test.
      await page.getByLabel('Upload tablature file:').setInputFiles([]);
      await button('Return to pattern lesson').waitFor({ state: 'visible' });
      await textIs(description(), markedHere, true);
      await page.getByRole('radio', { name: profile.isMobile ? 'Desktop grid reader' : 'iPhone semantic reader', exact: true }).check();
      await focused(page.getByRole('heading', { name: profile.isMobile ? 'Desktop tablature reader' : 'iPhone tablature reader', exact: true }));
      assert.equal(await button('Return to pattern lesson').count(), 0);
      await click('Return to mark'); await textIs(description(), markedHere, true);
      await page.getByRole('radio', { name: profile.mode, exact: true }).check(); await focused(readerHeading());
      await click('Return to mark'); await textIs(description(), markedHere, true);
      for (let attempt = 0; attempt < 2; attempt += 1) {
        await click('Open pattern lesson'); await click('Inspect recurrence: measure 3');
        await focused(button('Read current position')); await quiet();
        await click('Return to pattern lesson'); await focused(button('Inspect recurrence: measure 3')); await quiet();
        await click('Close pattern lesson'); await focused(button('Open pattern lesson'));
      }
      assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
      assert.equal(await page.getByRole('button', { name: /played it|audition|playback/i }).count(), 0);
      await contained();
    });
    currentPage = null;
    await context.close();
  }
  assert.equal(result.checks.length, 24, 'Exactly 24 bounded checks must execute');
  assert.deepEqual(diagnostics, [], 'Unexpected browser console, network, or runtime errors');
  result.status = 'passed';
} catch (error) {
  result.status = 'failed'; result.error = String(error.message).slice(0, 4000);
  if (currentPage && !currentPage.isClosed()) {
    await currentPage.screenshot({ path: join(output, 'failure.png'), fullPage: false, timeout: 5000 }).catch(() => {});
  }
  process.exitCode = 1;
} finally {
  clearTimeout(watchdog);
  await writeFile(join(output, 'result.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(join(output, 'console-errors.json'), JSON.stringify(diagnostics, null, 2) + '\n');
  await browser?.close();
  server.closeAllConnections();
  await new Promise(done => server.close(done));
  console.log(JSON.stringify({ status: result.status, passedChecks: result.checks.filter(item => item.status === 'passed').length,
    browserVersion: result.browserVersion, error: result.error }));
}
