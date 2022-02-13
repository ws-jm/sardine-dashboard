export const SESSION_KIND = "session";
export const TRANSACTION_KIND = "transaction";
export const AML_KIND = "aml";
export const DOCUMENT_VERIFICATION_KIND = "documentVerification";
export const RULE_PERFORMANCE_KIND = "rule_performance";
export const DEVICES_KIND = "device_session_profile";
export const DEVICE_AGGREGATIONS_KIND = "device_aggregations_multiday";
export const USER_AGGREGATIONS_KIND = "user_aggregations_multiday";
export const FEEDBACK_KIND = "feedback";

export const constructCustomerKey = (clientId: string, customerId: string) => `${clientId}#${customerId}`;

export const constructSessionKey = (clientId: string, sessionKey: string) => `${clientId}#${sessionKey}`;

export const constructDeviceKey = (clientId: string, sessionKey: string, deviceId: string) =>
  `${clientId}#${sessionKey}#${deviceId}`;
