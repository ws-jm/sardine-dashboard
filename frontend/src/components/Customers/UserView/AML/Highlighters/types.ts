import { CustomersResponse } from "sardine-dashboard-typescript-definitions";

export interface HighlighterProps<T> {
  value: T;
  customerData: CustomersResponse;
}
