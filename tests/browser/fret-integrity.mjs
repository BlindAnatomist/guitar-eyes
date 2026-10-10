import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const FIXTURE = ['e|----3-|', 'B|--12--|', 'G|------|', 'D|------|', 'A|------|', 'E|------|'];
const CASCADE = ['e|--12----|', 'B|---34---|', 'G|----56--|', 'D|-----78-|', 'A|------90|', 'E|-------2|'];
const SHORT = ['e|--0|', 'B|---|', 'G|---|', 'D|---|', 'A|---|', 'E|---|'];
const ALL_FRETS = Array.from({ length: 100 }, (_, value) => String(value));
const body = ALL_FRETS.join('-');
const RANGE = [`e|${body}|`, ...['B', 'G', 'D', 'A', 'E'].map(label => `${label}|${'-'.repeat(body.length)}|`)];
const ARROW = 'Control+Alt+';
const GROUP = 'Control+Meta+Shift+';

// Independent source oracle. The test does not import application grouping code.
function sourceTokens(row) {
  return [...row.matchAll(/\d+|[^\d]/g)].map(match => ({ text: match[0], start: match.index, end: match.index + match[0].length }));
}
function safeGroups(rows, width) {
  const forbiddenCuts = new Set();
  for (const row of rows) for (const token of sourceTokens(row)) {
    for (let cut = token.start + 1; cut < token.end; cut++) forbiddenCuts.add(cut);
  }
  const groups = [];
  for (let start = 0; start < rows[0].length;) {
    let end = Math.min(start + width, rows[0].length);
    while (forbiddenCuts.has(end)) end++;
    groups.push({ start, end });
    start = end;
  }
  return groups;
}
function validateFixtures() {
  for (const rows of [FIXTURE, CASCADE, SHORT, RANGE]) {
    assert.equal(rows.length, 6);
    assert(rows.every(row => row.length === rows[0].length));
    assert(rows.every(row => sourceTokens(row).filter(token => /^\d/.test(token.text)).every(token => token.text.length <= 2)));
  }
  assert.deepEqual(safeGroups(FIXTURE, 5), [{ start: 0, end: 6 }, { start: 6, end: 9 }]);
  assert.deepEqual(safeGroups(CASCADE, 5), [{ start: 0, end: 10 }, { start: 10, end: 11 }]);
  assert.deepEqual(sourceTokens(RANGE[0]).filter(token => /^\d/.test(token.text)).map(token => token.text), ALL_FRETS);
  console.log('PASS: independent source fixtures and boundary expectations');
}
validateFixtures();
if (process.argv.includes('--check-fixtures')) process.exit(0);

const build = path.resolve(process.argv[2] || 'build');
const results = path.resolve(process.argv[3] || 'browser-results');
await fs.mkdir(results, { recursive: true });
const report = { applicationRepair: '543f3beecde5be80fccf4457d36ebbf58a9ed30e', testedCommit: process.env.GITHUB_SHA || null,
  startedAt: new Date().toISOString(), passed: [], runtimeErrors: [], unexpectedRequests: [], status: 'running',
  limitations: ['Speech synthesis is mocked; no audible speech or VoiceOver tested.', 'Linux Chromium does not establish macOS shortcut interception or assistive-technology compatibility.'] };
