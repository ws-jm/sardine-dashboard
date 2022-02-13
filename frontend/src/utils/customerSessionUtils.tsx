import { uniq } from "lodash-es";
import { SessionKind as Session, CustomersResponse, AddressFields } from "sardine-dashboard-typescript-definitions";
import { timestampToISODateIfZeroEmptyString } from "./timeUtils";
import { GOOGLE_MAPS_URL } from "../constants";

const filterAndJoin = (values: string[]): string => uniq(values.filter((val) => val !== "")).join(", ");

const getMaxLevel = (values: string): string => {
  if (values.includes("high")) return "high";
  if (values.includes("medium")) return "medium";
  if (values.includes("low")) return "low";
  return "-";
};

const getPhoneDetails = (response: Session[]) => {
  const data = response.map((res) => {
    if (res.payfone && res.payfone.payfone) {
      return {
        carrier: res.payfone.carrier,
        name_score: res.payfone.name_score,
        address_score: res.payfone.address_score,
      };
    }
    if (res.telesign && res.telesign.telesign) {
      return {
        carrier: res.telesign.carrier,
        name_score: res.telesign.name_score,
        address_score: res.telesign.address_score,
      };
    }

    return {
      carrier: "",
      name_score: 0,
      address_score: 0,
    };
  });

  if (data && data.length > 0) {
    return {
      carrier: filterAndJoin(data.map((d) => d?.carrier || "")),
      name_score: `${Math.max(...data.map((d) => d?.name_score || 0)) || "-"}`,
      address_score: `${Math.max(...data.map((d) => d?.address_score || 0)) || "-"}`,
    };
  }

  return {
    carrier: "",
    name_score: "",
    address_score: "",
  };
};

export const constructAddress = (response: Session): string =>
  [response.street_1, response.street_2, response.city, response.region_code, response.postal_code, response.country_code]
    .filter((a) => a?.trim())
    .join(", ");

const constructAddressFromAddressField = (addressFields: AddressFields): string =>
  [
    addressFields.street1,
    addressFields.street2,
    addressFields.city,
    addressFields.region_code,
    addressFields.postal_code,
    addressFields.country_code,
  ]
    .filter((a) => a?.trim())
    .join(", ");

const getEmailReasonCodes = (response: Session): string => {
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.email_reason_code.join(",");
};

const getPhoneReasonCodes = (response: Session): string => {
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.phone_reason_code.join(",");
};

const getPhoneRiskLevel = (response: Session): string => {
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.phone_level;
};

const getEmailRiskLevel = (response: Session): string => {
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.email_level;
};

const getEmailDomainRiskLevel = (response: Session): string => {
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.email_domain_level;
};

const getCustomerRiskLevel = (response: Session): string => {
  if (response.customer_risk_level) return response.customer_risk_level;
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.customer_risk_level;
};

const getTaxIdLevel = (response: Session): string => {
  if (response.checkpointOutput === undefined) return "";
  return response.checkpointOutput.tax_id_level;
};

const timestampToReadable = (timestamp: number): string => {
  if (timestamp === 0) {
    return "";
  }
  const date = new Date(timestamp * 1000);
  return date.toDateString();
};

