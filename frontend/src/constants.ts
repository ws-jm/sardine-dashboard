// Never import moment and dayjs.
// This file should contain constants only.
import { SARDINE_ADMIN, MULTI_ORG_ADMIN } from "sardine-dashboard-typescript-definitions";

export const CHECKPOINT_QUERY_FIELD = "checkpoint";
export const ORGANIZATION_QUERY_FIELD = "organization";
const ADMIN_ROLES = [SARDINE_ADMIN, MULTI_ORG_ADMIN];

export const DATE_FORMATS = {
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  DATE: "YYYY-MM-DD",
  LLL: "LLL",
} as const;
export type DateFormat = typeof DATE_FORMATS[keyof typeof DATE_FORMATS];

export const TIMEZONE_TYPES = {
  UTC: "UTC",
  LOCAL: "LOCAL",
} as const;
export type TimezoneType = typeof TIMEZONE_TYPES[keyof typeof TIMEZONE_TYPES];

export const TIME_UNITS = {
  SECOND: "second",
  MILLISECOND: " millisecond",
} as const;
export type TimeUnit = typeof TIME_UNITS[keyof typeof TIME_UNITS];

export const CACHE_KEYS = {
  DEVICE_PROFILE: "deviceProfile",
  ORGANIZATION_NAMES: "organizationNames",
  RULES: "rules",
  CLIENT_ID: "clientId",
  LAT_LNG: "latLng",
} as const;

export const QUERY_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
  SUCCESS: "success",
} as const;

export const GOOGLE_STREET_VIEW_PANORAMA_OPTIONS = {
  pov: { heading: 165, pitch: 0 },
  motionTracking: false,
} as const;

export const GOOGLE_STREET_VIEW_MAP_STYLE = {
  height: 200,
} as const;

export const GOOGLE_MAPS_URL = "https://www.google.com/maps";

const DATASTORE_START_DATE = "2021-08-18";

const RULE_ADMIN_CLIENT_ID = "da9e843a-f2c5-4de2-bf63-a31a45c2eac6";

export const KEY_EXECUTED_RULES = "Executed Rules" as const;

export { ADMIN_ROLES, DATASTORE_START_DATE, RULE_ADMIN_CLIENT_ID };