const require = createRequire(path.join(process.env.PLAYWRIGHT_PREFIX || process.cwd(), 'package.json'));
const { chromium } = require('playwright');
let browser;
let context;
let page;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const filename = path.resolve(build, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(build + path.sep)) { response.writeHead(403); response.end(); return; }
    const data = await fs.readFile(filename);
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(data);
  } catch { response.writeHead(404); response.end(); }
});
const deadline = setTimeout(() => { console.error('Browser test exceeded 150-second process bound.'); process.exit(124); }, 150_000);
function pass(name) { report.passed.push(name); console.log(`PASS: ${name}`); }
function grid(number = 1) { return page.getByRole('grid', { name: `Tablature ${number}`, exact: true }); }
function cell(label, number = 1) { return grid(number).getByRole('gridcell', { name: label, exact: true }); }
async function focused(locator) {
  await locator.waitFor({ state: 'visible' });
  await page.waitForFunction(element => document.activeElement === element, await locator.elementHandle());
}
async function upload(text, name = 'fixture.txt') {
  await page.locator('#file-upload').setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(text) });
}
async function valid(rows = FIXTURE, extra = []) {
  await page.locator('#multi-column').uncheck();
  await page.locator('#instrument-dropdown').selectOption('guitar');
  await upload([...rows, ...extra].join('\n'));
  await focused(grid());
  assert.equal(await page.getByRole('alert').count(), 0);
}
async function setWidth(width) {
  await page.locator('#multi-column').check();
  await page.locator('#column-dropdown').selectOption(String(width));
}
async function renderedRows(number = 1) {
  return grid(number).getByRole('row').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('[role="gridcell"]')].map(cell => ({
    text: cell.textContent, start: Number(cell.dataset.column), span: cell.colSpan,
    ariaSpan: Number(cell.getAttribute('aria-colspan')), ariaIndex: Number(cell.getAttribute('aria-colindex')),
  }))));
}
async function assertSource(rows, group, number = 1) {
  const actual = await renderedRows(number);
  assert.equal(actual.length, rows.length);
  actual.forEach((tokens, index) => {
    assert.deepEqual(tokens.map(({ text, start, span }) => ({ text, start, end: start + span })),
      sourceTokens(rows[index]).filter(token => token.start >= group.start && token.end <= group.end));
    assert.equal(tokens.reduce((sum, token) => sum + token.span, 0), group.end - group.start);
    assert.equal(tokens.map(token => token.text).join(''), rows[index].slice(group.start, group.end));
    for (const token of tokens) { assert.equal(token.ariaSpan, token.span); assert.equal(token.ariaIndex, token.start + 1); }
  });
}
async function staleSnapshot() {
  await page.keyboard.press('Enter');
  return page.evaluate(() => ({ index: window.testSpeech.utterances.length - 1, spoken: window.testSpeech.spoken.length, cancels: window.testSpeech.cancels }));
}
async function checkCancelled(snapshot) {
  await page.evaluate(index => {
    window.testSpeech.utterances[index].onend();
    window.testSpeech.utterances[index].onerror();
  }, snapshot.index);
  assert.equal(await page.evaluate(() => window.testSpeech.spoken.length), snapshot.spoken);
  assert((await page.evaluate(() => window.testSpeech.cancels)) > snapshot.cancels);
}

