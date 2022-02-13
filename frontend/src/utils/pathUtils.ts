import { CUSTOMER_PROFILE_PATH } from "../modulePaths";

export const getCustomerProfilePath = ({ customerId, clientId }: { customerId: string; clientId: string }): string =>
  `${CUSTOMER_PROFILE_PATH}?customerId=${encodeURIComponent(customerId)}&clientId=${clientId}`;
