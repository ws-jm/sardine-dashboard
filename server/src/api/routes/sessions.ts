import express, { Response } from "express";
import { query } from "express-validator";
import {
  GetAmlResponse,
  sessionUrls,
  SARDINE_ADMIN,
  MULTI_ORG_ADMIN,
  AUDIT_LOG_TYPES,
} from "sardine-dashboard-typescript-definitions";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { RequestWithUser, RequestWithCurrentUser, UpdateSessionRequest } from "../request-interface";
import { Session } from "../../commons/models/datastore/sessions";
import { AllowListAttributes } from "../utils";
import { Aml } from "../../commons/models/datastore/aml";
import { captureException, getErrorMessage } from "../../utils/error-utils";
import { writeAuditLog } from "../utils/routes/audit";

const router = express.Router();

const { listSessionRoute, amlSessionRoute, transactionsSessionRoute, sessionWithTransactionsRoute, updateCaseStatusRoute } =
  sessionUrls.routes;

const WHITELISTED_QUERY_PARAMS = [
  "session_key",
  "customer_id",
  "transaction_id",
  "flow",
  "rule_id",
  "first_name",
  "last_name",
  "email_address",
  "phone",
  "country_code",
  "device_id",
  "customer_risk_level",
  "phone_level",
  "email_level",
  "tax_id_level",
  "adverse_media_level",
  "pep_level",
  "sanction_level",
];

