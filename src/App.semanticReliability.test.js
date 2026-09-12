import fs from "fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const xml = fs.readFileSync("fixtures/real-world/musicxml-minimal-guitar-tab.musicxml", "utf8");
const originalMedia = window.matchMedia;
afterEach(() => { window.matchMedia = originalMedia; delete window.GUITAR_EYES_FORMAT_ONLY; });

test.each(["iphone", "desktop"])("%s rejects contradictory timing and recovers to the same valid instructions", async (mode) => {
  window.matchMedia = jest.fn().mockReturnValue({matches:mode === "iphone", addListener(){}, removeListener(){}});
  window.GUITAR_EYES_FORMAT_ONLY = true;
  render(<App/>);
  const upload = screen.getByLabelText("Upload tablature file:");
  expect(upload).not.toHaveAttribute("accept");
  fireEvent.change(upload, {target:{files:[new File([xml.replace('<type>quarter</type>','<type>half</type>')], 'contradictory.musicxml')]}});
  expect(await screen.findByText(/contradictory notated and elapsed duration evidence/)).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Read current position'})).not.toBeInTheDocument();
  fireEvent.change(upload, {target:{files:[new File([xml], 'valid.musicxml')]}});
  const heading = await screen.findByRole('heading',{name:mode === 'iphone' ? 'iPhone tablature reader' : 'Desktop tablature reader'});
  fireEvent.focus(window);
  await waitFor(() => expect(document.activeElement).toBe(heading));
  fireEvent.click(screen.getByRole('button',{name:'Read current position'}));
  const speech = document.querySelector('[aria-live="polite"].visually-hidden');
  expect(speech).toHaveTextContent('Duration, quarter note. Low E string, fret 3.');
  expect(screen.queryByRole('button',{name:/audition/i})).not.toBeInTheDocument();
});
