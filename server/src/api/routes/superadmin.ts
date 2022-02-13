import express, { Response } from "express";
import { query, body } from "express-validator";
import { superAdminUrls } from "sardine-dashboard-typescript-definitions";
import { mw } from "../../commons/middleware";
import { db } from "../../commons/db";
import { AuthService } from "../../commons/AuthService";
import { isErrorWithSpecificMessage } from "../../utils/error-utils";
import { RequestWithUser, RevokeCredentialsRequest, GenerateCredentialRequest } from "../request-interface";

const { generateCredentialsRoute, getCredentialsRoute, revokeCredentialsRoute } = superAdminUrls.routes;

const router = express.Router();

const superAdminRouter = (authService: AuthService) => {
  router[getCredentialsRoute.httpMethod](
    getCredentialsRoute.path,
    [query("organisation").exists()],
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      const { organisation = "" } = req.query;
      try {
        const clientId = await db.superadmin.getClientId(organisation.toString());
        const { keys }: { keys: string[] } = await authService.getAllKeys(clientId);
        return res.json(keys);
      } catch (e) {
        if (isErrorWithSpecificMessage(e, "NOT_FOUND")) {
          return res.status(404).json({ error: `Invalid organisation name` });
        }
        throw e;
      }
    }
  );

  router[revokeCredentialsRoute.httpMethod](
    revokeCredentialsRoute.path,
    [body("uuid").exists(), body("clientID").exists()],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { uuid, clientID } = req.body as RevokeCredentialsRequest;
      await authService.revokeCredentials(clientID, uuid);
      return res.end();
    }
  );

  router[generateCredentialsRoute.httpMethod](
    generateCredentialsRoute.path,
    [body("organisation").exists()],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { organisation } = req.body as GenerateCredentialRequest;
      const clientId = await db.superadmin.getClientId(organisation);
      const result = await authService.generateNewCredentails(clientId);
      return res.status(200).json(result);
    }
  );

  return router;
};

export default superAdminRouter;
