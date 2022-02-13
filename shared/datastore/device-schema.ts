export interface BehaviorBiometrics {
  created_at: number;
  updated_at: number;
  num_distraction_events: number;
  num_context_switches: number;
  flow: string;
  hesitation_percentile: HesitationPercentile;
  fields: BField[];
}

export interface HesitationPercentile {
  non_ltm: number;
  ltm: number;
}

export interface BField {
  num_expert_key_events: string;
  name: string;
  num_auto_fill_events: string;
  num_copy_paste_events: string;
  hesitation_percentage: string;
  num_clipboard_events: string;
  is_ltm: boolean;
}

export interface DeviceKind {
  behavior_biometric_level: string;
  behavior_biometrics: Array<BehaviorBiometrics>;
  browser: string;
  city: string;
  client_id: string;
  confidence_score: number;
  country: string;
  created_at: number;
  device_id: string;
  device_memory: string;
  device_model: string;
  device_reputation: string;
  emulator: boolean;
  fingerprint_id: string;
  ip_address: string;
  device_age_hours: number;
  ip_location: {
    country: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
  ip_type: string;
  os: string;
  os_anomaly: string;
  persistent_device_id: string;
  proxy: string;
  proxy_prediction: string;
  referrer: string;
  region: string;
  remote_session_level: string;
  remote_software: boolean;
  screen_resolution: string;
  session_key: string;
  session_risk: string;
  timestamp: number;
  true_os: string;
  updated_at: number;
  user_id_hash: string;
  vpn: string;
  vpn_heuristic: boolean;
  rooted: boolean;
  vpn_prediction: string;
}

export interface UserAggregationKind {
  count: string;
  day_bucket: string;
  device_id_count: string;
  device_id_set: Array<string>;
  ip_address_count: string;
  ip_address_set: Array<string>;
  linked_users_count: string;
  os_count: string;
  os_set: Array<string>;
  referrer_count: string;
  referrer_set: Array<string>;
  timestamp_in_millis: string;
}
