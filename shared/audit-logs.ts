export const AUDIT_LOG_TYPES = {
  //---- RULE -----
  CREATE_RULE: "rule-created",
  UPDATE_RULE: "rule-updated",
  DISABLE_RULE: "rule-disabled",
  SORT_RULE: "rule-sorted",

  //---- USER -----
  CREATE_USER: "user-created",
  UPDATE_USER: "user-updated",
  DELETE_USER: "user-deleted",

  //---- ORGANIZATION -----
  CREATE_ORGANIZATION: "organization-created",

  //---- QUEUE -----
  CREATE_QUEUE: "queue-created",
  UPDATE_QUEUE: "queue-updated",
  DELETE_QUEUE: "queue-deleted",

  //---- CASE -----
  UPDATE_CASE: "case-updated",
} as const;
