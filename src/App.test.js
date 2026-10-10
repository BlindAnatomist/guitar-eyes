import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import DataGrid from './DataGrid';

const rows = ['e|----3-|', 'B|--12--|', 'G|------|', 'D|------|', 'A|------|', 'E|------|'];
const arrows = { ctrlKey: true, altKey: true };
const groups = { ctrlKey: true, metaKey: true, shiftKey: true };
let spoken;
let cancel;

beforeEach(() => {
  spoken = [];
  cancel = jest.fn();
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true, value: { speak: jest.fn(utterance => spoken.push(utterance)), cancel },
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true, value: class { constructor(text) { this.text = text; } },
  });
});

function Grid({ data = rows, columns = 5, multi = true }) {
  const [width, setWidth] = React.useState(columns);
  return <DataGrid data={data} numColumns={width} isMultiColumnNav={multi} setNumColumns={setWidth} />;
}

function upload(text) {
  const file = new File([text], 'tab.txt', { type: 'text/plain' });
  fireEvent.change(screen.getByLabelText(/Upload .txt file/), { target: { files: [file] } });
}

test('application has real controls and a labelled multi-column checkbox', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Guitar Eyes');
  expect(screen.getByLabelText('Multi-Column Navigation')).toHaveAttribute('type', 'checkbox');
  expect(screen.getByLabelText(/Choose Instrument/)).toHaveValue('guitar');
});

test('valid file upload preserves fret 24 and focuses the real grid', async () => {
  render(<App />);
  upload(['e|--24--|', ...rows.slice(1)].join('\n') + '\n');
  const grid = await screen.findByRole('grid', { name: 'Tablature 1' });
  await waitFor(() => expect(grid).toHaveFocus());
  expect(within(grid).getByRole('gridcell', { name: 'String 1, column 5, fret 24' })).toHaveTextContent('24');
  expect(grid).toHaveAttribute('aria-rowcount', '6');
});

