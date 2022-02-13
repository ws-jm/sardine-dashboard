export const DEVICE_WHITELISTED_FILTERS = [
  "country",
  "os",
  "user_id_hash",
  "client_id",
  "fingerprint_id",
  "session_risk",
  "proxy",
  "device_reputation",
  "screen_resolution",
  "browser",
  "device_memory",
  "session_key",
  "ip_address",
  "device_id",
  "remote_software",
  "ip_type",
  "emulator",
  "os_anomaly",
  "vpn",
  "city",
] as const;

export const DATA_SOURCE = {
  DATASTORE: "ds",
  ELASTIC_SEARCH: "es",
};

export const SOURCE_QUERY_FIELD = "source";
