import fs from "fs";
import path from "path";
import {
  isJasonPlaygroundRequested,
  JASON_PLAYGROUND_SOURCE,
} from "./jasonPlayground";
import { buildReaderDocuments } from "./tabImportCoordinator";

describe("Jason playground source", () => {
  test("keeps the bundled source identical to its lawful repository fixture", () => {
    const fixture = fs.readFileSync(
      path.join(
        process.cwd(),
        "fixtures",
        "jason-playground",
        "jason-playground-cadence.txt"
      ),
      "utf8"
    );

    expect(`${JASON_PLAYGROUND_SOURCE}\n`).toBe(fixture);
  });

  test("normalizes the cadence through the accepted shared semantic document", () => {
    const result = buildReaderDocuments(JASON_PLAYGROUND_SOURCE, "guitar");

    expect(result.supportOutcome).toBe("supported");
    expect(result.semanticDocument.instrument).toBe("guitar");
    expect(result.semanticDocument.positions).toHaveLength(7);
    expect(result.semanticDocument.blocks).toHaveLength(1);
    expect(result.semanticDocument.positions[0].measureNumber).toBe(1);
    expect(result.semanticDocument.positions[4].measureNumber).toBe(2);
    expect(result.semanticDocument.positions[0].duration.name).toBe("quarter note");
    expect(result.semanticDocument.positions[6].duration.name).toBe("half note");
  });

  test("accepts the old bare demo link and the named Jason link only", () => {
    expect(isJasonPlaygroundRequested("?demo")).toBe(true);
    expect(isJasonPlaygroundRequested("?demo=jason")).toBe(true);
    expect(isJasonPlaygroundRequested("?demo=other")).toBe(false);
    expect(isJasonPlaygroundRequested("")).toBe(false);
  });
});
