// Columns always refer to the original text, including labels and bar lines.
// A fret is one token with a source span, never two independently navigable digits.
export function tokenizeRow(source) {
  if (typeof source !== "string" || source.length === 0) {
    throw new Error("Each tablature row must contain text.");
  }
  if (Array.from(source).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
    throw new Error("Tablature rows cannot contain tabs or control characters. Use spaces for alignment.");
  }
  const tokens = [];
  for (let start = 0; start < source.length;) {
    let end = start + 1;
    const isFret = /[0-9]/.test(source[start]);
    if (isFret) {
      while (end < source.length && /[0-9]/.test(source[end])) end++;
      if (end - start > 2) {
        throw new Error(`Fret "${source.slice(start, end)}" at column ${start + 1} has more than two digits. Separate distinct frets explicitly.`);
      }
    }
    tokens.push({ text: source.slice(start, end), kind: isFret ? "fret" : "symbol", start, end });
    start = end;
  }
  return tokens;
}

export function createTablatureModel(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("A tablature block must contain rows.");
  }
  const tokens = rows.map(tokenizeRow);
  const width = rows[0].length;
  if (rows.some(row => row.length !== width)) {
    throw new Error("Rows in each tablature block must have the same number of text columns. Check the source alignment.");
  }
  return { rows: tokens, width };
}

export function parseTablature(text, numStrings) {
  if (numStrings !== 4 && numStrings !== 6) {
    throw new Error("Choose a four-string bass or six-string guitar.");
  }
  if (typeof text !== "string") throw new Error("The file could not be read as text.");
  const blocks = [];
  let block = [];
  // Remove only a UTF-8 BOM and line endings, never spacing within a row.
  const lines = text.replace(/^\uFEFF/, "").split(/\r\n|\n|\r/);
  lines.forEach((line, index) => {
    if (line.trim() === "") {
      if (block.length) {
        throw new Error(`Incomplete tablature block before line ${index + 1}: expected ${numStrings} rows, found ${block.length}.`);
      }
      return;
    }
    // Accept labelled or unlabelled plain-text tab rows; reject prose instead of
    // accidentally treating titles and instructions as additional strings.
    if (!/^ *(?:[A-Ga-g](?:#|b)? *)?[|:-]/.test(line)) {
      throw new Error(`Line ${index + 1} is not a supported tablature row. Use plain-text tab rows without titles or comments.`);
    }
    block.push(line);
    if (block.length === numStrings) {
      createTablatureModel(block); // Validate without rewriting the source.
      blocks.push(block);
      block = [];
    }
  });
  if (block.length) {
    throw new Error(`Incomplete tablature block: expected ${numStrings} rows, found ${block.length}.`);
  }
  if (blocks.length === 0) throw new Error("The file contains no tablature rows.");
  return blocks;
}

export function clampGroupWidth(requested, width) {
  return Math.min(width, Math.max(1, Math.trunc(Number(requested)) || 1));
}

export function createColumnGroups(model, requestedWidth) {
  const size = clampGroupWidth(requestedWidth, model.width);
  const groups = [];
  for (let start = 0; start < model.width;) {
    let end = Math.min(start + size, model.width);
    // A boundary must not cut a token on ANY string. Extending the boundary can
    // intersect a fret on another row, so repeat until the boundary is safe.
    let nextEnd;
    do {
      nextEnd = end;
      for (const row of model.rows) {
        for (const token of row) {
          if (token.start < end && token.end > end) nextEnd = Math.max(nextEnd, token.end);
        }
      }
      if (nextEnd === end) break;
      end = nextEnd;
    } while (end < model.width);
    groups.push({ start, end });
    start = end;
  }
  return groups;
}

export function tokensInGroup(model, group) {
  return model.rows.map(row => row.filter(token => token.start >= group.start && token.end <= group.end));
}

export function tokenAtColumn(model, row, column) {
  return model.rows[row]?.find(token => token.start <= column && token.end > column);
}

export function moveGridPosition(model, group, position, direction) {
  const row = Math.max(0, Math.min(model.rows.length - 1, position.row));
  const column = Math.max(group.start, Math.min(group.end - 1, position.column));
  if (direction === "up" || direction === "down") {
    const offset = direction === "up" ? -1 : 1;
    return { row: (row + offset + model.rows.length) % model.rows.length, column };
  }
  const visible = tokensInGroup(model, group)[row];
  const index = visible.findIndex(token => token.start <= column && token.end > column);
  const offset = direction === "left" ? -1 : 1;
  return { row, column: visible[(index + offset + visible.length) % visible.length].start };
}

export function describeToken(token) {
  if (token.kind === "fret") return `fret ${token.text}`;
  return ({ "-": "dash", "|": "bar", " ": "space" })[token.text] || token.text;
}

export function groupSpeech(model, group) {
  const contents = [];
  for (let column = group.start; column < group.end; column++) {
    const startingTokens = model.rows.map(row => row.find(token => token.start === column));
    if (!startingTokens.some(Boolean)) continue;
    contents.push(`Column ${column + 1}`);
    startingTokens.forEach((token, row) => {
      // A continuation is not a second note or a rest. Read each token once.
      if (token) contents.push(`String ${row + 1}, ${describeToken(token)}`);
    });
  }
  return contents;
}
