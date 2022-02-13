import timezoneMock from "timezone-mock";
import { sortDates, timestampToISODateIfZeroEmptyString, formatTimestampInUtc } from "./timeUtils";
import { DATE_FORMATS, TIME_UNITS } from "../constants";

test.each([
  ["Default", ["2015-03-29", "1987-12-03"], ["1987-12-03", "2015-03-29"], {}],
  ["DESC", ["1600-01-01", "2001-12-30"], ["2001-12-30", "1600-01-01"], { order: "DESC" as const }],
  [
    "DATETIME_FORMAT",
    ["2015-03-29 15:03:19", "1987-12-03 01:54:19"],
    ["1987-12-03 01:54:19", "2015-03-29 15:03:19"],
    { format: DATE_FORMATS.DATETIME },
  ],
])("sortDates %s dates: %s result: %s", (_testCase, dates, result, options) => {
  expect(sortDates(dates, options)).toStrictEqual(result);
});

test.each([
  ["US/Pacific" as const, 1641361875, { format: DATE_FORMATS.DATE, unit: TIME_UNITS.SECOND }, "2022-01-05"],
  ["US/Eastern" as const, 1641361875, { format: DATE_FORMATS.DATE, unit: TIME_UNITS.SECOND }, "2022-01-05"],
  ["Brazil/East" as const, 1641361875, { format: DATE_FORMATS.DATE, unit: TIME_UNITS.SECOND }, "2022-01-05"],
  ["UTC" as const, 1641361875, { format: DATE_FORMATS.DATE, unit: TIME_UNITS.SECOND }, "2022-01-05"],
  ["Europe/London" as const, 1641361875, { format: DATE_FORMATS.DATE, unit: TIME_UNITS.SECOND }, "2022-01-05"],
  ["Australia/Adelaide" as const, 1641361875, { format: DATE_FORMATS.DATE, unit: TIME_UNITS.SECOND }, "2022-01-05"],
  ["UTC" as const, 1641361875123, { format: DATE_FORMATS.LLL, unit: TIME_UNITS.MILLISECOND }, "January 5, 2022 5:51 AM"],
])("formatTimestampInUtc timezone: %s timestamp: %d options: %s result: %s", (timezone, timestamp, options, result) => {
  timezoneMock.register(timezone);
  expect(formatTimestampInUtc(timestamp, options)).toStrictEqual(result);
});

test.each([
  ["UTC" as const, 1641361875, "2022-01-05"],
  ["UTC" as const, 0, ""],
])("timestampToISODate: %s timestamp: %d result: %s", (_timezone, timestamp, result) => {
  expect(timestampToISODateIfZeroEmptyString(timestamp)).toStrictEqual(result);
});
