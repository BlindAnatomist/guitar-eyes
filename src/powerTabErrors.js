export class PowerTabImportError extends Error {
  constructor(message, code = "POWERTAB_IMPORT_ERROR") {
    super(message);
    this.name = "PowerTabImportError";
    this.code = code;
  }
}

export function failPowerTab(message, code = "POWERTAB_IMPORT_ERROR") {
  throw new PowerTabImportError(message, code);
}

export class PowerTabBinaryReader {
  constructor(bytes) {
    this.bytes = bytes;
    this.offset = 0;
  }

  take(count, label) {
    if (
      !Number.isInteger(count) ||
      count < 0 ||
      this.offset + count > this.bytes.length
    ) {
      failPowerTab(
        `The PowerTab file ended unexpectedly while reading ${label}.`,
        "TRUNCATED_POWERTAB_LEGACY"
      );
    }
    const value = this.bytes.subarray(this.offset, this.offset + count);
    this.offset += count;
    return value;
  }

  u8(label) {
    return this.take(1, label)[0];
  }

  i8(label) {
    const value = this.u8(label);
    return value > 127 ? value - 256 : value;
  }

  u16(label) {
    const bytes = this.take(2, label);
    return bytes[0] | (bytes[1] << 8);
  }

  u32(label) {
    const bytes = this.take(4, label);
    return (
      bytes[0] |
      (bytes[1] << 8) |
      (bytes[2] << 16) |
      (bytes[3] << 24)
    ) >>> 0;
  }

  i32(label) {
    return this.u32(label) | 0;
  }

  count(label, maximum = 50000) {
    let value = this.u16(label);
    if (value === 0xffff) value = this.u32(label);
    if (value > maximum) {
      failPowerTab(
        `${label} contains ${value} entries; the bounded limit is ${maximum}.`,
        "POWERTAB_LEGACY_COUNT_LIMIT"
      );
    }
    return value;
  }

  string(label) {
    let length = this.u8(`${label} length`);
    if (length === 0xff) {
      length = this.u16(`${label} length`);
      if (length === 0xffff) length = this.u32(`${label} length`);
    }
    if (length > 64 * 1024) {
      failPowerTab(
        `${label} exceeds the bounded string limit.`,
        "POWERTAB_LEGACY_STRING_LIMIT"
      );
    }
    return String.fromCharCode(...this.take(length, label));
  }
}

export class PowerTabMfcClassMap {
  constructor() {
    this.next = 1;
    this.classes = new Map();
  }

  read(reader, expected, context) {
    const tag = reader.u16(`${context} class tag`);
    let name;
    if (tag === 0xffff) {
      if (reader.u16(`${context} class schema`) !== 1) {
        failPowerTab(
          `${context} uses an unsupported MFC class schema.`,
          "UNSUPPORTED_POWERTAB_LEGACY_CLASS_SCHEMA"
        );
      }
      const length = reader.u16(`${context} class name length`);
      if (length < 1 || length > 128) {
        failPowerTab(
          `${context} has an invalid MFC class name.`,
          "INVALID_POWERTAB_LEGACY_CLASS"
        );
      }
      name = String.fromCharCode(
        ...reader.take(length, `${context} class name`)
      );
      this.classes.set(this.next, name);
      this.next += 1;
    } else if ((tag & 0x8000) !== 0) {
      name = this.classes.get(tag & 0x7fff);
      if (!name) {
        failPowerTab(
          `${context} references an unknown MFC class.`,
          "INVALID_POWERTAB_LEGACY_CLASS_REFERENCE"
        );
      }
    } else {
      failPowerTab(
        `${context} uses an unsupported MFC object reference.`,
        "UNSUPPORTED_POWERTAB_LEGACY_OBJECT_REFERENCE"
      );
    }
    this.next += 1;
    if (name !== expected) {
      failPowerTab(
        `${context} uses MFC class ${name}; expected ${expected}.`,
        "UNSUPPORTED_POWERTAB_LEGACY_CLASS"
      );
    }
  }
}
