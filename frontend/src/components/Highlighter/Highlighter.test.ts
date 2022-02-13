import { findAll } from "./utils";

describe("findAll", () => {
  it("Should match and ignore Diacritics when ignoreTextDiacritics = true", () => {
    const rawChunks = findAll({
      searchWords: ["Nghĩa"],
      textToHighlight: "Nghia",
      ignoreTextDiacritics: true,
    });
    expect(rawChunks).toEqual([{ start: 0, end: 5, highlight: true }]);
  });
  it("Should not match Diacritics when ignoreTextDiacritics = false", () => {
    const rawChunks = findAll({
      searchWords: ["Nghĩa"],
      textToHighlight: "Nghia",
      ignoreTextDiacritics: false,
    });
    expect(rawChunks).toEqual([{ start: 0, end: 5, highlight: false }]);
  });

  it("should handle empty or null textToHighlight", () => {
    const result = findAll({
      searchWords: ["search"],
      textToHighlight: "",
    });
    expect(result.length).toEqual(0);
  });

  it("should highlight all occurrences of a word", () => {
    const rawChunks = findAll({
      searchWords: ["This", "Th", "is"],
      textToHighlight: "This is a string with words to search and This.",
    });

    expect(rawChunks).toEqual([
      // This
      { start: 0, end: 4, highlight: true },
      { start: 4, end: 5, highlight: false },
      // is
      { start: 5, end: 7, highlight: true },
      { start: 7, end: 42, highlight: false },
      // This
      { start: 42, end: 46, highlight: true },
      { start: 46, end: 47, highlight: false },
    ]);
  });
});
