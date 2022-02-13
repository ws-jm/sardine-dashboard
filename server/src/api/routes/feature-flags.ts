import { UnleashService } from "src/commons/UnleashService";
import { featureFlagUrls } from "sardine-dashboard-typescript-definitions";
import express, { Response } from "express";
import { db } from "../../commons/db";
import { mw } from "../../commons/middleware";
import { getFeaturesMatchEnv, getOrganisationIdsFromFeature } from "../utils/getOrganisationIdsFromFeature";

const router = express.Router();

const { getAllFeatureFlagsRoute } = featureFlagUrls.routes;

const featureFlagsRouter = (unleashSevice: UnleashService) => {
  router[getAllFeatureFlagsRoute.httpMethod](
    getAllFeatureFlagsRoute.path,
    mw.requireLoggedIn,
    mw.requireAdminAccess,
    async (_, res: Response) => {
      const { features } = (await unleashSevice.getFeatures()) || {};
      if (!Array.isArray(features)) {
        throw new Error("features isnt an array");
      }

      const organisationIds = new Set();

      const filteredFeatures = getFeaturesMatchEnv(features);

      filteredFeatures.forEach((feature) => {
        const orgIds = getOrganisationIdsFromFeature(feature);

        orgIds.forEach((orgId) => organisationIds.add(orgId));
      });

      const organisations = await db.organisation.getFeatureOrganisations(Array.from(organisationIds) as string[]);

      const organisationsById: Record<string, { name: string }> = {};
      organisations.forEach((organisation) => {
        organisationsById[organisation.clientid] = organisation;
      });

      const formattedFeatures = filteredFeatures.map((feature) => {
        const orgIds = getOrganisationIdsFromFeature(feature);
        const organisations = orgIds.map((orgId) => organisationsById[orgId]).filter((org) => org);

        return {
          merchantNames: organisations.map((org) => org.name),
          featureFlagNames: feature.name,
        };
      });

      res.status(200).json(formattedFeatures);
    }
  );

  return router;
};

export default featureFlagsRouter;
