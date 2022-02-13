import express, { Response } from "express";
import config from "config";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/node";
import {
  Organization,
  OrganizationUser,
  FeatureFlag,
  GetOrganisationFeatureFlagsResponse,
  organisationUrls,
  SendNotificationRequest,
  AnyTodo,
  isClientIdObject,
} from "sardine-dashboard-typescript-definitions";
import { query, body, param } from "express-validator";
import { UnleashService } from "src/commons/UnleashService";
import { db } from "../../commons/db";
import { mw } from "../../commons/middleware";
import { sendMultipleInviteEmail, sendInviteEamil, sendAdminBroadcast } from "../../commons/email";
import { RequestWithUser } from "../request-interface";
import { groupBy } from "../../commons/helpers";
import { getFeaturesMatchEnv, getOrganisationIdsFromFeature } from "../utils/getOrganisationIdsFromFeature";
import { captureException } from "../../utils/error-utils";

const { getFeatureFlagsOfOrganisationRoute, getClientIdRoute } = organisationUrls.routes;

const router = express.Router();

const organisationRouter = (unleashSevice: UnleashService) => {
  router[getFeatureFlagsOfOrganisationRoute.httpMethod](
    getFeatureFlagsOfOrganisationRoute.path,
    [param("clientID").isUUID().exists()],
    mw.requireAdminAccess,
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const enabledFeatureFlags: FeatureFlag[] = [];
      const disabledFeatureFlags: FeatureFlag[] = [];
      const filteredOrgId = req.params.clientID;

      const { features } = (await unleashSevice.getFeatures()) || {};

      if (!Array.isArray(features)) {
        throw new Error("features is not an array");
      }

      const filteredFeatures = getFeaturesMatchEnv(features);

      filteredFeatures.forEach((feature) => {
        const orgIds = getOrganisationIdsFromFeature(feature);
        if (orgIds.includes(filteredOrgId)) {
          enabledFeatureFlags.push(feature);
          return;
        }

        disabledFeatureFlags.push(feature);
      });

      const result: GetOrganisationFeatureFlagsResponse = {
        enabledFeatureFlagNames: enabledFeatureFlags.map((f) => f.name),
        disabledFeatureFlagNames: disabledFeatureFlags.map((f) => f.name),
      };

      res.json(result);
    }
  );

  router.get(
    `/fetch-invitations`,
    [query("organisation").exists()],
    mw.validateRequest,
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      try {
        const { organisation = "" } = req.query;
        const invitations = await db.organisation.fetchInvitations(organisation.toString());
        return res.json(invitations);
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router.post(
    "/generate-send-invite",
    [body(["organisation", "emails", "link"]).exists()],
    mw.validateRequest,
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      const { organisation = "", emails = [], link = "" } = req.body;
      try {
        const tokens: string[] = await db.organisation.generateInvitations(organisation.toString(), emails as string[]);
        const emailConfigList = (emails as string[]).map((value, index) => ({ email: value, token: tokens[index] }));
        await sendMultipleInviteEmail(emailConfigList, link);
        return res.end();
      } catch (e) {
        Sentry.captureException(e);
        return res.status(400).json({ error: "failed to generate invitation" });
      }
    }
  );

  router.post(
    "/email-invite",
    [body("email").exists(), body("link").exists()],
    mw.validateRequest,
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      const { email = "", link = "" } = req.body;
      try {
        await sendInviteEamil(email.toString(), link.toString());
        return res.end();
      } catch (e) {
        Sentry.captureException(e);
        return res.status(400).json({ error: "failed to email invitation" });
      }
    }
  );

  router.get("/metabase-token", mw.requireLoggedIn, (_req, res) => {
    try {
      const { organisation = "" } = _req.query;
      const payload = {
        resource: {
          dashboard: config.get("METABASE_DASHBOARD_ID"),
          merchname: organisation,
        },
        params: {
          merchname: organisation,
        },
        exp: Math.round(Date.now() / 1000) + 20 * 60,
      };

      if (!process.env.METABASE_SECRET_KEY) {
        return res.status(400).json({ error: "INVALID_REQUEST" });
      }

      const token = jwt.sign(payload, process.env.METABASE_SECRET_KEY);
      const url = `${config.get("METABASE_SITE_URL")}/embed/dashboard/${token}`;
      return res.json({ url });
    } catch (e) {
      Sentry.captureException(e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  // this only works in prod
  router.get("/metabase-token-relay", mw.requireLoggedIn, (req: RequestWithUser, res) => {
    try {
      if (req.currentUser?.organisation !== "relayfi") {
        return res.status(401).json({ error: "INVALID_REQUEST" });
      }
      const payload = {
        resource: {
          dashboard: 85,
        },
        params: {},
        exp: Math.round(Date.now() / 1000) + 20 * 60,
      };

      if (!process.env.METABASE_SECRET_KEY) {
        return res.status(400).json({ error: "INVALID_REQUEST" });
      }

      const token = jwt.sign(payload, process.env.METABASE_SECRET_KEY);
      const url = `${config.get("METABASE_SITE_URL")}/embed/dashboard/${token}`;
      return res.json({ url });
    } catch (e) {
      Sentry.captureException(e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  router.get(
    getClientIdRoute.path,
    [query(getClientIdRoute.params.organisation).exists()],
    mw.validateRequest,
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      try {
        const { organisation = "" } = req.query;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const client_id = await db.organisation.getClientId(organisation.toString());
        const response = { client_id };
        if (isClientIdObject(response)) {
          return res.json({ client_id });
        }
        captureException(new Error("client_id type from the DB is different from expected"));
        return res.status(500).json({ error: "internal error" });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router.get("/list", [], mw.requireLoggedIn, mw.requireAdminAccess, async (req: RequestWithUser, res: Response) => {
    try {
      const organisationID = req.currentUser?.organisation_id || "";
      const organisations = await db.organisation.getOrganisations(organisationID);
      return res.json({ organisations });
    } catch (e) {
      Sentry.captureException(e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  router.get("/admin-list", [], mw.requireLoggedIn, mw.requireAdminAccess, async (req: RequestWithUser, res: Response) => {
    try {
      const organisationID = req.currentUser?.organisation_id || "";
      const organisations = await db.organisation.getAdminOrganisations(organisationID);

      const groupedData = groupBy(organisations, "client_id");

      let results: Organization[] = [];
      Object.entries(groupedData).forEach((group) => {
        const [key, value] = group;
        const orgs = value as AnyTodo[];
        if (key !== null && orgs.length > 0) {
          const orgName: string = orgs[0].display_name;
          const orgID: string = orgs[0].client_id;
          const users: OrganizationUser[] = [];

          orgs.forEach((org: AnyTodo) => {
            if (org.id && !org.deleted_at) {
              users.push({
                id: org.id,
                name: org.name,
                email: org.email,
                organisation: org.display_name,
                is_email_verified: org.is_email_verified,
              });
            }
          });

          results = [
            ...results,
            {
              name: orgName,
              clientID: orgID,
              users,
            },
          ];
        }
      });

      return res.json(results);
    } catch (e) {
      Sentry.captureException(e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  router.post(
    "/notification",
    [body("subject").exists(), body("users").exists(), body("message").exists()],
    mw.validateRequest,
    mw.requireSuperAdmin,
    async (req: RequestWithUser, res: Response) => {
      const { subject = "", users = [], message = "" } = req.body as SendNotificationRequest;
      try {
        if (users.length > 0) {
          await sendAdminBroadcast(subject, users, message);
          return res.end();
        }
        return res.status(400).json({ error: "no users to send email" });
      } catch (e) {
        Sentry.captureException(e);
        return res.status(400).json({ error: "failed to send emails" });
      }
    }
  );

  return router;
};

export default organisationRouter;
