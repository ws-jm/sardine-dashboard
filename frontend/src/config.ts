// Constants determined by env should be in config.ts. They should not be in constants.ts.
export const DEFAULT_ORGANISATION_FOR_SUPERUSER =
  import.meta.env.VITE_APP_SARDINE_ENV === "production" ? "demo.sardine.ai" : "demo.dev.sardine.ai";
