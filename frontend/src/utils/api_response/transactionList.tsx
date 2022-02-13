import { Transaction } from "sardine-dashboard-typescript-definitions";

export default interface TransactionListResponse {
  transactions: Array<Transaction>;
}
