import { OrganizationUser } from "./domain";
import { Rule } from "./rules";

export interface ResetPasswordLinkRequestBody {
  email: string;
}

export interface AddNewCommentRequestBody {
  clientId: string;
  sessionKey: string;
  owner_id: string;
  comment: string;
}

export interface PurchaseLimitRequestBody {
  id: number;
  customer_risk_level: string;
  daily_limit_usd: number;
  weekly_limit_usd: number;
  monthly_limit_usd: number;
  client_id: string;
  hold_days: number;
  instant_limit_usd: number;
  min_amount: number;
  max_amount: number;
}

export type FetchDeviceProfileRequestBody = {
  organisation: string;
  sessionKey: string;
  source: string;
  clientId?: string | null;
};

export interface SearchDetailsRequestBody {
  startTimestampSeconds: number;
  endTimestampSeconds: number;
  organisation: string;
  source: string;
  offset: number;
  limit: number;
  filters?: { [key: string]: string };
}

export interface SortRulesRequestBody {
  order: number[];
  clientID: string;
  checkpoint: string | null;
}

export interface UserAggregationsRequestBody {
  clientId?: string;
  organisation: string;
  userId: string;
}

export interface CustomerRequestBody {
  startDate: string;
  endDate: string;
  offset: number;
  limit: number;
  first_name?: string;
  last_name?: string;
  session_key?: string;
  customer_id?: string;
  phone?: string;
  city?: string;
  postal_code?: string;
  region_code?: string;
  country_code?: string;
  email_address?: string;
  is_email_verified?: string;
  is_phone_verified?: string;
  device_id?: string;
  customer_risk_level?: string;
  device_risk_level?: string;
  device_ip?: string;
  transaction_id?: string;
  risk_level?: string;
  carrier?: string;
  phone_country?: string;
}

export interface DisableRuleRequestBody {
  ruleID: number;
  clientId: string;
}

export interface RuleFeatureStatsRequestBody {
  feature: string;
  datatype: string;
  min?: number;
  max?: number;
}

export interface RulePayload {
  rule: Rule;
  clientID: string;
  checkpoint: "customer";
}

export interface UpdateCaseStatusRequestBody {
  clientId: string;
  queueName: string;
  customerIds: string[];
  data: StatusData;
  sessionKeys: string[];
  checkpoint: string;
  transactionIds: string[];
}

export interface StatusData {
  [key: string]: string;
}

export interface EmailInvitationRequestBody {
  organisation: string;
  emails: string[];
  link: string;
}

export interface BlockAllowlistData {
  type: string;
  value: string;
}

export interface CreateBlockAllowlistRequestBody {
  client_id?: string;
  organisation: string;
  data: BlockAllowlistData[];
  scope: string;
  expiry: string;
}

export interface UpdateBlockAllowlistRequestBody {
  id: string;
  organisation: string;
  type: string;
  value: string;
  scope: string;
  expiry: string;
}

// ------------- GODS VIEW --------------
export interface Organization {
  name: string;
  clientID: string;
  users: OrganizationUser[];
}

export interface OrganizationAction {
  name: string;
  index: number;
}

// ---------- WEBHOOKS --------
export interface CreateWebhookRequestBody {
  url: string;
  organisation: string;
}

// ---------- QUEUE --------
export interface Queue {
  owner_id: string;
  id: string;
  name: string;
  client_id?: string;
  checkpoint?: string;
  owner?: OrganizationUser;
}

// ---------- CASE MANAGEMENT --------
export interface JiraRequestBody {
  clientId: string;
  email: string;
  url: string;
  token: string;
}

// ---------- TRANSACTIONS --------
export interface TransactionsRequestBody {
  startDate?: string;
  endDate?: string;
  user_risk_level?: string;
  session_key?: string;
  customer_id?: string;
  item_category?: string;
  action_type?: string;
  transaction_id?: string;
  card_hash?: string;
  account_number?: string;
  crypto_address?: string;
  load_transactions?: boolean;
  offset?: number;
}

const ACCOUNT_TYPES = [0, 1, 2, 3] as const;
type AccountType = typeof ACCOUNT_TYPES[number];
export interface Transaction {
  id: string;
  client_id: string;
  session_key: string;
  customer_id: string;
  request_id: string;
  currency_code: string;
  action_type: string;
  amount: number;
  created_milli: number;
  item_category: string;
  mcc: string;
  timestamp: string;
  indemnification_decision: string;
  indemnification_reason: string;
  recipient_payment_method: string;
  recipient_payment_method_crypto?: RecipientPaymentMethodCrypto;
  payment_method: string;
  first_6: string;
  card_hash: string;
  last_4: string;
  routing_number: string;
  account_number: string;
  account_type: AccountType;
  crypto_address: string;
  address_risk_level: string;
  user_risk_level: string;
  risk_level: string;
  aml_level: string;
  categories: string;
  crypto_currency_code: string;
}

export interface RecipientPaymentMethodCrypto {
  address_risk_level: string;
  categories: string;
  client_id: string;
  crypto_address: string;
  currency_code: string;
  customer_id: string;
  payment_type: string;
  user_risk_level: string;
}

export interface EmailConfig {
  email: string;
  token?: string;
  name?: string;
}

export interface SendNotificationRequest {
  subject: string;
  message: string;
  users: EmailConfig[];
}

export interface FeedbackRequest {
  sessionKey: string;
  customer: {
    id: string;
  };
  transaction: {
    id: string;
  };
  feedback: {
    scope: string;
    status: string;
    type: string;
    reason: string;
  };
}

//----------- Audit Logs -------------------
export interface LogsListRequestBody {
  startDate: string;
  endDate: string;
  type: string;
  offset: number;
  limit: number;
}
