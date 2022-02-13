import { getCustomerProfilePath } from "./pathUtils";

test.each([
  [
    "Returns expected",
    { clientId: "someclientid", customerId: "somecustomerid" },
    "/customer-profile?customerId=somecustomerid&clientId=someclientid",
  ],
])("getCustomerProfilePath %s", (_testName, fields, expected) => {
  expect(getCustomerProfilePath(fields)).toStrictEqual(expected);
});
