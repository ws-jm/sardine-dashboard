export const getHeaders = (isBlocklist: boolean) => [isBlocklist ? "Blocked by" : "Allowed by", "Expiry", "Action"];
