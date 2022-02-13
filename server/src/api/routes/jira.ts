import express, { Response } from "express";
import { query } from "express-validator";
import { jiraUrls } from "sardine-dashboard-typescript-definitions";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { RequestWithUser } from "../request-interface";

const { createJiraTokenRoute, deleteJiraTokenRoute, getJiraTokenRoute } = jiraUrls.routes;

const router = express.Router();

const jiraRouter = () => {
  router[getJiraTokenRoute.httpMethod](
    getJiraTokenRoute.path,
    [query("clientId").exists()],
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const { clientId } = req.query;
      const result = await db.jira.getTokenData(clientId?.toString() || "");
      return res.json({ result });
    }
  );

  router[createJiraTokenRoute.httpMethod](
    createJiraTokenRoute.path,
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const { clientId, token, email, url } = req.body;

      const result = await db.jira.createToken(clientId, token, email, url);
      return res.status(200).json(result);
    }
  );

  router[deleteJiraTokenRoute.httpMethod](
    deleteJiraTokenRoute.path,
    [query("id").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: `Please provide id` });
      }
      const result = await db.jira.deleteToken(id!.toString());
      return res.status(200).json(result);
    }
  );

  return router;
};

export default jiraRouter;
