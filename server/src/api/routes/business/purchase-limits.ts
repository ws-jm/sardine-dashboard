import express, { NextFunction, Response } from "express";
import { PurchaseLimitRequestBody, purchaseLimitUrls } from "sardine-dashboard-typescript-definitions";
import { body, query } from "express-validator";
import * as Sentry from "@sentry/node";
import { business_db, db } from "../../../commons/db";
import { mw } from "../../../commons/middleware";
import { RequestWithUser } from "../../request-interface";

const { createPurchaseLimitRoute, deletePurchaseLimitsRoute, getPurchaseLimitsRoute, updatePurchaseLimitRoute } =
  purchaseLimitUrls.routes;

const router = express.Router();

const purchaseLimitsRouter = () => {
  router[getPurchaseLimitsRoute.httpMethod](
    getPurchaseLimitsRoute.path,
    [query("organisation").exists().isString()],
    mw.validateRequest,
    mw.requireSuperAdmin,
    async (req: RequestWithUser, res: Response) => {
      const { organisation = "" } = req.query;
      try {
        const client_id = (await db.organisation.getClientId(organisation.toString())) || "";
        const result = await business_db.purchaseLimit.getPurchaseLimitsByClientID(client_id);
        return res.json({ result });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[createPurchaseLimitRoute.httpMethod](
    createPurchaseLimitRoute.path,
    [query("organisation").exists().isString()],
    mw.validateRequest,
    mw.requireSuperAdmin,
    async (req: RequestWithUser<PurchaseLimitRequestBody>, res: Response, next: NextFunction) => {
      const { organisation = "" } = req.query;
      try {
        const client_id = (await db.organisation.getClientId(organisation.toString())) || "";
        req.body.client_id = client_id;
        const result = await business_db.purchaseLimit.createPurchaseLimit(req.body);
        return res.json({ result });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(409).json({ error: "Failed to create" });
      }
    }
  );

  router[updatePurchaseLimitRoute.httpMethod](
    updatePurchaseLimitRoute.path,
    [body("id").exists().isInt(), query("organisation").exists().isString()],
    mw.validateRequest,
    mw.requireSuperAdmin,
    async (req: RequestWithUser<PurchaseLimitRequestBody>, res: Response, next: NextFunction) => {
      const { organisation = "" } = req.query;
      try {
        const client_id = (await db.organisation.getClientId(organisation.toString())) || "";
        req.body.client_id = client_id;
        const result = await business_db.purchaseLimit.updatePurchaseLimit(req.body);
        return res.json({ result });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(409).json({ error: "Failed to update" });
      }
    }
  );

  router[deletePurchaseLimitsRoute.httpMethod](
    deletePurchaseLimitsRoute.path,
    [query("id").exists().isInt()],
    mw.validateRequest,
    mw.requireSuperAdmin,
    async (req: RequestWithUser, res: Response) => {
      const { id = -1 } = req.query;
      try {
        const result = await business_db.purchaseLimit.deletePurchaseLimit(parseInt(id.toString(), 10));
        return res.json({ result });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );
  return router;
};

export default purchaseLimitsRouter;
