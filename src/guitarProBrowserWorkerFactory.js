export function createGuitarProBrowserWorker() {
  return new Worker(new URL("./guitarProImport.worker.js", import.meta.url), {
    type: "module",
    name: "guitar-eyes-gp7-import",
  });
}
