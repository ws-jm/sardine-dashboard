export const INDEMNIFICATION_DECISION = {
  0: "UNKNOWN",
  1: "APPROVED",
  2: "REJECTED",
  3: "APPROVEDWITHKYC",
  4: "CONDITIONALLY_APPROVED",
};

export const indemnificationDecisionFromValue = (value: string) => {
  const val = parseInt(value, 10) || 0;
  return Object(INDEMNIFICATION_DECISION)[val] || INDEMNIFICATION_DECISION[0];
};

export const KEY_PAYMENT_METHOD = "Payment Method" as const;
export const KEY_TRANSACTION_DATA = "Transaction Data" as const;
export const KEY_IDENTITY = "Identity" as const;
export const KEY_EXECUTED_RULES = "Executed Rules" as const;
