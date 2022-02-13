import express, { Response } from "express";
import { query } from "express-validator";
import { integrationHealthCheckUrls, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { mw } from "../../commons/middleware";
import { IntegrationHealthCheckBigQuery } from "../../commons/BigQuery/integration-health-check";
import { RequestWithUser } from "../request-interface";

const router = express.Router();

const {
  inboundRequest: queryInboundRequestUrl,
  outboundRequest: queryOutboundRequestUrl,
  events: queryEventsUrl,
} = integrationHealthCheckUrls.routes;

const DEFAULT_DAY_FILTER = 3;

const createFilteredParams = (clientId?: AnyTodo, day?: AnyTodo) => ({
  clientId: clientId ? String(clientId) : "",
  day: parseInt(String(day), 10) || DEFAULT_DAY_FILTER,
});

const integrationHealthCheckRouter = () => {
  router[queryOutboundRequestUrl.httpMethod](
    queryOutboundRequestUrl.path,
    query("client_id").optional().isString(),
    query("day").optional().isInt(),
    [mw.validateRequest, mw.requireAdminAccess],
    async (req: RequestWithUser, res: Response) => {
      const { client_id: clientId, day } = req.query;
      const data = await IntegrationHealthCheckBigQuery.queryOutboundRequests(createFilteredParams(clientId, day));
      res.json(data);
    }
  );
  router[queryEventsUrl.httpMethod](
    queryEventsUrl.path,
    query("client_id").optional().isString(),
    query("day").optional().isInt(),
    [mw.validateRequest, mw.requireAdminAccess],
    async (req: RequestWithUser, res: Response) => {
      const { client_id: clientId, day } = req.query;
      const data = await IntegrationHealthCheckBigQuery.queryEvents(createFilteredParams(clientId, day));
      res.json(data);
    }
  );
  router[queryInboundRequestUrl.httpMethod](
    queryInboundRequestUrl.path,
    query("client_id").optional().isString(),
    query("day").optional().isInt(),
    [mw.validateRequest, mw.requireAdminAccess],
    async (req: RequestWithUser, res: Response) => {
      const { client_id: clientId, day } = req.query;

      const data = await IntegrationHealthCheckBigQuery.queryInboundRequests(createFilteredParams(clientId, day));
      res.json(data);
    }
  );

  return router;
};

export default integrationHealthCheckRouter;
