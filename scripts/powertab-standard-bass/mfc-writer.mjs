export class Writer {
  constructor() {
    this.parts = [];
    this.classIndices = new Map();
    this.mapCount = 1;
  }
  push(buffer) { this.parts.push(buffer); }
  u8(value) { const b = Buffer.alloc(1); b.writeUInt8(value & 0xff); this.push(b); }
  i8(value) { const b = Buffer.alloc(1); b.writeInt8(value); this.push(b); }
  u16(value) { const b = Buffer.alloc(2); b.writeUInt16LE(value & 0xffff); this.push(b); }
  u32(value) { const b = Buffer.alloc(4); b.writeUInt32LE(value >>> 0); this.push(b); }
  i32(value) { const b = Buffer.alloc(4); b.writeInt32LE(value); this.push(b); }
  bool(value) { this.u8(value ? 1 : 0); }
  raw(buffer) { this.push(Buffer.from(buffer)); }
  mfcString(value) {
    const raw = Buffer.from(value, "latin1");
    if (raw.length < 0xff) this.u8(raw.length);
    else if (raw.length < 0xffff) { this.u8(0xff); this.u16(raw.length); }
    else { this.u8(0xff); this.u16(0xffff); this.u32(raw.length); }
    this.raw(raw);
  }
  count(value) {
    if (value < 0xffff) this.u16(value);
    else { this.u16(0xffff); this.u32(value); }
  }
  objectPrefix(className, schema = 1) {
    if (this.classIndices.has(className)) {
      this.u16(0x8000 | this.classIndices.get(className));
    } else {
      this.u16(0xffff);
      this.u16(schema);
      const raw = Buffer.from(className, "ascii");
      this.u16(raw.length);
      this.raw(raw);
      this.classIndices.set(className, this.mapCount);
      this.mapCount += 1;
    }
    this.mapCount += 1;
  }
  finish() { return Buffer.concat(this.parts); }
}
