export const randomId = (prefix: string): string => {
  const randomString = (Math.random() + 1).toString(36).substring(7);
  return prefix + randomString;
};

export const getCustomerIdFromUserIdHash = (sessionKey: string): string => sessionKey.split("-")[0];