const getTaxIdDetails = (response: Session[]) => {
  const EMPTY_DETAILS = {
    tax_id: "",
    tax_id_match: "",
    tax_id_name_match: "",
    tax_id_dob_match: "",
    tax_id_state_match: "",
    abuse_score: 0,
    first_party_synthetic_score: 0,
    id_theft_score: 0,
    name_dob_shared_count: 0,
    name_ssn_synthetic_address: false,
    ssn_bogus: false,
    ssn_history_longer_months: 0,
    ssn_issuance_before_dob: false,
    ssn_issuance_dob_mismatch: false,
    ssn_shared_count: 0,
    ssn_names_exact_match: [],
    ssn_phones_exact_match: [],
    ssn_emails_exact_match: [],
    ssn_dobs_exact_match: [],
  };

  const data = response.map((res) => {
    if (res.sentilink) {
      return res.sentilink;
    }
    return EMPTY_DETAILS;
  });

  if (data && data.length > 0) {
    return {
      tax_id: filterAndJoin(data.map((d) => d?.tax_id || "")),
      tax_id_match: filterAndJoin(data.map((d) => d?.tax_id_match || "")),
      tax_id_name_match: filterAndJoin(data.map((d) => d?.tax_id_name_match || "")),
      tax_id_dob_match: filterAndJoin(data.map((d) => d?.tax_id_dob_match || "")),
      tax_id_state_match: filterAndJoin(data.map((d) => d?.tax_id_state_match || "")),
      abuse_score: Math.max(...data.map((d) => d?.abuse_score || 0)),
      first_party_synthetic_score: Math.max(...data.map((d) => d?.first_party_synthetic_score || 0)),
      id_theft_score: Math.max(...data.map((d) => d?.id_theft_score || 0)),
      name_dob_shared_count: Math.max(...data.map((d) => d?.name_dob_shared_count || 0)),
      name_ssn_synthetic_address: data.map((d) => d?.name_ssn_synthetic_address || false).includes(true),
      ssn_bogus: data.map((d) => d?.ssn_bogus || false).includes(true),
      ssn_history_longer_months: Math.max(...data.map((d) => d?.ssn_history_longer_months || 0)),
      ssn_issuance_before_dob: data.map((d) => d?.ssn_issuance_before_dob || false).includes(true),
      ssn_issuance_dob_mismatch: data.map((d) => d?.ssn_issuance_dob_mismatch || false).includes(true),
      ssn_shared_count: Math.max(...data.map((d) => d?.ssn_shared_count || 0)),
      ssn_names_exact_match: data.map((d) => d?.ssn_names_exact_match || []).flat(),
      ssn_phones_exact_match: data.map((d) => d?.ssn_phones_exact_match || []).flat(),
      ssn_emails_exact_match: data.map((d) => d?.ssn_emails_exact_match || []).flat(),
      ssn_dobs_exact_match: data.map((d) => d?.ssn_dobs_exact_match || []).flat(),
    };
  }

  return EMPTY_DETAILS;
};

const getEmailDetails = (respone: Session[]) => {
  const EMPTY_DETAILS = {
    phone_country: "",
    risk_band: "",
    email_reason: "",
    email_owner_name: "",
    email_owner_name_match: "",
    facebook_Link: "",
    Twitter_Link: "",
    LinkedIn_Link: "",
    phonescore_reason: "",
    email_phone_risk_level: "",
    billaddress_reason: "",
  };

  const data = respone.map((res) => {
    if (res.emailage) {
      const { emailage } = res;
      return {
        phone_country: emailage.phone_country,
        risk_band: String(emailage.risk_band),
        email_reason: emailage.email_reason,
        email_owner_name: emailage.email_owner_name,
        email_owner_name_match: String(emailage.email_owner_name_match),
        facebook_Link: emailage.fb_link,
        Twitter_Link: emailage.twitter_link,
        LinkedIn_Link: emailage.linkedin_link,
        phonescore_reason: emailage.phone_reason,
        email_phone_risk_level: String(emailage.email_phone_risk_level),
        billaddress_reason: String(emailage.billaddress_reason),
      };
    }

    if (res.payfone && res.payfone.phone_country) {
      EMPTY_DETAILS.phone_country = res.payfone.phone_country;
    }

    return EMPTY_DETAILS;
  });

  if (data && data.length > 0) {
    return {
      phone_country: filterAndJoin(data.map((d) => d?.phone_country || "")),
      risk_band: `${Math.max(...data.map((d) => parseInt(d?.risk_band || "0", 10) || 0))}`,
      email_reason: filterAndJoin(data.map((d) => d?.email_reason || "")),
      email_owner_name: filterAndJoin(data.map((d) => d?.email_owner_name || "")),
      email_owner_name_match: `${Math.max(...data.map((d) => parseInt(d?.email_owner_name_match || "0", 10) || 0))}`,
      facebook_Link: filterAndJoin(data.map((d) => d?.facebook_Link || "")),
      Twitter_Link: filterAndJoin(data.map((d) => d?.Twitter_Link || "")),
      LinkedIn_Link: filterAndJoin(data.map((d) => d?.LinkedIn_Link || "")),
      phonescore_reason: filterAndJoin(data.map((d) => d?.phonescore_reason || "")),
      email_phone_risk_level: `${Math.max(...data.map((d) => parseInt(d?.email_phone_risk_level || "0", 10) || 0))}`,
      billaddress_reason: `${Math.max(...data.map((d) => parseInt(d?.billaddress_reason || "0", 10) || 0))}`,
    };
  }

  return EMPTY_DETAILS;
};

