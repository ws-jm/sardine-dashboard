import express, { Response } from "express";
import { query, body } from "express-validator";
import { BigQuery } from "@google-cloud/bigquery";
import moment from "moment";
import * as Sentry from "@sentry/node";
import {
  MULTI_ORG_ADMIN,
  RuleFeatureStatsRequestBody,
  ruleUrls,
  SARDINE_ADMIN,
  AUDIT_LOG_TYPES,
  AnyTodo,
} from "sardine-dashboard-typescript-definitions";
import { db } from "../../commons/db";
import { mw } from "../../commons/middleware";
import { RequestWithUser } from "../request-interface";
import { RuleService } from "../../commons/RuleService";
import { getErrorMessage, isErrorWithResponse } from "../../utils/error-utils";
import { RulePerformance } from "../../commons/models/datastore/rule-performance";
import { writeAuditLog } from "../utils/routes/audit";

const {
  listRuleRoute,
  getRuleDetailsRoute,
  createRuleRoute,
  disableRuleRoute,
  orderRuleRoute,
  updateRuleRoute,
  getRuleStatsRoute,
  getExecutionsRoute,
  getFeatureStatsRoute,
  getRulePerformance,
  getCreatingdRuleStatsRoute,
} = ruleUrls.routes;

const router = express.Router();
const bigqueryClient = new BigQuery();
const runQuery = async (queryString: string, params: object) => {
  const options = {
    query: queryString,
    location: "US",
    params,
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const [rows] = await job.getQueryResults();
  return rows;
};

const queryMatchedRules = async (sessionKey: string, date: string): Promise<string[]> => {
  const queryString = `WITH tmp AS 
  (
    SELECT 
      result.rules_matched,
      RANK() OVER(PARTITION BY session_key, checkpoint ORDER BY timestamp DESC) as rank
    FROM structured_logs.rule_evaluation_logs 
    WHERE DATE(timestamp)="${date}" AND session_key="${sessionKey.replace(/ /g, "+")}"
  )
  SELECT rules_matched FROM tmp WHERE rank=1 LIMIT 100`;
  const rows = await runQuery(queryString, {});
  return rows.length > 0 ? [...new Set(rows.map((r) => r.rules_matched).flat())] : [];
};

const rulesRouter = (ruleService: RuleService) => {
  router[listRuleRoute.httpMethod](
    listRuleRoute.path,
    [query("clientId", "checkpoint").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const clientId: string = req.query.clientId as string;
      const checkpoint: string = req.query.checkpoint as string;
      const payload = {
        clientID: clientId,
        checkpoint: checkpoint.toLowerCase(),
      };
      try {
        const { rules } = await ruleService.getRulesList(payload);
        return res.json(rules);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(406).json({
          error: getErrorMessage(e, { fallbackMessage: "Failed to load rules" }),
        });
      }
    }
  );

  router[getRuleDetailsRoute.httpMethod](
    getRuleDetailsRoute.path,
    [query("ruleID").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const ruleID: string = req.query.ruleID as string;

      const payload = {
        ruleID,
      };

      try {
        const result = await ruleService.getRuleDetails(payload);
        return res.json(result);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(406).json({
          error: getErrorMessage(e, { fallbackMessage: "Failed to load rules" }),
        });
      }
    }
  );

  router[getCreatingdRuleStatsRoute.httpMethod](
    getCreatingdRuleStatsRoute.path,
    [body(["rule", "clientID", "checkpoint"]).exists()],
    mw.validateRequest,
    mw.requireUserAccess,
    (_: RequestWithUser, res: Response) => {
      // TBC: sardine.atlassian.net/browse/ENG-1184
      res.send(200).end();
    }
  );

  router[createRuleRoute.httpMethod](
    createRuleRoute.path,
    [body(["rule", "clientID", "checkpoint"]).exists()],
    mw.validateRequest,
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const data = req.body;
      try {
        const { rule } = await ruleService.createNewRule(data);

        const { clientID } = data;
        const { id } = rule;
        writeAuditLog(req, clientID, parseInt(id, 10), AUDIT_LOG_TYPES.CREATE_RULE, data);

        return res.json(rule);
      } catch (e) {
        if (isErrorWithResponse(e)) {
          Sentry.captureException(e);
          const rsp = e.response;
          let code = 406;
          let message = "Failed to add rule";
          if (rsp) {
            if (rsp.status) {
              code = parseInt(rsp.status, 10);
            }
            const isSuperAdmin = req.currentUser && req.currentUser.user_role === "sardine_admin";
            if (rsp.data && isSuperAdmin) {
              message = JSON.stringify(rsp.data);
            }
          }
          return res.status(code).json({ error: message });
        }
      }
    }
  );

  router[disableRuleRoute.httpMethod](
    disableRuleRoute.path,
    [body(["ruleID", "clientId"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn, // Logged-in client can disable global rules applied to them.
    async (req: RequestWithUser<{ ruleId: number; clientId: string }>, res: Response) => {
      if (!req.currentUser) {
        throw new Error("Current user is not defined");
      }

      const { ruleId = "", clientId = "" } = req.body;

      if (!clientId) {
        throw new Error("Client id not found");
      }

      try {
        const result = await ruleService.createRuleDisabling(req.body);
        const id = parseInt(ruleId.toString(), 10);
        writeAuditLog(req, clientId, id, AUDIT_LOG_TYPES.DISABLE_RULE, result);

        return res.json(result);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json(e);
      }
    }
  );

  router[orderRuleRoute.httpMethod](
    orderRuleRoute.path,
    [body(["order", "checkpoint"]).exists()],
    mw.validateRequest,
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const data = req.body;
      try {
        const { rule } = await ruleService.orderRule(data);

        const clientID = await db.superadmin.getClientId(req.currentUser?.organisation || "");
        writeAuditLog(req, clientID, 0, AUDIT_LOG_TYPES.SORT_RULE, data);

        return res.json(rule);
      } catch (e) {
        if (isErrorWithResponse(e)) {
          Sentry.captureException(e);
          const rsp = e.response;
          let code = 406;
          let message = "Failed to update rule";
          if (rsp) {
            if (rsp.status) {
              code = parseInt(rsp.status, 10);
            }
            const isSuperAdmin = req.currentUser && req.currentUser.user_role === "sardine_admin";
            if (rsp.data && isSuperAdmin) {
              message = JSON.stringify(rsp.data);
            }
          }
          return res.status(code).json({ error: message });
        }
      }
    }
  );

  router[updateRuleRoute.httpMethod](
    updateRuleRoute.path,
    [body(["rule", "clientID", "checkpoint"]).exists()],
    mw.validateRequest,
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const data = req.body;
      try {
        const { rule } = await ruleService.updateRule(data);

        const { clientID } = data;
        const { id } = rule;
        const ruleId = parseInt(id.toString(), 10);
        writeAuditLog(req, clientID, ruleId, AUDIT_LOG_TYPES.UPDATE_RULE, rule);

        return res.json(rule);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(406).json({
          error: getErrorMessage(e, { fallbackMessage: "Failed to update rule" }),
        });
      }
    }
  );

  router[getRuleStatsRoute.httpMethod](
    getRuleStatsRoute.path,
    [query(["ruleId", "days", "clientId"]).exists()],
    mw.validateRequest,
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const ruleId: string = req.query.ruleId as string;
      const days: string = req.query.days as string;
      const clientID: string = req.query.clientId as string;

      const payload = {
        ruleID: parseInt(ruleId, 10),
        days: parseInt(days, 10),
        clientID,
      };
      try {
        const { stats } = await ruleService.getRuleStats(payload);
        return res.json(stats);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(406).json({
          error: getErrorMessage(e, { fallbackMessage: "Failed to get rules stats" }),
        });
      }
    }
  );

  router[getRulePerformance.httpMethod](
    getRulePerformance.path,
    mw.validateRequest,
    mw.requireLoggedIn,
    async (_: RequestWithUser, res: Response) => {
      try {
        const rulesPerformance = await RulePerformance.getLatest();
        return res.json({ rules_performance: rulesPerformance });
      } catch (e) {
        Sentry.addBreadcrumb({ message: "error loading rules performance data" });
        Sentry.captureException(e);
        return res.status(406).json({
          error: getErrorMessage(e, { fallbackMessage: "Failed to get rules performance" }),
        });
      }
    }
  );

  router[getExecutionsRoute.httpMethod](
    getExecutionsRoute.path,
    [query(["date", "sessionKey", "clientId"]).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const date: string = req.query.date as string;
      const sessionKey: string = req.query.sessionKey as string;
      const clientId: string = req.query.clientId as string;

      try {
        const { rules } = await ruleService.getRulesList({ clientID: clientId });
        const matchedRules = await queryMatchedRules(sessionKey, date);
        const result = rules.filter((r: AnyTodo) => matchedRules.includes(r.id));
        return res.json(result);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(406).json({
          error: getErrorMessage(e, { fallbackMessage: "Failed to get rules execution" }),
        });
      }
    }
  );

  router[getFeatureStatsRoute.httpMethod](
    getFeatureStatsRoute.path,
    [body(["feature", "datatype"]).exists(), query("organisation").exists()],
    mw.validateRequest,
    mw.requireUserAccess,
    async (req: RequestWithUser<RuleFeatureStatsRequestBody>, res: Response) => {
      const data = req.body;
      const organisation: string = req.query.organisation as string;
      const { feature, datatype } = data;
      const featureName = feature.split(".").map(toLowerCamel).join(".");
      let result: string[][];
      try {
        const admins = [SARDINE_ADMIN.toString(), MULTI_ORG_ADMIN.toString()];
        const org = admins.includes((req.currentUser && req.currentUser?.user_role) || "")
          ? organisation
          : req.currentUser?.organisation || "";

        if (org === "") {
          return res.status(400).json({ error: `Invalid request` });
        }

        const clientID = (await db.organisation.getClientId(org)) || "";
        if (datatype === "string" || datatype === "bool") {
          result = await queryTopValues(clientID, featureName);
        } else {
          result = await queryBins(clientID, featureName);
        }
        res.json({ result });
      } catch (e) {
        res.json({ result: [], error: e });
        Sentry.addBreadcrumb({ message: "error loading data" });
        Sentry.captureException(e);
      }
    }
  );

  return router;
};

