import { QueryStatus } from "react-query";

export interface QueryResult<T> {
  status: QueryStatus;
  data: T | undefined;
  error: Error | null;
}
