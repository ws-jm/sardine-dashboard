import { isErrorWithESMetaBodyError } from "./error-utils";

test.each([
  ["ErrorWithESMetaBodyError", { meta: { body: { error: "Elasticsearch error message" } } }, true],
  ["Object with message property", { message: "This is a error message" }, false],
])("isErrorWithMessage %s", (_testName, error, expected) => {
  expect(isErrorWithESMetaBodyError(error)).toBe(expected);
});
