import express, { Response } from "express";
import { query } from "express-validator";
import { BigQuery, QueryRowsResponse } from "@google-cloud/bigquery";
import {
  dataDistributionUrls,
  DeviceSessionRiskLevelBreakdownRow,
  CustomerRiskLevelDistributionRow,
  isChartName,
  CHART_NAMES,
  ALL,
  getFailureResult,
  getSuccessResult,
  isFailure,
} from "sardine-dashboard-typescript-definitions";
import { captureException, getErrorMessage } from "../../utils/error-utils";
import {
  customerEmailRiskLevelDistributionSql,
  customerRiskLevelSessionDistributionSql,
  deviceSessionRiskLevelBreakdownSql,
} from "../../sql/data-distribution-sql";
import { db } from "../../commons/db";
import { mw } from "../../commons/middleware";
import { RequestWithUser } from "../request-interface";

const DATE_INTERVAL = 14;

const { getChartValues } = dataDistributionUrls.routes;

const isDeviceSessionRiskLevelBreakdownRows = (data: unknown): data is DeviceSessionRiskLevelBreakdownRow[] =>
  data !== undefined && data !== null && Array.isArray(data as DeviceSessionRiskLevelBreakdownRow[]);

const isCustomerRiskLevelDistributionRows = (data: unknown): data is CustomerRiskLevelDistributionRow[] =>
  data !== undefined && data !== null && Array.isArray(data as CustomerRiskLevelDistributionRow[]);

const bigqueryClient = new BigQuery();
const runQuery = async ({
  query: queryValue,
  params,
}: {
  query: string;
  params?: { [param: string]: string | number };
}): Promise<QueryRowsResponse> => {
  const options = {
    query: queryValue,
    params,
    location: "US",
  };

  const [job] = await bigqueryClient.createQueryJob(options);
  const result = await job.getQueryResults();
  return result;
};

const router = express.Router();

const dataDistributionRouter = () => {
  router[getChartValues.httpMethod](
    getChartValues.path,
    [query("organisation").exists(), query("chart").exists()],
    mw.requireUserAccess,
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const org = String(req.query.organisation);
      const chart = String(req.query.chart);
      const isAllClients = org === ALL;
      let clientId: string = ALL;
      if (!isAllClients) {
        try {
          const result = await db.organisation.getClientIdResult(org);
          if (isFailure(result)) {
            const error = getFailureResult(result);
            captureException(error);
            return res.status(500).json({
              error: getErrorMessage(error),
            });
          }
          clientId = getSuccessResult(result);
        } catch (error) {
          captureException(error);
          return res.status(500).json({
            error: getErrorMessage(error),
          });
        }
      }
      if (!isChartName(chart)) {
        return res.status(400).json({
          error: "Invalid request. chart param is not valid",
        });
      }
      const params = {
        [CHART_NAMES.DEVICE_SESSION_RISK_LEVEL_BREAKDOWN]: { dateInterval: DATE_INTERVAL, clientId },
        [CHART_NAMES.CUSTOMER_RISK_LEVEL_SESSION_DISTRIBUTION]: { dateInterval: DATE_INTERVAL, clientId },
        [CHART_NAMES.CUSTOMER_EMAIL_RISK_LEVEL_DISTRIBUTION]: { dateInterval: DATE_INTERVAL, clientId },
      }[chart];
      const bigQuerySql = {
        [CHART_NAMES.DEVICE_SESSION_RISK_LEVEL_BREAKDOWN]: deviceSessionRiskLevelBreakdownSql({
          isAllClients,
        }),
        [CHART_NAMES.CUSTOMER_RISK_LEVEL_SESSION_DISTRIBUTION]: customerRiskLevelSessionDistributionSql({
          isAllClients,
        }),
        [CHART_NAMES.CUSTOMER_EMAIL_RISK_LEVEL_DISTRIBUTION]: customerEmailRiskLevelDistributionSql({
          isAllClients,
        }),
      }[chart];
      const typeGuard = {
        [CHART_NAMES.DEVICE_SESSION_RISK_LEVEL_BREAKDOWN]: isDeviceSessionRiskLevelBreakdownRows,
        [CHART_NAMES.CUSTOMER_RISK_LEVEL_SESSION_DISTRIBUTION]: isCustomerRiskLevelDistributionRows,
        [CHART_NAMES.CUSTOMER_EMAIL_RISK_LEVEL_DISTRIBUTION]: isCustomerRiskLevelDistributionRows,
      }[chart];
      try {
        const pagedRows = await runQuery({ query: bigQuerySql, params });
        const rows = pagedRows[0]; // We just use the first page of results
        if (!typeGuard(rows)) {
          return res.status(500).json({
            error: "Invalid response from BigQuery",
          });
        }

        return res.status(200).json({
          rows,
        });
      } catch (e) {
        captureException(e);
        const errorMessage = getErrorMessage(e);
        return res.status(500).json({
          error: errorMessage,
        });
      }
    }
  );

  return router;
};

export default dataDistributionRouter;
