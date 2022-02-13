import pgPromise from "pg-promise";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

const logsModel = (db: pgPromise.IDatabase<{}>) => {
  const logError = async (
    msg: string,
    stack: string,
    reqId: string,
    userId: string | null,
    source: string,
    query: string | null,
    code: number | null
  ) => {
    await db
      .none(
        "INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [msg, stack, reqId, userId, source, query, code]
      )
      .catch((error) => {
        // Do not throw error from here to prevent infinite loop
        console.log("Error writing to error logs", error);
      });
  };

  const logUnhandledRejectionError = async (msg: AnyTodo, stack: AnyTodo) => {
    await db
      .none(
        "INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [msg, stack, null, null, "unhandledRejection", null, null]
      )
      .catch((error) => {
        // Do not throw error from here to prevent infinite loop
        console.log("Error writing to error logs", error);
      });
  };

  const logUncaughtExceptionError = async (msg: string, stack: AnyTodo) => {
    await db
      .none(
        "INSERT INTO error_logs (msg, stack, req_id, user_id, source, db_query, db_code) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [msg, stack, null, null, "uncaughtException", null, null]
      )
      .catch((error) => {
        // Do not throw error from here to prevent infinite loop
        console.log("Error writing to error logs", error);
      });
  };

  return {
    logError,
    logUnhandledRejectionError,
    logUncaughtExceptionError,
  };
};

export default logsModel;
