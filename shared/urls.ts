export type HttpMethods = "get" | "post" | "put" | "delete";

interface Route {
  path: string;
  httpMethod: HttpMethods;
  params?: Record<string, string>;
}

interface Urls {
  basePath: string;
  routes: Record<string, Route>;
}

// For typecheck
// But infer the original type: Record<string, string> + {a:'b'} => {a:string}
// Typescript isn't advanced on this
const createUrls = <RouteObject extends Urls>(urls: RouteObject) => urls;

export const integrationHealthCheckUrls = createUrls({
  basePath: "/integration-health-check",
  routes: {
    inboundRequest: {
      path: "/inbound-requests",
      httpMethod: "get",
    },
    outboundRequest: { path: "/outbound-requests", httpMethod: "get" },
    events: { path: "/events", httpMethod: "get" },
  },
});

export const documentVerificationsUrls = createUrls({
  basePath: "/document-verifications",
  routes: {
    list: { path: "/list", httpMethod: "get" },
    images: { path: "/images", httpMethod: "get" },
    details: { path: "/:id/details", httpMethod: "get" },
  },
});

export const ruleUrls = createUrls({
  basePath: "/rules",
  routes: {
    listRuleRoute: { path: "/list", httpMethod: "get" },
    getRuleDetailsRoute: { path: "/details", httpMethod: "get" },
    createRuleRoute: { path: "/create-rule", httpMethod: "post" },
    getCreatingdRuleStatsRoute: { path: "/creating-rule-stats", httpMethod: "get" },
    disableRuleRoute: { path: "/disable-rule", httpMethod: "post" },
    orderRuleRoute: { path: "/order-rule", httpMethod: "post" },
    updateRuleRoute: { path: "/update-rule", httpMethod: "put" },
    getExecutionsRoute: { path: "/executions", httpMethod: "get" },
    getRuleStatsRoute: { path: "/rule-stats", httpMethod: "get" },
    getFeatureStatsRoute: { path: "/features/stats", httpMethod: "post" },
    getRulePerformance: { path: "/features/rule-performance", httpMethod: "get" },
  },
});

export const dataDistributionUrls = createUrls({
  basePath: "/data-distribution",
  routes: {
    getChartValues: { path: "/chart-values", httpMethod: "get" },
  },
});

export const customerUrls = createUrls({
  basePath: "/customers",
  routes: {
    getCardDetailsRoute: { path: "/card-details", httpMethod: "get" },
    getCryptoDetailsRoute: { path: "/crypto-details", httpMethod: "get" },
    profileRoute: { path: "/profile", httpMethod: "get", params: { customerId: "customerId", clientId: "clientId" } },
    getCustomersRoute: {
      path: "/list",
      httpMethod: "post",
    },
    getCustomerDetailsRoute: {
      path: "/details",
      httpMethod: "get",
    },
    getBankDetailsRoute: { path: "/bank-details", httpMethod: "get" },
  },
});

export const searchUrls = createUrls({
  basePath: "/search",
  routes: {
    getDeviceDetailsRoute: {
      path: "/device-details",
      httpMethod: "post",
    },
    getDeviceProfileRoute: {
      path: "/device-profile",
      httpMethod: "post",
    },
    healthCheckRoute: {
      path: "/health-check",
      httpMethod: "get",
    },
    getUserAggregationsRoute: {
      path: "/user-aggregations",
      httpMethod: "post",
    },
  },
});

export const sessionUrls = {
  basePath: "/sessions",
  routes: {
    listSessionRoute: { path: "/list", httpMethod: "get" },
    amlSessionRoute: {
      path: "/aml",
      httpMethod: "get",
      params: { clientId: "client_id", customerId: "customer_id", sessionKey: "session_key" },
    },
    transactionsSessionRoute: { path: "/transactions", httpMethod: "get" },
    sessionWithTransactionsRoute: {
      path: "/session-with-transactions",
      httpMethod: "get",
      params: { customerId: "customerId", sessionKey: "sessionKey", clientId: "client_id" },
    },
    updateCaseStatusRoute: { path: "/update-case-status", httpMethod: "post" },
  },
} as const;

export const authUrls = createUrls({
  basePath: "/auth",
  routes: {
    googleSignInRoute: { path: "/google-sign-in", httpMethod: "post" },
    logoutRoute: { path: "/logout", httpMethod: "post" },
    resetPasswordLinkRoute: { path: "/reset-password-link", httpMethod: "post" },
    registerRoute: { path: "/register", httpMethod: "post" },
    getUsersRoute: { path: "/users", httpMethod: "get" },
    fetchOrganisationRoute: { path: "/fetch-organisation", httpMethod: "get" },
    fetchOrganisationDetailRoute: { path: "/fetch-organisation-detail", httpMethod: "get" },
    getAdminUsersRoute: { path: "/admin-users", httpMethod: "get" },
    loginRoute: { path: "/login", httpMethod: "post" },
    createOrganisationRoute: { path: "/create-organisaion", httpMethod: "post" },
    getUserRoute: { path: "/get-user", httpMethod: "get" },
    getOrganizeUsersRoute: { path: "/organization-users", httpMethod: "get" },
    deleteUserRoute: { path: "/delete-user", httpMethod: "post" },
  },
});

