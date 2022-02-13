import { replaceAll } from "./stringUtils";
import "core-js/features/string/replace-all";

test.each([
  ["abcxdef", "x", "y", "abcydef"],
  ["abc(def", "(", "", "abcdef"],
  ["abc def", " ", "", "abcdef"],
  ["abc[def", "[", "", "abcdef"],
  ["abc]def", "]", "", "abcdef"],
])("stringAll text:`%s` before:`%s` after:`%s` result:`%s`", (text, before, after, result) => {
  expect(replaceAll(text, before, after)).toBe(result);
});
