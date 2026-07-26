export const parseTabText = (sourceText, numStrings) => {
  const lines = String(sourceText ?? "").split("\n");
  const tablatureArray = [];
  let subarray = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line) {
      subarray.push(line);

      if (subarray.length === numStrings || i === lines.length - 1) {
        const tablatureLine = subarray.map((subLine) => {
          const chars = subLine.split("");
          const tablatureChars = [];

          for (let j = 0; j < chars.length; j += 1) {
            const char = chars[j];

            if (/[0-9]/.test(char)) {
              let combinedDigits = char;
              let nextChar = chars[j + 1];

              while (/[0-9]/.test(nextChar)) {
                combinedDigits += nextChar;
                j += 1;
                nextChar = chars[j + 1];
              }

              const parsedNumber = Number.parseInt(combinedDigits, 10);
              if (parsedNumber >= 10 && parsedNumber <= 22) {
                tablatureChars.push(parsedNumber.toString());
                continue;
              }
            }
            tablatureChars.push(char);
          }

          return tablatureChars.join("");
        });

        tablatureArray.push(tablatureLine);
        subarray = [];
      }
    }
  }

  return tablatureArray;
};

export const parseFile = async (file, numStrings) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(parseTabText(event.target?.result, numStrings));
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};
