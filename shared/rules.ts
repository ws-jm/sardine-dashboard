type RuleActionTagKey = string; // TODO: Make it a union type, like "bankLevel" | "riskLevel"
type RuleActionTagValue = string; // TODO: Make it a union type: "high" | "medium" | "low"

export const RULE_ACTION_TYPES = {
  UPDATE_TAG: "update_tag",
} as const;

export type ActionType = typeof RULE_ACTION_TYPES[keyof typeof RULE_ACTION_TYPES];

export const RULE_ENV_MODES = {
  Live: "Live",
  Shadow: "Shadow",
} as const;

export const CHECKPOINTS = {
  AML: "AML",
  ACH: "ach",
  AMLBank: "aml_bank",
  AMLIssuer: "aml_issuer",
  AMLCrypto: "aml_crypto",
  Customer: "customer",
  Devices: "device",
  Login: "login",
  Onboarding: "onboarding",
  Payment: "payment",
  Withdrawal: "withdrawal",
  IssuingRisk: "issuingRisk",
} as const;
export type Checkpoint = typeof CHECKPOINTS[keyof typeof CHECKPOINTS];

export type RuleEnvMode = typeof RULE_ENV_MODES[keyof typeof RULE_ENV_MODES];
export interface RuleActionTag {
  key: RuleActionTagKey;
  value: RuleActionTagValue;
  actionType: ActionType;
}

export interface RuleAction {
  tags: RuleActionTag[];
}

export interface Rule {
  name: string;
  id: number;
  checkpoint: Checkpoint;
  condition: string;
  description: string;
  reasonCodesExpr: string;
  isShadow: boolean;
  isEditable: boolean;
  action: RuleAction;
  organisation: string;
  depreciated: boolean;
}

export interface RuleExpression extends Rule {
  env: RuleEnvMode;
}

export interface RuleActionProps {
  tags: RuleActionTagProps[];
}

export interface RuleActionTagProps {
  key: string;
  type: string;
  value: string;
}

export interface RuleDetails {
  id: number;
  name: string;
  checkpoint: Checkpoint;
  condition: string;
  depreciated?: boolean;
  reasonCodesExpr: string;
  isShadow: boolean;
  isEditable: boolean;
  action: RuleAction;
  queueID?: string;
}

export interface RuleInfoWithOrgName extends RuleDetails {
  organisation: string;
}

export const isRuleInfo = (o: unknown): o is RuleDetails =>
  o !== undefined &&
  o !== null &&
  typeof o === "object" &&
  "name" in (o as RuleDetails) &&
  "id" in (o as RuleDetails) &&
  "checkpoint" in (o as RuleDetails) &&
  "condition" in (o as RuleDetails) &&
  "reasonCodesExpr" in (o as RuleDetails) &&
  "isShadow" in (o as RuleDetails) &&
  "isEditable" in (o as RuleDetails) &&
  "action" in (o as RuleDetails);

export interface RuleProps {
  id: number;
  name: string;
  condition: string;
  description: string;
  reasonCodesExpr: string;
  action?: RuleActionProps;
  checkpoint: string;
  depreciated: boolean; // deprecated? depreciated? Somebody made a typo and used it for a DB attribute.
  isEditable: boolean;
  isShadow: boolean;
  queueID: string;
  organisation: string;
}