export const sessionToAddressFields = (s: Session): AddressFields => ({
  street1: s.street_1 || "",
  street2: s.street_2 || "",
  city: s.city || "",
  postal_code: s.postal_code || "",
  region_code: s.region_code || "",
  country_code: s.country_code || "",
});

export function convertDatastoreSessionToCustomerResponse(r: Session): CustomersResponse {
  return {
    address_fields_list: [sessionToAddressFields(r)],
    client_id: r.client_id || "",
    session_key: r.session_key || "",
    customer_id: r.customer_id || "",
    flow: r.flow || "",
    first_name: r.first_name || "",
    last_name: r.last_name || "",
    phone: r.phone || "",
    location: "",
    email_address: r.email_address || "",
    is_email_verified: r.is_email_verified || false,
    is_phone_verified: r.is_phone_verified || false,
    device_id: r.device_id || "",
    date_of_birth: r.dob || "",
    customer_score: String(r.customer_score),
    email_reason_codes: getEmailReasonCodes(r),
    phone_reason_codes: getPhoneReasonCodes(r),
    phone_level: getPhoneRiskLevel(r),
    email_level: getEmailRiskLevel(r),
    email_domain_level: getEmailDomainRiskLevel(r),
    risk_level: getCustomerRiskLevel(r),
    reason_codes: r.reason_codes,
    created_date: timestampToReadable(r.timestamp),
    customer_risk_level: getCustomerRiskLevel(r),
    device_risk_level: "",
    browser: "",
    os: "",
    true_os: "",
    device_ip: "",
    ip_city: "",
    ip_region: "",
    ip_country: "",
    remote_desktop: "",
    emulator: "",
    proxy: "",
    ip_type: "",
    vpn: "",
    latitude: "",
    longitude: "",
    timestamp: timestampToISODateIfZeroEmptyString(r.timestamp),
    ...getTaxIdDetails([r]),
    tax_id_level: getTaxIdLevel(r),
    third_party_synthetic_score: r.sentilink ? `${r.sentilink.third_party_synthetic_score}` : "",
    transaction_id: r.transaction_id || "",
    transaction_amount: "",
    transaction_currency_code: "",
    ...getPhoneDetails([r]),
    ...getEmailDetails([r]),
    rules_executed: r.checkpointOutput === undefined ? [] : r.checkpointOutput.rule_executed,
    // Additional fields related to case management
    id: "",
    status: r.status || "Pending",
    decision: r.decision || "",
    queue_id: r.queue_id,
  };
}

export const extractStreetWords = (customerData: CustomersResponse): string[] => {
  const street1Words = customerData.address_fields_list.map((addressField) => addressField.street1).filter((s) => s); // Filter empty string
  const street2Words = customerData.address_fields_list.map((addressField) => addressField.street2).filter((s) => s); // Filter empty string
  return [...street1Words, ...street2Words];
};

// We might want to change the path from /search to /place in the future.
export const generateGoogleMapsUrlFromAddress = (address: string): string =>
  address === "" ? "" : `${GOOGLE_MAPS_URL}/search/${encodeURIComponent(address)}`;

export const getAddressListFromCustomerResponse = (customer: CustomersResponse): string[] => {
  if (customer.address_fields_list && customer.address_fields_list.length > 0) {
    return customer.address_fields_list.map((a) => constructAddressFromAddressField(a));
  }
  return [];
};

