import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTablature, tokenizeRow, createTablatureModel, createColumnGroups,
  tokensInGroup, tokenAtColumn, moveGridPosition, groupSpeech, clampGroupWidth,
} from '../src/tablatureModel.js';
import { parseFile } from '../src/parseFile.js';
import { createSpeechPlayer } from '../src/speechPlayer.js';

const guitar = ['e|----3-|', 'B|--12--|', 'G|------|', 'D|------|', 'A|------|', 'E|------|'];
const makeTab = fret => [`e|--${fret}${'-'.repeat(4 - fret.length)}|`, ...guitar.slice(1).map(row => `${row[0]}|------|`)];
const model = createTablatureModel(guitar);

test('all one- and two-digit frets are preserved verbatim, including 23/24', () => {
  for (let fret = 0; fret <= 99; fret++) {
    const rows = makeTab(String(fret));
    assert.deepEqual(parseTablature(rows.join('\n'), 6), [rows]);
    const notes = createTablatureModel(rows).rows[0].filter(token => token.kind === 'fret');
    assert.deepEqual(notes.map(token => token.text), [String(fret)]);
  }
  assert.equal(tokenizeRow('e|--00--|').find(token => token.kind === 'fret').text, '00');
});

test('guitar and bass blocks are complete with or without terminal newlines, CRLF, and BOM', () => {
  for (const count of [4, 6]) {
    const rows = guitar.slice(0, count);
    for (const eol of ['\n', '\r\n', '\r']) {
      for (const suffix of ['', eol, eol + eol]) {
        assert.deepEqual(parseTablature('\uFEFF' + rows.join(eol) + suffix, count), [rows]);
      }
    }
    assert.deepEqual(parseTablature(rows.join('\n') + '\n\n' + rows.join('\n'), count), [rows, rows]);
  }
});

test('empty, partial, prose, ragged, control-character, and ambiguous numeric input is rejected', () => {
  for (const input of ['', '\n\n ', guitar.slice(0, 5).join('\n'), guitar.slice(0, 5).join('\n') + '\n']) {
    assert.throws(() => parseTablature(input, 6), /no tablature|Incomplete/);
  }
  assert.throws(() => parseTablature(guitar.join('\n'), 5), /four-string bass or six-string/);
  assert.throws(() => parseTablature(null, 6), /read as text/);
  assert.throws(() => parseTablature('Song title\n' + guitar.join('\n'), 6), /Line 1/);
  assert.throws(() => parseTablature([guitar[0], '', ...guitar.slice(1)].join('\n'), 6), /Incomplete/);
  assert.throws(() => parseTablature([guitar[0] + '-', ...guitar.slice(1)].join('\n'), 6), /same number/);
  assert.throws(() => parseTablature(['e|--123-|', ...guitar.slice(1)].join('\n'), 6), /more than two digits/);
  assert.throws(() => parseTablature(['e|--\t3-|', ...guitar.slice(1)].join('\n'), 6), /control characters/);
});

test('source spacing and notation are preserved rather than padded, trimmed, or invented', () => {
  const rows = ['  e|12h14p9--/7\\5--|', ...['B', 'G', 'D', 'A', 'E'].map(s => `  ${s}|---------------|`)];
  assert.ok(rows.every(row => row.length === rows[0].length));
  assert.deepEqual(parseTablature(rows.join('\n'), 6), [rows]);
  assert.deepEqual(createTablatureModel(rows).rows.map(row => row.map(token => token.text).join('')), rows);
});

test('diagnosed six-string fret-12 fixture retains equal source spans and alignment', () => {
  const visible = tokensInGroup(model, { start: 0, end: 9 });
  assert.deepEqual(visible.map(row => row.reduce((width, token) => width + token.end - token.start, 0)), [9, 9, 9, 9, 9, 9]);
  assert.deepEqual(tokenAtColumn(model, 1, 4), { text: '12', kind: 'fret', start: 4, end: 6 });
  assert.equal(tokenAtColumn(model, 0, 6).text, '3');
  assert.equal(tokenAtColumn(model, 1, 6).text, '-');
  assert.equal(tokenAtColumn(model, 1, 5), tokenAtColumn(model, 1, 4));
});

test('five-column boundary extends safely and never splits fret 12', () => {
  assert.deepEqual(createColumnGroups(model, 5), [{ start: 0, end: 6 }, { start: 6, end: 9 }]);
  assert.deepEqual(tokensInGroup(model, createColumnGroups(model, 5)[0])[1].map(token => token.text), ['B', '|', '-', '-', '12']);
});

test('boundary extension checks every string, including chained overlapping frets', () => {
  const overlap = createTablatureModel(['e|--12---|', 'B|---23--|', 'G|----24-|', 'D|-------|']);
  assert.deepEqual(createColumnGroups(overlap, 5), [{ start: 0, end: 8 }, { start: 8, end: 10 }]);
});

test('every group width preserves every token exactly once on every string', () => {
  const sources = [guitar, makeTab('23'), makeTab('24'), ['e|12-34-56|', 'B|-78-90--|', 'G|--1-----|', 'D|--------|']];
  for (const rows of sources) {
    const current = createTablatureModel(rows);
    for (let width = 1; width <= current.width + 2; width++) {
      const groups = createColumnGroups(current, width);
      assert.equal(groups[0].start, 0);
      assert.equal(groups.at(-1).end, current.width);
      for (let i = 1; i < groups.length; i++) assert.equal(groups[i].start, groups[i - 1].end);
      for (let row = 0; row < rows.length; row++) {
        const tokens = groups.flatMap(group => tokensInGroup(current, group)[row]);
        assert.deepEqual(tokens, current.rows[row]);
        assert.equal(tokens.map(token => token.text).join(''), rows[row]);
        for (const group of groups) {
          assert.equal(tokensInGroup(current, group)[row].reduce((sum, t) => sum + t.end - t.start, 0), group.end - group.start);
        }
      }
    }
  }
});

