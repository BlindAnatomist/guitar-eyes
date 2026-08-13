export class PowerTabImportError extends Error {
  constructor(message, code = "POWERTAB_IMPORT_ERROR") {
    super(message);
    this.name = "PowerTabImportError";
    this.code = code;
  }
}
