/** @jest-environment node */
import { renderToStaticMarkup } from "react-dom/server.node";
import IPhoneTabReader from "./IPhoneTabReader";
import { parseSixStringTabText } from "./iphoneTabModel";

jest.mock("./positionSoundEvents", () => ({ buildPositionSoundEvents: jest.fn() }));
jest.mock("./proceduralPluckedString", () => ({ createPositionAuditioner: jest.fn() }));

// React server rendering returns a string, not a Testing Library render result.
/* eslint-disable testing-library/render-result-naming-convention */

test("a no-window entry point renders semantic navigation without historical audio", () => {
  expect(typeof window).toBe("undefined");
  const document = parseSixStringTabText("e|--0--|\nB|-----|\nG|-----|\nD|-----|\nA|-----|\nE|-----|");
  const html = renderToStaticMarkup(<IPhoneTabReader document={document} />);
  expect(html).toContain("Previous position");
  expect(html).toContain("Read current position");
  expect(html).toContain("Next position");
  expect(html).toContain("Mark current position");
  expect(html).toContain("High E string, open.");
  expect(html).not.toMatch(/Audition current position|Sound delay|Position audio|audition-status|audible-proof-label|guitar sound begins/);
});
