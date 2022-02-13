import { randomId, getCustomerIdFromUserIdHash } from "./idUtils";

test.each([["Different values", ["abc", "abc"]]])("randomId %s", (_testName, prefixes) => {
  expect(randomId(prefixes[0])).not.toEqual(randomId(prefixes[1]));
});

test.each([["Valid user ID hash", "14dd4620-3165-49d0-99ff-a4359ddfc3a7", "14dd4620"]])(
  "getCustomerIdFromUserIdHash %s",
  (_testName, arg, expected) => {
    expect(getCustomerIdFromUserIdHash(arg)).toEqual(expected);
  }
);