const toLowerCamel = (s: string) => {
  const result = `${s[0].toLowerCase()}${s.substring(1)}`;
  if (result.toLowerCase() === "osanomaly") {
    return "osAnomaly";
  }
  return result;
};

const queryBinsHelper = (numOfBins: number, binSize: number) => {
  const binLabels = [];
  const caseQuery = [];
  const value = `cast(json_extract_scalar(env, @feature) as float64)`;
  for (let i = 0; i < numOfBins; i++) {
    const left = Math.round(i * binSize * 100) / 100;
    const right = Math.round((i + 1) * binSize * 100) / 100;
    let label = "";
    if (i === 0) {
      label = `less than ${right}`;
      caseQuery.push(`when ${value} < ${right} then '${label}'`);
    } else if (i < numOfBins - 1) {
      label = `${left} < ${right}`;
      caseQuery.push(`when ${value} < ${right} then '${label}'`);
    } else {
      label = `greater than ${left}`;
      caseQuery.push(`else '${label}'`);
    }
    binLabels.push(label);
  }
  return { binLabels, caseQuery };
};

const queryCountBinsHelper = (numOfBins: number) => {
  const binLabels = [];
  const caseQuery = [];
  const value = `cast(json_extract_scalar(env, @feature) as int64)`;
  for (let i = 0; i < numOfBins; i++) {
    let label = "";
    if (i < numOfBins - 1) {
      label = `${i + 1}`;
      caseQuery.push(`when ${value} = ${i + 1} then '${label}'`);
    } else {
      label = `greater than ${i}`;
      caseQuery.push(`when ${value} > ${i} then '${label}'`);
    }
    binLabels.push(label);
  }
  return { binLabels, caseQuery };
};