const sessionsRouter = () => {
  const hasAdminAccess = (value: string) => {
    const admins: string[] = [SARDINE_ADMIN, MULTI_ORG_ADMIN];
    return admins.includes(value);
  };

  router[listSessionRoute.httpMethod](
    listSessionRoute.path,
    query("client_id").exists().isUUID(),
    query(["start_date", "end_date"]).exists().withMessage("Is empty").isInt().withMessage("Is not integer"),
    query("limit").optional().isInt(),
    query(WHITELISTED_QUERY_PARAMS).optional().isString(),
    query("page_cursor").optional().isString(),
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response) => {
      if (req.currentUser === undefined) {
        throw new Error("User undefined");
      }

      const queryClientId = req.query.client_id as string;
      const startDate: number = parseInt(req.query.start_date as string, 10);
      const endDate: number = parseInt(req.query.end_date as string, 10);
      const pageCursor: string | undefined = req.query.page_cursor as string | undefined;
      const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const filters: { [key: string]: string } = {};
      WHITELISTED_QUERY_PARAMS.forEach((param) => {
        if (req.query[param]) {
          filters[param] = req.query[param] as string;
        }
      });

      try {
        const clientId = hasAdminAccess(req.currentUser.user_role)
          ? queryClientId
          : await db.superadmin.getClientId(req.currentUser?.organisation);

        const data = await Session.queryByTimeRange(clientId, startDate, endDate, filters, pageCursor, limit);
        res.json(data);
      } catch (e) {
        captureException(e);
        if (getErrorMessage(e) === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
      return undefined; // async function is supposed to return something
    }
  );

  router[amlSessionRoute.httpMethod](
    amlSessionRoute.path,
    query(amlSessionRoute.params.clientId).exists().isUUID(),
    query(amlSessionRoute.params.customerId).exists().isString(),
    query(amlSessionRoute.params.sessionKey).exists().isString(),
    [mw.validateRequest, mw.requireLoggedIn],
    async (
      req: RequestWithCurrentUser<
        {},
        {
          [amlSessionRoute.params.clientId]: string;
          [amlSessionRoute.params.customerId]: string;
          [amlSessionRoute.params.sessionKey]: string;
        }
      >,
      res: Response
    ) => {
      if (req.currentUser === undefined) {
        throw new Error("User undefined");
      }
      const queryClientId = req.query[amlSessionRoute.params.clientId];
      const customerId = req.query[amlSessionRoute.params.customerId];
      const sessionKey = req.query[amlSessionRoute.params.sessionKey];
      try {
        const clientId = hasAdminAccess(req.currentUser.user_role)
          ? queryClientId
          : await db.superadmin.getClientId(req.currentUser?.organisation);

        let response: GetAmlResponse = {};
        const aml = await Aml.query(clientId, customerId, sessionKey);
        if (aml) {
          response = { aml };
        }
        res.json(response);
      } catch (e) {
        captureException(e);
        if (getErrorMessage(e) === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
      return undefined; // async function is supposed to return something
    }
  );

  router[transactionsSessionRoute.httpMethod](
    transactionsSessionRoute.path,
    query("client_id").exists().isUUID(),
    query("customer_id").exists().isString(),
    query("session_key").exists().isString(),
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response) => {
      if (req.currentUser === undefined) {
        throw new Error("User undefined");
      }
      const queryClientId: string = req.query.client_id as string;
      const customerId: string = req.query.customer_id as string;
      const sessionKey: string = req.query.session_key as string;
      try {
        const clientId = hasAdminAccess(req.currentUser.user_role)
          ? queryClientId
          : await db.superadmin.getClientId(req.currentUser?.organisation);

        let response = {};
        const transactions = await Session.getTransactionsList(clientId, customerId, sessionKey);
        response = { transactions };
        res.json(response);
      } catch (e) {
        captureException(e);
        if (getErrorMessage(e) === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
      return undefined; // async function is supposed to return something
    }
  );

  router[sessionWithTransactionsRoute.httpMethod](
    sessionWithTransactionsRoute.path,
    [
      query(sessionWithTransactionsRoute.params.customerId).exists(),
      query(sessionWithTransactionsRoute.params.sessionKey).exists(),
      query(sessionWithTransactionsRoute.params.clientId).exists(),
    ],
    [mw.validateRequest, mw.requireLoggedIn],
    async (
      req: RequestWithCurrentUser<
        {},
        {
          [sessionWithTransactionsRoute.params.customerId]: string;
          [sessionWithTransactionsRoute.params.sessionKey]: string;
          [sessionWithTransactionsRoute.params.clientId]: string;
        }
      >,
      res: Response
    ) => {
      if (req.currentUser === undefined) {
        throw new Error("User undefined");
      }
      const customerId = req.query[sessionWithTransactionsRoute.params.customerId];
      const sessionKey = req.query[sessionWithTransactionsRoute.params.sessionKey];
      const queryClientId = req.query[sessionWithTransactionsRoute.params.clientId];

      try {
        const clientId = hasAdminAccess(req.currentUser.user_role)
          ? queryClientId
          : await db.superadmin.getClientId(req.currentUser?.organisation);

        const data = await Session.getSessionWithTransactions(clientId, customerId, sessionKey);
        res.json(data);
      } catch (e) {
        captureException(e);
        if (getErrorMessage(e) === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
      return undefined; // async function is supposed to return something
    }
  );

  const updateSessions = (payloadArray: UpdateSessionRequest[]) =>
    new Promise((resolve, reject) => {
      const results: boolean[] = [];

      let index = 0;
      function next() {
        if (index < payloadArray.length) {
          const payload = payloadArray[index];
          index += 1;
          Session.update(payload).then((data) => {
            results.push(data);
            next();
          }, reject);
        } else {
          resolve(results);
        }
      }
      // start first iteration
      next();
    });

  router[updateCaseStatusRoute.httpMethod](
    updateCaseStatusRoute.path,
    [],
    [mw.validateRequest, mw.requireLoggedIn],
    async (req: RequestWithUser, res: Response) => {
      if (req.currentUser === undefined) {
        throw new Error("User undefined");
      }
      const customerIds: string[] = req.body.customerIds as string[];
      const sessionKeys: string[] = req.body.sessionKeys as string[];
      const transactionIds: string[] = req.body.transactionIds as string[];
      const bodyClientId: string = req.body.clientId as string;
      const checkpoint: string = req.body.checkpoint as string;
      const queueName: string = req.body.queueName as string;

      const actionPayload = AllowListAttributes(req.body.data, ["status", "owner_id", "decision"]);

      try {
        const clientId = hasAdminAccess(req.currentUser.user_role)
          ? bodyClientId
          : await db.superadmin.getClientId(req.currentUser?.organisation);

        const updatePayloads: UpdateSessionRequest[] = [];
        sessionKeys.forEach((sKey, ind) => {
          const payload = {
            clientId,
            customerId: customerIds[ind],
            sessionKey: sKey,
            updated_data: actionPayload,
            owner: req.currentUser?.email || "",
            checkpoint,
            transactionID: transactionIds.length > ind ? transactionIds[ind] : "",
            queueName,
          };
          updatePayloads.push(payload);

          writeAuditLog(req, clientId, 0, AUDIT_LOG_TYPES.UPDATE_CASE, Object(payload));
        });

        const data = await updateSessions(updatePayloads);
        res.json(data);
      } catch (e) {
        captureException(e);
        if (getErrorMessage(e) === "NOT_FOUND") {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
      return undefined;
    }
  );

  return router;
};

export default sessionsRouter;
