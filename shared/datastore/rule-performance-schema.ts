export interface RulePerformanceKind {
  ClientId: string;
  RuleId: number;
  RiskLevel: string;
  ApprovedCount: number;
  CancelledCount: number;
  ChargebackCount: number;
  DeclinedCount: number;
  FraudCount: number;
  Timestamp: number;
}
