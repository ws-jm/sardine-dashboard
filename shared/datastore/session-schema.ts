export interface SessionCustomKind {
  [key: string]: string;
}

export interface SessionKind {
  custom?: SessionCustomKind;
  company: string;
  flow: string;
  transaction_id: string;
  timestamp: number;
  city: string;
  risk_score: number;
  risk_level: string;
  street_2: string;
  postal_code: string;
  street_1: string;
  last_name: string;
  middle_name: string;
  dob: string;
  country_code: string;
  first_name: string;
  is_phone_verified: boolean;
  email_address: string;
  is_email_verified: boolean;
  customer_score: number;
  region_code: string;
  phone: string;
  tax_id: string;
  request_id: string;
  session_key: string;
  customer_id: string;
  client_id: string;
  device_id: string;
  queue_id: Array<string>;
  status: string;
  decision: string;
  customer_risk_level: string;
  reason_codes: Array<string>;
  checkpointOutput: {
    queue_id: Array<string>;
    rule_executed: Array<number>;
    customer_risk_level: string;
    tax_id_level: string;
    phone_reason_code: Array<string>;
    email_domain_level: string;
    email_level: string;
    email_reason_code: Array<string>;
    phone_level: string;
  };
  emailage: {
    email_phone_risk_level: number;
    phone_reason: string;
    billaddress_reason: number;
    risk_band: number;
    email_owner_name: string;
    email_reason: string;
    email_owner_name_match: number;
    phone_country: string;
    fb_link: string;
    linkedin_link: string;
    twitter_link: string;
  };
  payfone: {
    carrier: string;
    address_score: number;
    payfone: boolean;
    name_score: number;
    trust_score: number;
    phone_country: string;
    phone_type: string;
  };
  telesign: {
    carrier: string;
    address_score: number;
    telesign: boolean;
    name_score: number;
    risk_score: number;
    phone_type_code: string;
  };
  sentilink: {
    abuse_score: number;
    first_party_synthetic_score: number;
    id_theft_score: number;
    name_dob_shared_count: number;
    name_ssn_synthetic_address: boolean;
    ssn_bogus: boolean;
    ssn_history_longer_months: number;
    ssn_issuance_before_dob: boolean;
    ssn_issuance_dob_mismatch: boolean;
    ssn_shared_count: number;
    ssn_names_exact_match: string[];
    ssn_phones_exact_match: string[];
    ssn_emails_exact_match: string[];
    ssn_dobs_exact_match: string[];
    tax_id: string;
    tax_id_match: string;
    tax_id_name_match: string;
    tax_id_dob_match: string;
    tax_id_state_match: string;
    third_party_synthetic_score: number;
  };
}
