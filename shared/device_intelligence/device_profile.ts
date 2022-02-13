import { BehaviorBiometricsPerFlow } from ".";

export interface DeviceProfile {
  country: string;
  vpn_prediction: string;
  device_model: string;
  device_memory: string;
  city: string;
  client_id: string;
  true_os: string;
  os_anomaly: string;
  fraud_score: number;
  session_risk: string;
  device_reputation: string;
  user_id_hash: string;
  browser: string;
  session_key: string;
  device_id: string;
  os: string;
  persistent_device_id: string;
  proxy_prediction: string;
  remote_software: boolean;
  ip_address: string;
  ip_type: string;
  screen_resolution: string;
  proxy: string;
  emulator: boolean;
  rooted: boolean;
  vpn: string;
  fingerprint_id: string;
  confidence_score: number;
  vpn_heuristic: boolean;
  location: {
    lon: number;
    lat: number;
  };
  region: string;
  device_age_hours: number;
  referrer: string;
  behavior_biometric_level: string;
  behavior_biometrics: Array<BehaviorBiometricsPerFlow>;
  created_at: string;
  updated_at?: string;
  datetime?: string;
  remote_session_level?: string;
}
