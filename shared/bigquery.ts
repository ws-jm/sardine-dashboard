import { AnyTodo } from ".";
export interface HealthCheckEvent {
  os_family: string;
  user_id_hash: string;
  time: Timestamp;
  remote_ip: string;
  source: string;
}
export interface HealthCheckRequest {
  url: string;
  request_id: string;
  method: string;
  request_params: AnyTodo[];
  client_id: string;
  request_body: string;
  response_body: string;
  response_status_code: number;
  timestamp: Timestamp;
  returned_cached_response: boolean;
  latency: number;
  session_key: string;
}

interface Timestamp {
  value: Date;
}

// Risk level data from request_response in BigQuery has medium_low
export const SESSION_RISK_LEVELS = {
  VERY_HIGH: "very_high",
  HIGH: "high",
  MEDIUM: "medium",
  MEDIUM_LOW: "medium_low",
  LOW: "low",
} as const;

export type SessionRiskLevel = typeof SESSION_RISK_LEVELS[keyof typeof SESSION_RISK_LEVELS];

// Risk level data from customer_response in BigQuery does not have medium_low
export const RISK_LEVELS = {
  VERY_HIGH: "very_high",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

export interface DeviceSessionRiskLevelBreakdownRow {
  date: { value: string }; // e.g. 2021-06-22
  count: number;
  risk_level: SessionRiskLevel;
}

export interface CustomerRiskLevelDistributionRow {
  count: number;
  date: { value: string }; // e.g. 2021-06-22
  risk_level: RiskLevel;
}

export const CHART_NAMES = {
  DEVICE_SESSION_RISK_LEVEL_BREAKDOWN: "device-session-risk-level-breakdown",
  CUSTOMER_RISK_LEVEL_SESSION_DISTRIBUTION: "customer-risk-level-session-distribution",
  CUSTOMER_EMAIL_RISK_LEVEL_DISTRIBUTION: "customer-email-risk-level-distribution",
} as const;

export type ChartName = typeof CHART_NAMES[keyof typeof CHART_NAMES];

export const isChartName = (chartName: string): chartName is ChartName =>
  Object.values(CHART_NAMES).includes(chartName as ChartName);
