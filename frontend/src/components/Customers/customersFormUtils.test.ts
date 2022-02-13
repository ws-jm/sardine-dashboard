import { convertFieldsToBlockAllowList } from "./customersFormUtils";

test.each([
  ["Email", [["email_address", "test@example.com"]] as [string, string][], [{ type: "email", value: "test@example.com" }]],
  [
    "Email, user_id, and another type",
    [
      ["email_address", "someone@sardine.ai"],
      ["customer_id", "somecustomerid"],
      ["something", "somevalue"],
    ] as [string, string][],
    [
      { type: "email", value: "someone@sardine.ai" },
      { type: "user_id", value: "somecustomerid" },
      { type: "something", value: "somevalue" },
    ],
  ],
  [
    "Emails separated by commas",
    [["email_address", "a@sardine.ai, b@sardine.ai, c@sardine.ai"]] as [string, string][],
    [
      { type: "email", value: "a@sardine.ai" },
      { type: "email", value: "b@sardine.ai" },
      { type: "email", value: "c@sardine.ai" },
    ],
  ],
])("convertFieldsToBlockAllowList %s", (_testName, fields, expected) => {
  expect(convertFieldsToBlockAllowList(fields)).toStrictEqual(expected);
});
