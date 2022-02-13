import express from "express";
import {
  dataDistributionUrls,
  documentVerificationsUrls,
  integrationHealthCheckUrls,
  authUrls,
  ruleUrls,
  searchUrls,
  featureFlagUrls,
  organisationUrls,
  feedbackUrls,
  auditUrls,
  customerUrls,
  sessionUrls,
  superAdminUrls,
  webhookUrls,
  jiraUrls,
  transactionUrls,
  blockListUrls,
  allowListUrls,
  queueUrls,
  commentUrls,
  purchaseLimitUrls,
} from "sardine-dashboard-typescript-definitions";
import { AuthService } from "../commons/AuthService";
import { mw } from "../commons/middleware";
import { RuleService } from "../commons/RuleService";
import authRouter from "./routes/auth";
import rulesRouter from "./routes/rules";
import customersRouter from "./routes/customers";
import searchRouter from "./routes/search";
import queuesRouter from "./routes/queues";
import commentsRouter from "./routes/comments";
import sessionsRouter from "./routes/sessions";
import organisationRouter from "./routes/organisation";
import dataDistributionRouter from "./routes/data-distribution";
import superadminRouter from "./routes/superadmin";
import webhooksRouter from "./routes/webhooks";
import jiraRouter from "./routes/jira";
import auditRouter from "./routes/audit";
import documentVerificationsRouter from "./routes/document-verifications";
import integrationHealthCheckRouter from "./routes/integration-health-check";
import blocklistRouter from "./routes/business/blocklist";
import allowlistRouter from "./routes/business/allowlist";
import purchaseLimitsRouter from "./routes/business/purchase-limits";
import transactionsRouter from "./routes/transactions";
import featureFlagsRouter from "./routes/feature-flags";
import { UnleashService } from "../commons/UnleashService";
import feedbacksRouter from "./routes/feedbacks";

const createApiRouter = (authService: AuthService, ruleService: RuleService, unleashSevice: UnleashService) => {
  const apiRouter = express.Router();

  apiRouter.use(authUrls.basePath, authRouter(authService));
  apiRouter.use(ruleUrls.basePath, rulesRouter(ruleService));
  apiRouter.use(searchUrls.basePath, searchRouter());
  apiRouter.use(dataDistributionUrls.basePath, dataDistributionRouter());
  apiRouter.use(customerUrls.basePath, customersRouter());
  apiRouter.use(queueUrls.basePath, queuesRouter(ruleService));
  apiRouter.use(commentUrls.basePath, commentsRouter());
  apiRouter.use(sessionUrls.basePath, sessionsRouter());
  apiRouter.use(organisationUrls.basePath, mw.requireLoggedIn, organisationRouter(unleashSevice));
  apiRouter.use(superAdminUrls.basePath, mw.requireAdminAccess, superadminRouter(authService));
  apiRouter.use(webhookUrls.basePath, webhooksRouter());
  apiRouter.use(jiraUrls.basePath, jiraRouter());
  apiRouter.use(auditUrls.basePath, auditRouter());
  apiRouter.use(documentVerificationsUrls.basePath, documentVerificationsRouter());
  apiRouter.use(integrationHealthCheckUrls.basePath, integrationHealthCheckRouter());
  apiRouter.use(featureFlagUrls.basePath, featureFlagsRouter(unleashSevice));
  apiRouter.use(blockListUrls.basePath, blocklistRouter());
  apiRouter.use(allowListUrls.basePath, allowlistRouter());
  apiRouter.use(purchaseLimitUrls.basePath, purchaseLimitsRouter());
  apiRouter.use(transactionUrls.basePath, transactionsRouter());

  apiRouter.use("/blocklist", blocklistRouter());
  apiRouter.use("/allowlist", allowlistRouter());
  apiRouter.use("/purchaselimit", purchaseLimitsRouter());
  apiRouter.use("/transactions", transactionsRouter());
  apiRouter.use(feedbackUrls.basePath, feedbacksRouter());

  return apiRouter;
};

export default (authService: AuthService, ruleService: RuleService, unleashSevice: UnleashService) => {
  const router = express.Router();

  router.get("/health-check", (req, res) => {
    res.status(200).send("ok");
  });

  router.use("/", createApiRouter(authService, ruleService, unleashSevice));

  return router;
};