export const organisationUrls = createUrls({
  basePath: "/organisation",
  routes: {
    getFeatureFlagsOfOrganisationRoute: { path: "/:clientID/feature-flags", httpMethod: "get" },
    getFeatureFlagsOfOrgRoute: { path: "/:id/feature-flags", httpMethod: "get" },
    adminNotification: { path: "/notification", httpMethod: "post" },
    getClientIdRoute: { path: "/client-id", httpMethod: "get", params: { organisation: "organisation" } },
  },
});

export const featureFlagUrls = createUrls({
  basePath: "/feature-flags",
  routes: {
    getAllFeatureFlagsRoute: { path: "/list", httpMethod: "get" },
  },
});

export const feedbackUrls = createUrls({
  basePath: "/feedbacks",
  routes: {
    submitFeedbackRoute: { path: "", httpMethod: "post" },
    getFeedbacksRoute: { path: "", httpMethod: "get" },
  },
});

export const auditUrls = createUrls({
  basePath: "/audit",
  routes: {
    listLogs: { path: "", httpMethod: "get" },
  },
});

export const superAdminUrls = createUrls({
  basePath: "/superadmin",
  routes: {
    getCredentialsRoute: { path: "/credentials", httpMethod: "get" },
    revokeCredentialsRoute: { path: "/revoke-credentials", httpMethod: "post" },
    generateCredentialsRoute: { path: "/generate-credentials", httpMethod: "post" },
  },
});

export const webhookUrls = createUrls({
  basePath: "/webhook",
  routes: {
    getWebhookRoute: { path: "/", httpMethod: "get" },
    createWebhookRoute: { path: "/", httpMethod: "post" },
    updateWebhookRoute: { path: "/", httpMethod: "post" },
    deleteWebhookRoute: { path: "/", httpMethod: "delete" },
  },
});

export const jiraUrls = createUrls({
  basePath: "/jra",
  routes: {
    getJiraTokenRoute: { path: "/", httpMethod: "get" },
    createJiraTokenRoute: { path: "/", httpMethod: "post" },
    deleteJiraTokenRoute: { path: "/", httpMethod: "delete" },
  },
});

export const transactionUrls = createUrls({
  basePath: "/transactions",
  routes: {
    getTransactionsRoute: { path: "/list", httpMethod: "post" },
    getTransactionDetailsRoute: { path: "/details", httpMethod: "post" },
  },
});

export const blockListUrls = createUrls({
  basePath: "/blocklist",
  routes: {
    getBlockListRoute: { path: "/list", httpMethod: "get" },
    addNewBlockListRoute: { path: "/add-new", httpMethod: "post" },
    updateNewBlockListRoute: { path: "/update", httpMethod: "post" },
    deleteNewBlockListRoute: { path: "/delete", httpMethod: "delete" },
  },
});

export const allowListUrls = createUrls({
  basePath: "/allowlist",
  routes: {
    getAllowListRoute: { path: "/list", httpMethod: "get" },
    addNewAllowListRoute: { path: "/add-new", httpMethod: "post" },
    updateNewAllowListRoute: { path: "/update", httpMethod: "post" },
    deleteNewAllowListRoute: { path: "/delete", httpMethod: "delete" },
  },
});

export const queueUrls = createUrls({
  basePath: "/queues",
  routes: {
    getListQueueRoute: { path: "/list", httpMethod: "get" },
    getListSessionsInQueue: { path: "/sessions", httpMethod: "get" },
    addNewQueueRoute: { path: "/add-new", httpMethod: "post" },
    updateQueueRoute: { path: "/update", httpMethod: "post" },
    deleteQueueRoute: { path: "", httpMethod: "delete" },
  },
});

export const commentUrls = createUrls({
  basePath: "/comment",
  routes: {
    getListCommentRoute: { path: "/list", httpMethod: "get" },
    addNewCommentRoute: { path: "/add-new", httpMethod: "post" },
  },
});

export const purchaseLimitUrls = createUrls({
  basePath: "/purchaselimit",
  routes: {
    getPurchaseLimitsRoute: { path: "/", httpMethod: "get" },
    createPurchaseLimitRoute: { path: "/", httpMethod: "post" },
    updatePurchaseLimitRoute: { path: "/", httpMethod: "put" },
    deletePurchaseLimitsRoute: { path: "/", httpMethod: "delete" },
  },
});