// Get the latest address
export const getLatestAddressFromCustomerResponse = (customer: CustomersResponse): string => {
  if (customer.address_fields_list && customer.address_fields_list.length > 0) {
    return constructAddressFromAddressField(customer.address_fields_list[0]);
  }
  return "";
};

export const getLatestMapUrlFromCustomerResponse = (customer: CustomersResponse): string =>
  generateGoogleMapsUrlFromAddress(getLatestAddressFromCustomerResponse(customer));

export function convertDatastoreSessionsToCustomerResponse(sessions: Session[]): CustomersResponse {
  const firstSession = sessions[0];
  const userStatuses = filterAndJoin(sessions.map((s) => s.status || "pending"));
  const isResolved = userStatuses.includes("resolved");
  const isProgress = userStatuses.includes("in-progress");

  return {
    address_fields_list: sessions.map(sessionToAddressFields),
    client_id: firstSession.client_id || "",
    customer_id: firstSession.customer_id || "",
    session_key: filterAndJoin(sessions.map((s) => s.session_key || "")),
    flow: filterAndJoin(sessions.map((s) => s.flow || "")),
    first_name: filterAndJoin(sessions.map((s) => `${s.first_name || ""} ${s.last_name || ""}`)),
    last_name: "",
    phone: filterAndJoin(sessions.map((s) => s.phone || "")),
    email_address: filterAndJoin(sessions.map((s) => s.email_address || "")),
    is_email_verified: sessions.map((s) => s.is_email_verified).includes(true) || false,
    is_phone_verified: sessions.map((s) => s.is_phone_verified).includes(true) || false,
    device_id: filterAndJoin(sessions.map((s) => s.device_id || "")),
    date_of_birth: filterAndJoin(sessions.map((s) => s.dob || "")),
    customer_score: `${Math.max(...sessions.map((s) => s.customer_score || 0))}`,
    email_reason_codes: filterAndJoin(sessions.map((s) => getEmailReasonCodes(s))),
    phone_reason_codes: filterAndJoin(sessions.map((s) => getPhoneReasonCodes(s))),
    phone_level: getMaxLevel(filterAndJoin(sessions.map((s) => getPhoneRiskLevel(s)))),
    email_level: getMaxLevel(filterAndJoin(sessions.map((s) => getEmailRiskLevel(s)))),
    email_domain_level: getMaxLevel(filterAndJoin(sessions.map((s) => getEmailDomainRiskLevel(s)))),
    risk_level: getMaxLevel(filterAndJoin(sessions.map((s) => getCustomerRiskLevel(s)))),
    created_date: filterAndJoin(sessions.map((s) => timestampToReadable(s.timestamp))),
    customer_risk_level: getMaxLevel(filterAndJoin(sessions.map((s) => getCustomerRiskLevel(s)))),
    timestamp: filterAndJoin(sessions.map((s) => timestampToISODateIfZeroEmptyString(s.timestamp))),
    tax_id_level: getMaxLevel(filterAndJoin(sessions.map((s) => getTaxIdLevel(s) || ""))),
    transaction_id: filterAndJoin(sessions.map((s) => s.transaction_id || "")),
    ...getTaxIdDetails(sessions),
    ...getPhoneDetails(sessions),
    ...getEmailDetails(sessions),
    // Additional fields related to case management
    id: "",
    status: isResolved ? "resolved" : isProgress ? "in-progress" : "pending",
    decision: "",
    // owner?: OwnerProps;
    device_risk_level: "",
    browser: "",
    os: "",
    true_os: "",
    device_ip: "",
    ip_city: "",
    ip_region: "",
    ip_country: "",
    remote_desktop: "",
    emulator: "",
    proxy: "",
    ip_type: "",
    vpn: "",
    latitude: "",
    longitude: "",
    transaction_amount: "",
    transaction_currency_code: "",
    location: "",
    rules_executed: [],
    reason_codes: uniq(sessions.map((s) => s.reason_codes).flat()),
    third_party_synthetic_score: filterAndJoin(
      sessions.map((s) => (s.sentilink ? `${s.sentilink.third_party_synthetic_score}` : ""))
    ),
  };
}
