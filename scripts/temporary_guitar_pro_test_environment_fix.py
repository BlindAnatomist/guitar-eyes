from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    assert count == 1, (label, count)
    return text.replace(old, new, 1)


path = "src/guitarProArchiveVersion.test.js"
text = read(path)
text = replace_once(
    text,
    'import path from "path";\n',
    'import path from "path";\nimport { TextDecoder } from "util";\n',
    "archive test TextDecoder import",
)
text = replace_once(
    text,
    'function fixture(name) {\n',
    'beforeAll(() => {\n  if (typeof global.TextDecoder === "undefined") {\n    global.TextDecoder = TextDecoder;\n  }\n});\n\nfunction fixture(name) {\n',
    "archive test TextDecoder installation",
)
write(path, text)

path = "src/guitarProBinaryProof.test.js"
text = read(path)
text = replace_once(
    text,
    'import { TextDecoder, TextEncoder } from "util";\n',
    'import { TextDecoder, TextEncoder } from "util";\nimport { inflateRawSync } from "zlib";\n',
    "binary test inflater import",
)
text = replace_once(
    text,
    '\n\nbeforeAll(() => {\n',
    '\n\nasync function inflateRaw(bytes) {\n  return new Uint8Array(inflateRawSync(Buffer.from(bytes)));\n}\n\nbeforeAll(() => {\n',
    "binary test inflater helper",
)
text = replace_once(
    text,
    '    const versionEvidence = await inspectGuitarProArchiveVersion(new Uint8Array(bytes));',
    '    const versionEvidence = await inspectGuitarProArchiveVersion(\n      new Uint8Array(bytes),\n      { inflateRaw }\n    );',
    "binary test inflater injection",
)
write(path, text)

print("Guitar Pro archive test environment fixed")