test('group widths are finite and bounded, including stale and invalid values', () => {
  for (const width of [-2, 0, NaN, undefined]) assert.equal(clampGroupWidth(width, 9), 1);
  assert.equal(clampGroupWidth(999, 9), 9);
  assert.equal(clampGroupWidth(Infinity, 9), 9);
  assert.equal(clampGroupWidth('5', 9), 5);
  assert.equal(clampGroupWidth(2.9, 9), 2);
});

test('coordinate navigation wraps rows and atomic notes without compressed-row offsets', () => {
  const group = { start: 0, end: 9 };
  const down = moveGridPosition(model, group, { row: 0, column: 5 }, 'down');
  assert.deepEqual(down, { row: 1, column: 5 });
  assert.equal(tokenAtColumn(model, down.row, down.column).text, '12');
  assert.deepEqual(moveGridPosition(model, group, down, 'up'), { row: 0, column: 5 });
  assert.deepEqual(moveGridPosition(model, group, down, 'right'), { row: 1, column: 6 });
  assert.deepEqual(moveGridPosition(model, group, { row: 1, column: 6 }, 'left'), { row: 1, column: 4 });
  assert.deepEqual(moveGridPosition(model, group, { row: 0, column: 0 }, 'up'), { row: 5, column: 0 });
  assert.deepEqual(moveGridPosition(model, group, { row: 0, column: 0 }, 'left'), { row: 0, column: 8 });
  const last = createColumnGroups(model, 5)[1];
  assert.deepEqual(moveGridPosition(model, last, { row: 1, column: 8 }, 'right'), { row: 1, column: 6 });
});

test('column-major speech reads every fret once without undefined or invented continuation notes', () => {
  const contents = groupSpeech(model, { start: 0, end: 9 });
  assert.equal(contents.filter(text => text === 'String 2, fret 12').length, 1);
  assert.ok(contents.includes('String 1, fret 3'));
  assert.ok(contents.every(text => !text.includes('undefined')));
  const column5 = contents.slice(contents.indexOf('Column 5'), contents.indexOf('Column 6'));
  assert.ok(column5.includes('String 2, fret 12'));
  const column6 = contents.slice(contents.indexOf('Column 6'), contents.indexOf('Column 7'));
  assert.ok(!column6.some(text => text.startsWith('String 2,')));
  for (const width of [1, 5, 9]) {
    const all = createColumnGroups(model, width).flatMap(group => groupSpeech(model, group));
    assert.equal(all.filter(text => text === 'String 2, fret 12').length, 1);
  }
});

function speechHarness() {
  const calls = [], statuses = [];
  let cancellations = 0;
  const synth = { speak: utterance => calls.push(utterance), cancel: () => { cancellations++; } };
  class Utterance { constructor(text) { this.text = text; } }
  return { calls, statuses, player: createSpeechPlayer(synth, Utterance, status => statuses.push(status)), get cancellations() { return cancellations; } };
}

test('speech completes the diagnosed fixture and each utterance has the complete note value', () => {
  const speech = speechHarness();
  const contents = groupSpeech(model, { start: 0, end: 9 });
  speech.player.read(contents);
  for (let i = 0; i < contents.length; i++) {
    assert.equal(speech.calls[i].text, contents[i]);
    speech.calls[i].onend();
  }
  assert.equal(speech.calls.length, contents.length);
  assert.match(speech.statuses.at(-1), /Finished/);
});

test('Escape/cleanup cancellation and repeated read reject late callbacks', () => {
  const speech = speechHarness();
  speech.player.read(['first', 'second']);
  const old = speech.calls[0];
  speech.player.stop();
  old.onend();
  old.onerror();
  assert.equal(speech.calls.length, 1);
  speech.player.read(['new first', 'new second']);
  const superseded = speech.calls[1];
  speech.player.read(['replacement']);
  superseded.onend();
  assert.deepEqual(speech.calls.map(u => u.text), ['first', 'new first', 'replacement']);
  assert.equal(speech.cancellations, 2);
});

test('missing, failing, and interrupted speech is reported without throwing', () => {
  const statuses = [];
  createSpeechPlayer(null, null, status => statuses.push(status)).read(['12']);
  assert.match(statuses[0], /not available/);
  createSpeechPlayer({ speak() { throw new Error('unavailable'); }, cancel() {} }, class {}, status => statuses.push(status)).read(['12']);
  assert.match(statuses.at(-1), /could not start/);
  const speech = speechHarness();
  speech.player.read(['12']);
  speech.calls[0].onerror();
  assert.match(speech.statuses.at(-1), /interrupted/);
});

test('FileReader wrapper preserves valid input and rejects validation, read, and abort failures', async () => {
  const original = globalThis.FileReader;
  try {
    globalThis.FileReader = class { readAsText(file) {
      if (file.fail) this.onerror();
      else if (file.abort) this.onabort();
      else this.onload({ target: { result: file.text } });
    } };
    assert.deepEqual(await parseFile({ text: makeTab('24').join('\n') }, 6), [makeTab('24')]);
    await assert.rejects(parseFile({ text: guitar.slice(0, 5).join('\n') }, 6), /Incomplete/);
    await assert.rejects(parseFile({ fail: true }, 6), /could not be read/);
    await assert.rejects(parseFile({ abort: true }, 6), /canceled/);
  } finally { globalThis.FileReader = original; }
});
