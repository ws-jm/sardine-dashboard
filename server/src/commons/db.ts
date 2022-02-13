/* eslint-disable @typescript-eslint/naming-convention */
import promise from "bluebird";
import pgPromise from "pg-promise";
import config from "config";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import logs from "./models/logs";
import auth from "./models/auth";
import session from "./models/session";
import superadmin from "./models/superadmin";
import organisation from "./models/organisation";
import organizationConfig from "./models/organization-config";
import webhooks from "./models/webhooks";
import jira from "./models/jira";
import audit from "./models/audit";

import blocklist from "./models/business/blocklist";
import allowlist from "./models/business/allowlist";
import purchaseLimit from "./models/business/purchase-limit";

const createPgConnection = (uri: string) => {
  const initOptions = {
    promiseLib: promise,
    error(error: AnyTodo) {
      return { ...error, DB_ERROR: true };
    },
  };

  const pgp = pgPromise(initOptions);
  const db = pgp(uri);

  return db;
};

const con = createPgConnection(process.env.DATABASE_URL || config.get("DB_CONNECTION_STRING"));

const businessConn = createPgConnection(process.env.BUSINESS_DATABASE_URL || config.get("BUSINESS_DB_CONNECTION_STRING"));

export const db = {
  logs: logs(con),
  auth: auth(con),
  session: session(con),
  superadmin: superadmin(con),
  organisation: organisation(con),
  organizationConfig: organizationConfig(con),
  webhooks: webhooks(con),
  jira: jira(con),
  audit: audit(con),
};

export const business_db = {
  blocklist: blocklist(businessConn),
  allowlist: allowlist(businessConn),
  purchaseLimit: purchaseLimit(businessConn),
};