const queryBins = async (clientID: string, feature: string, min?: number, max?: number): Promise<string[][]> => {
  min = min || 0;
  if (!max && max !== 0) {
    max = 100;
  }
  const isCountFeature = feature.toLowerCase().includes(".count");
  const numOfBins = 10;
  const binSize = ((max - min) * 1.0) / numOfBins;
  const { binLabels, caseQuery } = isCountFeature ? queryCountBinsHelper(numOfBins) : queryBinsHelper(numOfBins, binSize);
  const limit = 10000;
  const query = `WITH tmp as (SELECT
    CASE
      ${caseQuery.join("\n")}
    END as feature
    FROM structured_logs.rule_evaluation_logs
    WHERE DATE(timestamp) >= "${getCutoffDate()}" 
    AND json_extract(env, @feature) IS NOT NULL
    ${clientIDClause(clientID)}
    LIMIT ${limit})
    SELECT
      feature,
      count(*) / ${limit / 100} as count
      FROM tmp
    GROUP BY 1
    ORDER BY 1`;
  const rows = await runQuery(query, { feature: `$.${feature}` });
  const resultMap = new Map();
  rows.forEach((row) => resultMap.set(row.feature, row.count));
  return binLabels.map((label) => [label, resultMap.get(label) || "0"]);
};

const clientIDClause = (clientID?: string) => {
  if (!clientID || clientID.toLowerCase() === "all") {
    return "";
  }
  return `AND client_id='${clientID}'`;
};

const queryTopValues = async (clientID: string, feature: string): Promise<string[][]> => {
  const limit = 10000;
  const query = `WITH tmp as (
    SELECT 
      json_extract_scalar(env, @feature) as feature,
    FROM structured_logs.rule_evaluation_logs 
    WHERE DATE(timestamp) >= "${getCutoffDate()}" 
    AND json_extract(env, @feature) IS NOT NULL
    ${clientIDClause(clientID)}
    LIMIT ${limit})
    SELECT
        feature,
        count(*) / ${limit / 100} as count
        FROM tmp
    GROUP BY 1
    ORDER BY 2 DESC 
    LIMIT 10
  `;
  const rows = await runQuery(query, { feature: `$.${feature}` });
  return rows.map((row) => [row.feature, row.count]);
};

const getCutoffDate = () => {
  let t = moment().utc();
  if (t.hour() > 12) {
    t = t.subtract(1, "day");
  }
  return t.format("YYYY-MM-DD");
};

export default rulesRouter;
