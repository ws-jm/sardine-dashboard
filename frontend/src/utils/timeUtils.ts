import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { TimeUnit, TIME_UNITS, DateFormat, DATE_FORMATS, TimezoneType, TIMEZONE_TYPES } from "../constants";

dayjs.extend(utc);
dayjs.extend(LocalizedFormat);

// Returns the sorted array of date strings.
// Mutate the original array of date strings.
export const sortDates = (dates: string[], options?: { order?: "ASC" | "DESC"; format?: DateFormat }): string[] => {
  let format: string = DATE_FORMATS.DATE;
  if (options?.format) {
    format = options.format;
  }
  return dates.sort(
    (dateStringA, dateStringB) =>
      (dayjs(dateStringA, format).isAfter(dayjs(dateStringB, format)) ? 1 : -1) * (options?.order === "DESC" ? -1 : 1)
  );
};

export const formatTimestampInUtc = (timestamp: number, options: { unit: TimeUnit; format: DateFormat }): string => {
  const { format } = options;
  const divisor = { [TIME_UNITS.MILLISECOND]: 1000, [TIME_UNITS.SECOND]: 1 }[options.unit];
  return dayjs
    .unix(timestamp / divisor)
    .utc()
    .format(format);
};

// It computes the ISO date string in UTC from the timestamp.
export const timestampToISODateIfZeroEmptyString = (timestamp: number): string => {
  if (timestamp === 0) {
    return "";
  }
  return formatTimestampInUtc(timestamp, { unit: TIME_UNITS.SECOND, format: DATE_FORMATS.DATE });
};

export const datetimeToTimestamp = (
  datetime: string,
  options: { unit: TimeUnit; format: DateFormat; parseTimezone: TimezoneType }
): number => {
  const { format, unit, parseTimezone } = options;
  const parse = {
    [TIMEZONE_TYPES.LOCAL]: () => dayjs(datetime, format),
    [TIMEZONE_TYPES.UTC]: () => dayjs.utc(datetime, format),
  }[parseTimezone];
  const display = {
    [TIME_UNITS.MILLISECOND]: (djs: dayjs.Dayjs) => djs.valueOf(),
    [TIME_UNITS.SECOND]: (djs: dayjs.Dayjs) => djs.unix(),
  }[unit];

  return display(parse());
};
