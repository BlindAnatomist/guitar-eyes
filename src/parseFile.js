import { parseTablature } from "./tablatureModel.js";

export const parseFile = (file, numStrings) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      resolve(parseTablature(event.target.result, numStrings));
    } catch (error) {
      reject(error);
    }
  };
  reader.onerror = () => reject(new Error("The file could not be read. Please choose it again."));
  reader.onabort = () => reject(new Error("Reading the file was canceled."));
  reader.readAsText(file);
});