try {
  await fs.access(path.join(build, 'index.html'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  report.origin = origin;
  browser = await chromium.launch({ channel: 'chromium', headless: true });
  report.browser = browser.version();
  context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    report.unexpectedRequests.push(route.request().url());
    return route.abort();
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  await context.addInitScript(() => {
    window.testSpeech = { spoken: [], utterances: [], cancels: 0 };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speak(utterance) { window.testSpeech.spoken.push(utterance.text); window.testSpeech.utterances.push(utterance); },
      cancel() { window.testSpeech.cancels++; },
    } });
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    window.testKeys = [];
    document.addEventListener('keydown', event => window.testKeys.push({ key: event.key, code: event.code, shift: event.shiftKey, ctrl: event.ctrlKey, meta: event.metaKey }));
  });
  page = await context.newPage();
  page.setDefaultTimeout(7000);
  page.on('pageerror', error => report.runtimeErrors.push(String(error)));
  page.on('response', response => { if (response.status() >= 400) report.runtimeErrors.push(`HTTP ${response.status()} ${response.url()}`); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { level: 1 }).waitFor();

  await valid(RANGE);
  await assertSource(RANGE, { start: 0, end: RANGE[0].length });
  const frets = await grid().getByRole('row').first().getByRole('gridcell').evaluateAll(cells => cells.filter(cell => /, fret /.test(cell.getAttribute('aria-label'))).map(cell => cell.textContent));
  assert.deepEqual(frets, ALL_FRETS);
  pass('All fret values 0–99 survive actual file import as atomic, correctly spanned cells');

  await valid();
  await assertSource(FIXTURE, { start: 0, end: 9 });
  assert.equal(await grid().getAttribute('aria-rowcount'), '6');
  const note = cell('String 2, column 5, fret 12');
  const [noteBox, first, continuation, afterTop, afterSecond] = await Promise.all([
    note.boundingBox(), cell('String 1, column 5, dash').boundingBox(), cell('String 1, column 6, dash').boundingBox(),
    cell('String 1, column 7, fret 3').boundingBox(), cell('String 2, column 7, dash').boundingBox(),
  ]);
  assert(Math.abs(noteBox.x - first.x) < 0.5);
  assert(Math.abs(noteBox.width - first.width - continuation.width) < 0.5);
  assert(Math.abs(afterTop.x - afterSecond.x) < 0.5);
  await page.screenshot({ path: path.join(results, 'six-string-fret-12.png'), fullPage: true });
  pass('Actual six-string Chromium table geometry keeps fret 12 atomic and subsequent strings aligned');

  const anchor = cell('String 1, column 6, dash');
  await anchor.focus();
  await page.keyboard.press(ARROW + 'ArrowDown'); await focused(note);
  await page.keyboard.press(ARROW + 'ArrowUp'); await focused(anchor);
  await page.keyboard.press(ARROW + 'ArrowDown'); await focused(note);
  await page.keyboard.press(ARROW + 'ArrowRight'); await focused(cell('String 2, column 7, dash'));
  await page.keyboard.press(ARROW + 'ArrowLeft'); await focused(note);
  await cell('String 1, column 1, e').focus();
  await page.keyboard.press(ARROW + 'ArrowUp'); await focused(cell('String 6, column 1, E'));
  await page.keyboard.press(ARROW + 'ArrowDown'); await focused(cell('String 1, column 1, e'));
  await page.keyboard.press(ARROW + 'ArrowLeft'); await focused(cell('String 1, column 9, bar'));
  pass('Real keyboard navigation preserves vertical continuation anchors, skips split digits, and wraps');

  for (const rows of [FIXTURE, CASCADE]) {
    await valid(rows);
    for (let width = 1; width <= rows[0].length; width++) {
      await setWidth(width);
      const expected = safeGroups(rows, width);
      await grid().focus();
      for (const group of expected) {
        await assertSource(rows, group);
        await page.keyboard.press(GROUP + 'ArrowRight');
        const next = expected[(expected.indexOf(group) + 1) % expected.length];
        await focused(grid().locator(`[data-row="0"][data-column="${next.start}"]`));
      }
      await assertSource(rows, expected[0]);
    }
  }
  pass('Every group width 1–9 and 1–11 covers source text exactly once, extends cascading boundaries, and wraps focus');

  await valid(FIXTURE, ['', ...SHORT]);
  await setWidth(5);
  await grid().focus();
  await page.keyboard.press(GROUP + 'ArrowRight'); await focused(cell('String 1, column 7, fret 3'));
  await page.keyboard.press(GROUP + 'ArrowRight'); await focused(cell('String 1, column 1, e'));
  await page.keyboard.press(GROUP + 'ArrowLeft'); await focused(cell('String 1, column 7, fret 3'));
  await page.keyboard.press(GROUP + '_');
  assert.equal(await page.locator('#column-dropdown').inputValue(), '4');
  await focused(cell('String 1, column 1, e'));
  const minus = await page.evaluate(() => window.testKeys.filter(event => event.key === '_').at(-1));
  assert.deepEqual(minus, { key: '_', code: 'Minus', shift: true, ctrl: true, meta: true });
  await page.keyboard.press(GROUP + '+');
  assert.equal(await page.locator('#column-dropdown').inputValue(), '5');
  await focused(cell('String 1, column 1, e'));
  await setWidth(1); await grid().focus();
  await page.keyboard.press(GROUP + '_');
  assert.equal(await page.locator('#column-dropdown').inputValue(), '1');
  await focused(grid());
  await setWidth(9); await grid(2).focus();
  await page.keyboard.press(GROUP + '+');
  assert.equal(await page.locator('#column-dropdown').inputValue(), '9');
  await page.keyboard.press(GROUP + '_');
  assert.equal(await page.locator('#column-dropdown').inputValue(), '8');
  await focused(cell('String 1, column 1, e', 2));
  pass('Short groups, previous/next, real Shift-minus underscore, width limits and shared-width focus restoration');

  await grid().focus();
  await page.keyboard.press(ARROW + 'ArrowRight'); await focused(cell('String 1, column 1, e'));
  await page.keyboard.press('Tab'); await focused(grid(2));
  await page.keyboard.press('Shift+Tab'); await focused(grid());
  await page.keyboard.press('Shift+Tab'); await focused(page.locator('#column-dropdown'));
  pass('Native Tab and Shift+Tab escape cells, visit adjacent grids, and return to controls');

  await valid(); await setWidth(9); await grid().focus();
  const firstSpeech = await staleSnapshot();
  await page.keyboard.press('Enter');
  const afterRestart = await page.evaluate(() => window.testSpeech.spoken.length);
  await page.evaluate(index => { window.testSpeech.utterances[index].onend(); window.testSpeech.utterances[index].onerror(); }, firstSpeech.index);
  assert.equal(await page.evaluate(() => window.testSpeech.spoken.length), afterRestart);
  await page.evaluate(() => {
    let index = window.testSpeech.utterances.length - 1;
    let count = 0;
    while (index < window.testSpeech.utterances.length) {
      if (++count > 1000) throw Error('Unbounded speech sequence');
      window.testSpeech.utterances[index++].onend();
    }
  });
  const spoken = await page.evaluate(() => window.testSpeech.spoken);
  assert.equal(spoken.filter(text => text === 'String 2, fret 12').length, 1);
  assert.equal(spoken.filter(text => text === 'String 2, fret 1' || text === 'String 2, fret 2').length, 0);
  assert.equal(await page.getByRole('status').innerText(), 'Finished reading the selected group.');
  pass('Mocked browser speech reads fret 12 once and repeated Enter invalidates old callbacks');

  let speech = await staleSnapshot(); await page.keyboard.press('Escape'); await checkCancelled(speech);
  speech = await staleSnapshot(); await page.keyboard.press('Tab'); await checkCancelled(speech);
  await setWidth(5); await grid().focus();
  speech = await staleSnapshot(); await page.keyboard.press(GROUP + 'ArrowRight'); await checkCancelled(speech);
  speech = await staleSnapshot(); await page.keyboard.press(GROUP + '_'); await checkCancelled(speech);
  speech = await staleSnapshot(); await page.locator('#instrument-dropdown').selectOption('bass'); await checkCancelled(speech);
  assert.equal(await page.getByRole('grid').count(), 0);
  await upload(FIXTURE.slice(0, 4).join('\n'));
  await focused(grid());
  assert.equal(await grid().getAttribute('aria-rowcount'), '4');
  await assertSource(FIXTURE.slice(0, 4), { start: 0, end: 1 });
  pass('Escape, native Tab, group/width changes, and instrument unmount cancel speech without stale restart; bass has four strings');

  await valid();
  const invalid = [
    ['', 'no tablature'],
    [FIXTURE.slice(0, 5).join('\n') + '\n', 'Incomplete'],
    [[FIXTURE[0] + '-', ...FIXTURE.slice(1)].join('\n'), 'same number'],
    [FIXTURE.map(row => row[0] + '|--123--|').join('\n'), 'more than two digits'],
    ['Song title\n' + FIXTURE.join('\n'), 'not a supported'],
    [FIXTURE.map(row => row.replace('--', '\t-')).join('\n'), 'tabs or control'],
    [FIXTURE.map(row => row.replace('--', '\u0001-')).join('\n'), 'tabs or control'],
  ];
  for (const [text, expected] of invalid) {
    await upload(text, 'retry-same-file.txt');
    await page.getByRole('alert').waitFor();
    assert((await page.getByRole('alert').innerText()).includes(expected));
    assert.equal(await page.getByRole('grid').count(), 0);
    await upload(FIXTURE.join('\n'), 'retry-same-file.txt');
    await focused(grid());
    assert.equal(await page.getByRole('alert').count(), 0);
  }
  pass('Empty, partial, misaligned, ambiguous, prose, tab and control-character uploads reject visibly and recover on same-file retry');
  await setWidth(5); await grid().focus();
  speech = await staleSnapshot(); await upload(FIXTURE.join('\n')); await focused(grid()); await checkCancelled(speech);
  pass('Replacing a loaded file cancels active speech and restores the new grid focus');

  assert.deepEqual(report.runtimeErrors, []);
  assert.deepEqual(report.unexpectedRequests, []);
  pass('No browser runtime/asset errors or unexpected network requests in tested flows');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = { message: error.message, stack: error.stack };
  if (page) await page.screenshot({ path: path.join(results, 'failure.png'), fullPage: true }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  if (context) await context.tracing.stop({ path: path.join(results, 'trace.zip') }).catch(() => {});
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  clearTimeout(deadline);
  await fs.writeFile(path.join(results, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
