import express, { Response } from "express";
import { body, query } from "express-validator";
import {
  CreateBlockAllowlistRequestBody,
  UpdateBlockAllowlistRequestBody,
  allowListUrls,
} from "sardine-dashboard-typescript-definitions";
import * as Sentry from "@sentry/node";
import { business_db, db } from "../../../commons/db";
import { mw } from "../../../commons/middleware";
import { RequestWithUser } from "../../request-interface";

const router = express.Router();

const {
  routes: { addNewAllowListRoute, deleteNewAllowListRoute, getAllowListRoute, updateNewAllowListRoute },
} = allowListUrls;

const allowlistRouter = () => {
  router[getAllowListRoute.httpMethod](
    getAllowListRoute.path,
    [query("organisation").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const { organisation = "" } = req.query;
      try {
        const client_id = (await db.organisation.getClientId(organisation.toString())) || "";
        const result = await business_db.allowlist.getAllowlist(client_id);
        return res.json({ result });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[addNewAllowListRoute.httpMethod](
    addNewAllowListRoute.path,
    [body("organisation").exists().isString(), body("data").exists(), body("scope").exists().isString(), body("expiry").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser<CreateBlockAllowlistRequestBody>, res: Response) => {
      const { organisation } = req.body;
      try {
        const clientId = (req.body.client_id || "").toString();
        const client_id = clientId.length > 0 ? clientId : await db.organisation.getClientId(organisation.toString());

        if (client_id) {
          const result = await business_db.allowlist.addToAllowlist(req.body, client_id, req.currentUser?.id || "");
          return res.json({ result });
        }
        return res.status(400).json({ error: "Missing organization details" });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(409).json({ error: "Failed to blocklist user" });
      }
    }
  );

  router[updateNewAllowListRoute.httpMethod](
    updateNewAllowListRoute.path,
    [
      body("id").exists().isString(),
      body("organisation").exists().isString(),
      body("type").exists().isString(),
      body("scope").exists().isString(),
      body("value").exists().isString(),
      body("expiry").exists(),
    ],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser<UpdateBlockAllowlistRequestBody>, res: Response) => {
      const { id, organisation } = req.body;
      try {
        const client_id = await db.organisation.getClientId(organisation.toString());

        if (client_id) {
          const result = await business_db.allowlist.updateAllowlist(id, req.body, client_id);
          return res.json({ result });
        }
        return res.status(400).json({ error: "Organization not found" });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(409).json({ error: "Failed to update allowlist user" });
      }
    }
  );

  router[deleteNewAllowListRoute.httpMethod](
    deleteNewAllowListRoute.path,
    [query("id").exists(), query("organisation").exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const { id = "", organisation = "" } = req.query;
      try {
        const client_id = (await db.organisation.getClientId(organisation.toString())) || "";
        const result = await business_db.allowlist.removeFromAllowlist(id.toString(), client_id);
        return res.json({ result });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  return router;
};

export default allowlistRouter;