test('invalid upload shows an accessible error, clears old data, and allows same-file retry', async () => {
  render(<App />);
  upload(rows.join('\n'));
  await screen.findByRole('grid');
  upload(rows.slice(0, 5).join('\n') + '\n');
  expect(await screen.findByRole('alert')).toHaveTextContent('Incomplete');
  expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  upload(rows.join('\n'));
  expect(await screen.findByRole('grid')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('instrument changes clear loaded rows, and a new bass upload renders four strings', async () => {
  render(<App />);
  upload(rows.join('\n'));
  await screen.findByRole('grid');
  fireEvent.change(screen.getByLabelText(/Choose Instrument/), { target: { value: 'bass' } });
  expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  upload(rows.slice(0, 4).join('\n'));
  expect(await screen.findByRole('grid')).toHaveAttribute('aria-rowcount', '4');
});

test('later uploads and instrument changes invalidate earlier FileReader completions', async () => {
  const OriginalReader = global.FileReader;
  const readers = [];
  global.FileReader = class { constructor() { readers.push(this); } readAsText() {} };
  try {
    render(<App />);
    upload(rows.join('\n'));
    upload(rows.join('\n'));
    await act(async () => { readers[1].onload({ target: { result: ['e|--24--|', ...rows.slice(1)].join('\n') } }); });
    await act(async () => { readers[0].onload({ target: { result: rows.join('\n') } }); });
    expect(screen.getByRole('gridcell', { name: 'String 1, column 5, fret 24' })).toBeInTheDocument();
    upload(rows.join('\n'));
    fireEvent.change(screen.getByLabelText(/Choose Instrument/), { target: { value: 'bass' } });
    await act(async () => { readers[2].onload({ target: { result: rows.join('\n') } }); });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  } finally { global.FileReader = OriginalReader; }
});

test('five-column groups render whole frets and equal source spans on all strings', () => {
  render(<Grid />);
  const note = screen.getByRole('gridcell', { name: 'String 2, column 5, fret 12' });
  expect(note).toHaveAttribute('colspan', '2');
  expect(note).toHaveAttribute('aria-colindex', '5');
  expect(note).toHaveAttribute('aria-colspan', '2');
  for (const row of screen.getAllByRole('row')) {
    expect(within(row).getAllByRole('gridcell').reduce((sum, cell) => sum + cell.colSpan, 0)).toBe(6);
  }
});

test('vertical and horizontal keyboard navigation share source coordinates, including continuation columns', () => {
  render(<Grid columns={9} multi={false} />);
  const start = screen.getByRole('gridcell', { name: 'String 1, column 6, dash' });
  start.focus();
  fireEvent.keyDown(start, { key: 'ArrowDown', ...arrows });
  const note = screen.getByRole('gridcell', { name: 'String 2, column 5, fret 12' });
  expect(note).toHaveFocus();
  fireEvent.keyDown(note, { key: 'ArrowUp', ...arrows });
  expect(start).toHaveFocus();
  fireEvent.keyDown(start, { key: 'ArrowDown', ...arrows });
  fireEvent.keyDown(note, { key: 'ArrowRight', ...arrows });
  expect(screen.getByRole('gridcell', { name: 'String 2, column 7, dash' })).toHaveFocus();
});

test('group navigation updates focus in the new group and wraps from the short last group', () => {
  render(<Grid />);
  const grid = screen.getByRole('grid');
  grid.focus();
  fireEvent.keyDown(grid, { key: 'ArrowRight', ...groups });
  expect(screen.getByRole('gridcell', { name: 'String 1, column 7, fret 3' })).toHaveFocus();
  expect(screen.queryByRole('gridcell', { name: /fret 12/ })).not.toBeInTheDocument();
  fireEvent.keyDown(document.activeElement, { key: 'ArrowRight', ...groups });
  expect(screen.getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
  expect(screen.getByRole('gridcell', { name: /fret 12/ })).toBeInTheDocument();
});

test('width changes and navigation-mode changes reset safely without losing atomic frets', () => {
  const { rerender } = render(<DataGrid data={rows} numColumns={5} isMultiColumnNav setNumColumns={() => {}} />);
  const grid = screen.getByRole('grid');
  grid.focus();
  fireEvent.keyDown(grid, { key: 'ArrowRight', ...groups });
  rerender(<DataGrid data={rows} numColumns={1} isMultiColumnNav setNumColumns={() => {}} />);
  expect(screen.getAllByRole('gridcell')).toHaveLength(6);
  expect(screen.getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
  rerender(<DataGrid data={rows} numColumns={1} isMultiColumnNav={false} setNumColumns={() => {}} />);
  expect(screen.getByRole('gridcell', { name: /fret 12/ })).toHaveTextContent('12');
});

test('read-aloud completes without a split note, and repeated Enter/Escape cancel stale speech', () => {
  render(<Grid columns={9} />);
  const grid = screen.getByRole('grid');
  fireEvent.keyDown(grid, { key: 'Enter' });
  const old = spoken[0];
  fireEvent.keyDown(grid, { key: 'Enter' });
  act(() => old.onend());
  expect(spoken).toHaveLength(2);
  let index = 1;
  act(() => { while (index < spoken.length) spoken[index++].onend(); });
  expect(spoken.filter(utterance => utterance.text === 'String 2, fret 12')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Finished');
  fireEvent.keyDown(grid, { key: 'Enter' });
  const late = spoken[spoken.length - 1];
  const count = spoken.length;
  fireEvent.keyDown(document, { key: 'Escape' });
  act(() => late.onend());
  expect(spoken).toHaveLength(count);
  expect(cancel).toHaveBeenCalledTimes(2);
});

test('group change and unmount cancel speech without leaving live callbacks', () => {
  const { unmount } = render(<Grid />);
  const grid = screen.getByRole('grid');
  fireEvent.keyDown(grid, { key: 'Enter' });
  const old = spoken[0];
  fireEvent.keyDown(grid, { key: 'ArrowRight', ...groups });
  act(() => old.onend());
  expect(spoken).toHaveLength(1);
  fireEvent.keyDown(grid, { key: 'Enter' });
  const current = spoken[1];
  unmount();
  current.onend();
  expect(spoken).toHaveLength(2);
  expect(cancel).toHaveBeenCalledTimes(2);
});

test('Tab and Shift+Tab reach adjacent grids and can return to the controls', async () => {
  render(<App />);
  upload(rows.join('\n') + '\n\n' + rows.join('\n'));
  const first = await screen.findByRole('grid', { name: 'Tablature 1' });
  const second = screen.getByRole('grid', { name: 'Tablature 2' });
  await waitFor(() => expect(first).toHaveFocus());
  fireEvent.keyDown(first, { key: 'ArrowRight', ...arrows });
  expect(within(first).getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
  userEvent.tab();
  expect(second).toHaveFocus();
  userEvent.tab({ shift: true });
  expect(first).toHaveFocus();
  userEvent.tab({ shift: true });
  expect(screen.getByLabelText(/Number of Columns/)).toHaveFocus();
});


test('changing width across the same safe boundary keeps focus and navigation in sync', () => {
  const { rerender } = render(<DataGrid data={rows} numColumns={5} isMultiColumnNav setNumColumns={() => {}} />);
  screen.getByRole('gridcell', { name: 'String 2, column 5, fret 12' }).focus();
  rerender(<DataGrid data={rows} numColumns={6} isMultiColumnNav setNumColumns={() => {}} />);
  expect(screen.getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'ArrowRight', ...arrows });
  expect(screen.getByRole('gridcell', { name: 'String 1, column 2, bar' })).toHaveFocus();
});

test('keyboard width reduction stays bounded and keeps a focused cell', () => {
  render(<Grid columns={2} />);
  const grid = screen.getByRole('grid');
  grid.focus();
  fireEvent.keyDown(grid, { key: 'ArrowRight', ...arrows });
  fireEvent.keyDown(document.activeElement, { key: '-', ...groups });
  expect(screen.getAllByRole('gridcell')).toHaveLength(6);
  expect(screen.getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: '-', ...groups });
  expect(screen.getAllByRole('gridcell')).toHaveLength(6);
});


test('the shifted Mac minus shortcut reduces the group width', () => {
  render(<Grid columns={2} />);
  const grid = screen.getByRole('grid');
  grid.focus();
  fireEvent.keyDown(grid, { key: '_', code: 'Minus', ...groups });
  expect(screen.getAllByRole('gridcell')).toHaveLength(6);
  expect(screen.getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
});


test('width shortcuts on a short block respect the shared dropdown range', async () => {
  render(<App />);
  const shorter = ['e|--0|', 'B|---|', 'G|---|', 'D|---|', 'A|---|', 'E|---|'];
  upload(rows.join('\n') + '\n\n' + shorter.join('\n'));
  await screen.findByRole('grid', { name: 'Tablature 2' });
  fireEvent.click(screen.getByLabelText('Multi-Column Navigation'));
  const width = screen.getByLabelText(/Number of Columns/);
  fireEvent.change(width, { target: { value: '9' } });
  const shortGrid = screen.getByRole('grid', { name: 'Tablature 2' });
  shortGrid.focus();
  fireEvent.keyDown(shortGrid, { key: '+', ...groups });
  expect(width).toHaveValue('9');
  fireEvent.keyDown(shortGrid, { key: '_', ...groups });
  expect(width).toHaveValue('8');
  expect(within(shortGrid).getByRole('gridcell', { name: 'String 1, column 1, e' })).toHaveFocus();
});
