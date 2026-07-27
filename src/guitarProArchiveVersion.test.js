import fs from "fs";
import path from "path";
import { TextDecoder } from "util";
import { deflateRawSync, inflateRawSync } from "zlib";
import {
  GUITAR_PRO_ARCHIVE_LIMITS,
  GuitarProArchiveError,
  inspectGuitarProArchiveVersion,
} from "./guitarProArchiveVersion";

beforeAll(() => {
  if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder;
  }
});

function fixture(name) {
  return fs.readFileSync(
    path.join(process.cwd(), "fixtures", "real-world", name)
  );
}

async function inflateRaw(bytes) {
  return new Uint8Array(inflateRawSync(Buffer.from(bytes)));
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function buildZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  entries.forEach((entry) => {
    const name = Buffer.from(entry.name, "utf8");
    const source = Buffer.from(entry.content, "utf8");
    const method = entry.method ?? 8;
    const compressed = method === 0 ? source : deflateRawSync(source);
    const flags = entry.flags ?? 0;
    const declaredUncompressedSize =
      entry.declaredUncompressedSize ?? source.length;

    const local = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(flags),
      uint16(method),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(compressed.length),
      uint32(declaredUncompressedSize),
      uint16(name.length),
      uint16(0),
      name,
      compressed,
    ]);
    localParts.push(local);

    const central = Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(flags),
      uint16(method),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(compressed.length),
      uint32(declaredUncompressedSize),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(localOffset),
      name,
    ]);
    centralParts.push(central);
    localOffset += local.length;
  });

  const central = Buffer.concat(centralParts);
  const eocd = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(central.length),
    uint32(localOffset),
    uint16(0),
  ]);

  return new Uint8Array(Buffer.concat([...localParts, central, eocd]));
}

function gpif(gpVersion = "8.1.3", encoding = "GP8") {
  return `<GPIF><GPVersion>${gpVersion}</GPVersion><Encoding><EncodingDescription>${encoding}</EncodingDescription></Encoding></GPIF>`;
}

function archive({
  rootVersion = "7.0",
  gpVersion = "8.1.3",
  encoding = "GP8",
  extras = [],
  method = 8,
} = {}) {
  return buildZip([
    { name: "VERSION", content: rootVersion, method },
    {
      name: "Content/score.gpif",
      content: gpif(gpVersion, encoding),
      method,
    },
    ...extras,
  ]);
}

function expectArchiveCode(promise, code) {
  return promise.catch((error) => {
    expect(error).toBeInstanceOf(GuitarProArchiveError);
    expect(error.code).toBe(code);
  });
}

describe("inspectGuitarProArchiveVersion", () => {
  test("identifies the generated project fixture as GP8 semantic evidence inside the shared 7.0 archive", async () => {
    const result = await inspectGuitarProArchiveVersion(
      fixture("guitar-pro-shared-archive-proof.gp"),
      { inflateRaw }
    );

    expect(result).toEqual({
      schemaVersion: 1,
      archiveFamily: "GUITAR_PRO_SHARED_ZIP",
      rootVersion: "7.0",
      gpVersion: "8.1.3",
      encodingDescription: "GP8",
      sourceVersion: "GP8",
      entryCount: 6,
    });
  });

  test("accepts matching GP7 and GP8 semantic evidence", async () => {
    await expect(
      inspectGuitarProArchiveVersion(
        archive({ gpVersion: "7.5.0", encoding: "GP7" }),
        { inflateRaw }
      )
    ).resolves.toMatchObject({ sourceVersion: "GP7" });

    await expect(
      inspectGuitarProArchiveVersion(
        archive({ gpVersion: "8.1.3", encoding: "GP8" }),
        { inflateRaw }
      )
    ).resolves.toMatchObject({ sourceVersion: "GP8" });
  });

  test("supports stored evidence entries as well as raw DEFLATE", async () => {
    const result = await inspectGuitarProArchiveVersion(
      archive({ method: 0 }),
      { inflateRaw: jest.fn() }
    );

    expect(result.sourceVersion).toBe("GP8");
  });

  test("rejects contradictory GPIF evidence", async () => {
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        archive({ gpVersion: "8.1.3", encoding: "GP7" }),
        { inflateRaw }
      ),
      "CONTRADICTORY_GUITAR_PRO_VERSION_EVIDENCE"
    );
  });

  test("rejects missing or malformed version evidence", async () => {
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        buildZip([{ name: "Content/score.gpif", content: gpif() }]),
        { inflateRaw }
      ),
      "MISSING_GUITAR_PRO_VERSION_EVIDENCE"
    );

    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        buildZip([
          { name: "VERSION", content: "7.0" },
          { name: "Content/score.gpif", content: "<GPIF></GPIF>" },
        ]),
        { inflateRaw }
      ),
      "MISSING_GUITAR_PRO_VERSION_EVIDENCE"
    );
  });

  test("rejects duplicate version entries", async () => {
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        buildZip([
          { name: "VERSION", content: "7.0" },
          { name: "VERSION", content: "7.0" },
          { name: "Content/score.gpif", content: gpif() },
        ]),
        { inflateRaw }
      ),
      "DUPLICATE_GUITAR_PRO_VERSION_EVIDENCE"
    );
  });

  test("rejects an unsupported archive family and untested semantic major", async () => {
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        archive({ rootVersion: "6.0" }),
        { inflateRaw }
      ),
      "UNSUPPORTED_GUITAR_PRO_ARCHIVE_FAMILY"
    );

    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        archive({ gpVersion: "9.0", encoding: "GP9" }),
        { inflateRaw }
      ),
      "UNTESTED_GUITAR_PRO_VERSION"
    );
  });

  test("rejects encryption and unsupported compression methods", async () => {
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        buildZip([
          { name: "VERSION", content: "7.0", flags: 1 },
          { name: "Content/score.gpif", content: gpif() },
        ]),
        { inflateRaw }
      ),
      "ENCRYPTED_GUITAR_PRO_ARCHIVE"
    );

    await expectArchiveCode(
      inspectGuitarProArchiveVersion(
        buildZip([
          { name: "VERSION", content: "7.0", method: 12 },
          { name: "Content/score.gpif", content: gpif() },
        ]),
        { inflateRaw }
      ),
      "UNSUPPORTED_GUITAR_PRO_ZIP_COMPRESSION"
    );
  });

  test("rejects declared expansion beyond the GPIF limit before decompression", async () => {
    const bytes = buildZip([
      { name: "VERSION", content: "7.0" },
      {
        name: "Content/score.gpif",
        content: gpif(),
        declaredUncompressedSize: GUITAR_PRO_ARCHIVE_LIMITS.maxGpifBytes + 1,
      },
    ]);

    await expectArchiveCode(
      inspectGuitarProArchiveVersion(bytes, { inflateRaw }),
      "GUITAR_PRO_ARCHIVE_EXPANSION_LIMIT"
    );
  });

  test("rejects malformed and truncated ZIP data", async () => {
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(new Uint8Array([1, 2, 3]), {
        inflateRaw,
      }),
      "MALFORMED_GUITAR_PRO_ARCHIVE"
    );

    const valid = archive();
    await expectArchiveCode(
      inspectGuitarProArchiveVersion(valid.subarray(0, valid.length - 5), {
        inflateRaw,
      }),
      "INVALID_GUITAR_PRO_ZIP"
    );
  });
});
