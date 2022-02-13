import { isErrorWithMessage } from "./errorUtils";

test.each([
  ["Native Error object", new Error("test"), true],
  ["Object with message property", { message: "This is a error message" }, true],
  ["undefined", undefined, false],
  ["null", null, false],
  ["String", "Error", false],
  ["NaN", NaN, false],
])("isErrorWithMessage %s", (_testName, error, expected) => {
  expect(isErrorWithMessage(error)).toBe(expected);
});
