import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { buildStructuredTabReaderDocuments } from "./structuredTabReaderDocuments";
import { buildReaderDocuments } from "./tabImportCoordinator";

jest.mock("./structuredTabReaderDocuments", () => ({ buildStructuredTabReaderDocuments: jest.fn() }));
const originalMedia = window.matchMedia;
const source = 'e|--3--|\nB|-----|\nG|-----|\nD|-----|\nA|-----|\nE|-----|';
const labels = { iphone: 'iPhone semantic reader', desktop: 'Desktop grid reader' };
function start(mode) {
  window.matchMedia = jest.fn().mockReturnValue({ matches: mode === 'iphone', addListener(){}, removeListener(){} });
  render(<App/>);
}
async function settle() {
  await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 50)); });
}
afterEach(() => { window.matchMedia = originalMedia; jest.clearAllMocks(); });

test.each([['iphone','desktop'],['desktop','iphone']])('documents stale mode after delayed successful import: %s to %s', async (from,to) => {
  let finish;
  buildStructuredTabReaderDocuments.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  start(from);
  fireEvent.change(screen.getByLabelText('Upload tablature file:'), {target:{files:[new File(['x'],'delayed.gp5')]}});
  const modeControl = screen.getByLabelText(labels[to]);
  modeControl.focus(); fireEvent.click(modeControl);
  await act(async () => { finish(buildReaderDocuments(source)); });
  fireEvent.focus(window);
  await settle();
  const heading = screen.getByRole('heading',{name:to === 'iphone' ? 'iPhone tablature reader' : 'Desktop tablature reader'});
  expect(heading).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`Loaded 1 synchronized positions in ${from === 'iphone' ? 'iPhone reading' : 'desktop semantic reader'} mode`))).toBeInTheDocument();
  expect(document.activeElement).not.toBe(heading);
});

test('iPhone to desktop during delayed selection inventory strands the selection focus request', async () => {
  let finish;
  buildStructuredTabReaderDocuments.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  start('iphone');
  fireEvent.change(screen.getByLabelText('Upload tablature file:'), {target:{files:[new File(['x'],'selection.gp5')]}});
  const modeControl = screen.getByLabelText(labels.desktop);
  modeControl.focus(); fireEvent.click(modeControl);
  const items = [0,1].map((index) => ({id:`track-${index}`,trackIndex:index,staffIndex:0,supported:true,selectionLabel:`Guitar ${index+1}`}));
  await act(async () => { finish({requiresTrackSelection:true, sourceFormatLabel:'Guitar Pro 5 tablature', sourceFormat:'guitar-pro', selectionIntermediate:{},trackInventory:{supportedCount:2,supportedItems:items,items}}); });
  fireEvent.focus(window); await settle();
  const heading = screen.getByRole('heading',{name:'Choose a Guitar Pro track'});
  expect(heading).toBeInTheDocument();
  expect(document.activeElement).not.toBe(heading);
  expect(screen.getByRole('button',{name:'Load selected track'})).toBeDisabled();
});
