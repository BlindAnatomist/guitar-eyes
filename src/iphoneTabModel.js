// Compatibility facade retained for existing imports. The authoritative parser and
// semantic model now live in tablatureModel.js and power both desktop and iPhone modes.
export {
  compactStringState,
  describePosition,
  describeStringState,
  parseSixStringTabText,
  parseTabText,
  readTextFile,
  TabParseError,
} from "./tablatureModel";
