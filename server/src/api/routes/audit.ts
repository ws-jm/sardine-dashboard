import express, { Response } from "express";
import { body } from "express-validator";
import { auditUrls, LogsListRequestBody } from "sardine-dashboard-typescript-definitions";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { RequestWithUser } from "../request-interface";

const router = express.Router();

const { listLogs } = auditUrls.routes;

const auditRouter = () => {
  const clientFromOrganization = async (req: RequestWithUser, res: Response): Promise<string> => {
    const { organisation = "" } = req.query;
    const clientId = await db.organisation.getClientId(organisation.toString());

    if (!clientId) {
      res.status(400).json({ error: "Invalid request" });

      return "";
    }

    return clientId;
  };

  router[listLogs.httpMethod](
    listLogs.path,
    [body(["startDate", "endDate", "offset", "limit"]).exists()],
    mw.requireUserAccess,
    async (req: RequestWithUser, res: Response) => {
      const { startDate, endDate, offset, limit } = req.body as LogsListRequestBody;

      const clientId = await clientFromOrganization(req, res);
      if (clientId !== "") {
        const result = await db.audit.getLogs(clientId, startDate, endDate, offset, limit);
        return res.json({ result });
      }

      return undefined;
    }
  );

  return router;
};

export default auditRouter;
