import axios from "axios";
import { startCase } from "lodash-es";
import {
  RuleFeatureStatsRequestBody,
  ChartName,
  CustomerRequestBody,
  UserAggregationsRequestBody,
  SearchDetailsRequestBody,
  SortRulesRequestBody,
  PurchaseLimitRequestBody,
  AddNewCommentRequestBody,
  ResetPasswordLinkRequestBody,
  CreateBlockAllowlistRequestBody,
  UpdateBlockAllowlistRequestBody,
  UpdateCaseStatusRequestBody,
  CreateWebhookRequestBody,
  StatusData,
  DisableRuleRequestBody,
  GetAmlResponse,
  documentVerificationsUrls,
  GetDocumentVerificationsResponse,
  DocumentVerificationImages,
  DocumentVerification,
  integrationHealthCheckUrls,
  GetHealthCheckEvents,
  GetHealthCheckoutboundRequests,
  GetHealthCheckInboundRequests,
  JiraRequestBody,
  EmailInvitationRequestBody,
  TransactionsRequestBody,
  authUrls,
  dataDistributionUrls,
  HttpMethods,
  ruleUrls,
  searchUrls,
  Rule,
  RulePerformanceKind,
  featureFlagUrls,
  organisationUrls,
  SendNotificationRequest,
  EmailConfig,
  createFailure,
  createSuccess,
  Result,
  Organisation,
  isOrganisationList,
  sessionUrls,
  AnyTodo,
  OrganizationUsersResponse,
  feedbackUrls,
  FeedbackRequest,
  customerUrls,
  SessionWithTransactions,
  CustomerProfileResponse,
  isClientIdObject,
  superAdminUrls,
  webhookUrls,
  jiraUrls,
  transactionUrls,
  blockListUrls,
  allowListUrls,
  commentUrls,
  queueUrls,
  purchaseLimitUrls,
  OrgAdminList,
  OrgName,
  ClientIdObject,
  UpdateRuleRequest,
  UpdateRuleRequest2,
  UpdateRuleResponse,
  ErrorMessageResponse,
  RuleDetails,
  FetchDeviceProfileRequestBody,
  UserAggregationKind,
  GetFeedbacksResponse,
} from "sardine-dashboard-typescript-definitions";

import { FilterData } from "components/Common/FilterField";
import { captureException, getErrorMessage } from "./errorUtils";
import { SignInData, isSignInSuccessResponse } from "../interfaces/authInterfaces";
import SessionListResponse from "./api_response/sessionList";
import TransactionListResponse from "./api_response/transactionList";
import { DeviceProfileResponse } from "./api_response/deviceResponse";

const { addNewCommentRoute, getListCommentRoute } = commentUrls.routes;
const { addNewQueueRoute, deleteQueueRoute, getListQueueRoute, getListSessionsInQueue, updateQueueRoute } = queueUrls.routes;
const { getFeatureFlagsOfOrgRoute } = organisationUrls.routes;
const { getAllFeatureFlagsRoute } = featureFlagUrls.routes;
const { generateCredentialsRoute, getCredentialsRoute, revokeCredentialsRoute } = superAdminUrls.routes;
const { updateWebhookRoute, getWebhookRoute, deleteWebhookRoute, createWebhookRoute } = webhookUrls.routes;

const { getTransactionsRoute, getTransactionDetailsRoute } = transactionUrls.routes;

const { addNewBlockListRoute, deleteNewBlockListRoute, getBlockListRoute, updateNewBlockListRoute } = blockListUrls.routes;
const { addNewAllowListRoute, deleteNewAllowListRoute, getAllowListRoute, updateNewAllowListRoute } = allowListUrls.routes;
const { updatePurchaseLimitRoute, getPurchaseLimitsRoute, deletePurchaseLimitsRoute, createPurchaseLimitRoute } =
  purchaseLimitUrls.routes;

const {
  loginRoute,
  registerRoute,
  googleSignInRoute,
  createOrganisationRoute,
  fetchOrganisationRoute,
  fetchOrganisationDetailRoute,
  getUserRoute,
  getUsersRoute,
  getAdminUsersRoute,
  deleteUserRoute,
  getOrganizeUsersRoute,
  logoutRoute,
  resetPasswordLinkRoute,
} = authUrls.routes;

const {
  listRuleRoute,
  getRuleDetailsRoute,
  createRuleRoute,
  disableRuleRoute,
  orderRuleRoute,
  updateRuleRoute,
  getRuleStatsRoute,
  getExecutionsRoute,
  getFeatureStatsRoute,
  getRulePerformance,
  getCreatingdRuleStatsRoute,
} = ruleUrls.routes;

const { getJiraTokenRoute, deleteJiraTokenRoute, createJiraTokenRoute } = jiraUrls.routes;

const {
  profileRoute,
  getCustomersRoute,
  getCustomerDetailsRoute,
  getCryptoDetailsRoute,
  getCardDetailsRoute,
  getBankDetailsRoute,
} = customerUrls.routes;

const { listSessionRoute, amlSessionRoute, sessionWithTransactionsRoute, updateCaseStatusRoute } = sessionUrls.routes;

const { adminNotification } = organisationUrls.routes;
const { getDeviceProfileRoute, getDeviceDetailsRoute, getUserAggregationsRoute } = searchUrls.routes;

const { getChartValues } = dataDistributionUrls.routes;

const { submitFeedbackRoute, getFeedbacksRoute } = feedbackUrls.routes;

const axiosInstance = axios.create();

const responseToData = (response: AnyTodo) => {
  if (response.data === "SERVER_UNAVAILABLE") {
    throw new Error("SERVER_UNAVAILABLE");
  } else {
    return response.data;
  }
};

const errorHandler = (error: AnyTodo) => {
  const code = parseInt(error.response && error.response.status, 10);
  if (code === 401) {
    console.log("logged_out");
  }
  throw error;
};

interface Request {
  url: string;
  params?: AnyTodo;
  headers?: AnyTodo;
  data?:
    | RuleFeatureStatsRequestBody
    | SignInData
    | CustomerRequestBody
    | FetchDeviceProfileRequestBody
    | UserAggregationsRequestBody
    | SearchDetailsRequestBody
    | PurchaseLimitRequestBody
    | AddNewCommentRequestBody
    | ResetPasswordLinkRequestBody
    | CreateBlockAllowlistRequestBody
    | UpdateBlockAllowlistRequestBody
    | UpdateCaseStatusRequestBody
    | DisableRuleRequestBody
    | CreateWebhookRequestBody
    | EmailInvitationRequestBody
    | TransactionsRequestBody
    | SendNotificationRequest
    | SortRulesRequestBody
    | FeedbackRequest
    | UpdateRuleRequest
    | UpdateRuleRequest2;
}

export interface ClientIdData {
  client_id: string;
}

export const isClientIdData = (data: unknown): data is ClientIdData =>
  data !== undefined && typeof (data as ClientIdData).client_id === "string";

const get = ({ url, params, headers }: Request) =>
  axiosInstance
    .request({
      method: "GET",
      url,
      params,
      headers,
    })
    .then(responseToData)
    .catch(errorHandler);

const post = ({ url, data }: Request) =>
  axiosInstance
    .request({
      method: "POST",
      url,
      data,
    })
    .then(responseToData)
    .catch(errorHandler);

const put = ({ url, data }: Request) =>
  axiosInstance
    .request({
      method: "PUT",
      url,
      data,
    })
    .then(responseToData)
    .catch(errorHandler);

const deleteMethod = ({ url, params, headers }: Request) =>
  axiosInstance
    .request({
      method: "DELETE",
      url,
      params,
      headers,
    })
    .then(responseToData)
    .catch(errorHandler);

const httpMethods: Record<HttpMethods, (request: Request) => Promise<AnyTodo>> = {
  get,
  post,
  put,
  delete: deleteMethod,
};

const getApiPath = (basePath: string, apiPath: string) => `/api${basePath}${apiPath}`;

export const getDocumentVerifications = async (
  filters: FilterData[],
  clientId: string,
  pageCursor?: string,
  loadImage?: boolean
) => {
  const getDocumentVerificationsUrl = documentVerificationsUrls.routes.list;
  const url = new URL(getApiPath(documentVerificationsUrls.basePath, getDocumentVerificationsUrl.path), window.location.origin);
  if (pageCursor) url.searchParams.append("page_cursor", pageCursor);
  if (clientId) url.searchParams.append("client_id", clientId);
  if (loadImage) url.searchParams.append("load_image", String(loadImage));

  filters.forEach((filter) => {
    if (filter.apply) {
      url.searchParams.append(filter.key, filter.value);
    }
  });

  const res = (await httpMethods[getDocumentVerificationsUrl.httpMethod]({
    url: url.toString(),
  })) as GetDocumentVerificationsResponse;

  const transformedData = res.documentVerifications.map((d) => ({
    ...d,
    document_data: {
      ...d.document_data,
      type: startCase(d.document_data.type),
    },
  }));

  return {
    pageCursor: res.pageCursor,
    documentVerifications: transformedData,
  } as GetDocumentVerificationsResponse;
};

export const getFeatureFlagsOfOrg = (orgId: string) =>
  httpMethods[getFeatureFlagsOfOrgRoute.httpMethod]({
    url: getApiPath(organisationUrls.basePath, getFeatureFlagsOfOrgRoute.path.replace(":id", orgId)),
  });

export const getAllFeatureFlags = () =>
  httpMethods[getAllFeatureFlagsRoute.httpMethod]({
    url: getApiPath(featureFlagUrls.basePath, getAllFeatureFlagsRoute.path),
  });

export const googleSignIn = (data: AnyTodo) =>
  httpMethods[googleSignInRoute.httpMethod]({ url: getApiPath(authUrls.basePath, googleSignInRoute.path), data });

export const googleSignInResult = async (data: SignInData) => {
  try {
    const result = await googleSignIn(data);
    if (isSignInSuccessResponse(result)) {
      return createSuccess(result);
    }
    return createFailure(new Error("Google sign in response structure is invalid"));
  } catch (error) {
    captureException(error);
    if (error instanceof Error) {
      return createFailure(error);
    }
    return createFailure(new Error("Google sign in failed"));
  }
};

export const createOrganisaion = (data: AnyTodo) =>
  httpMethods[createOrganisationRoute.httpMethod]({ url: getApiPath(authUrls.basePath, createOrganisationRoute.path), data });

export const fetchOrganisationNames = (): Promise<OrgName[]> =>
  httpMethods[fetchOrganisationRoute.httpMethod]({ url: getApiPath(authUrls.basePath, fetchOrganisationRoute.path) });

export const fetchOrganisationDetail = async (): Promise<Result<Organisation[]>> => {
  try {
    const response = await httpMethods[fetchOrganisationDetailRoute.httpMethod]({
      url: getApiPath(authUrls.basePath, fetchOrganisationDetailRoute.path),
    });
    if (isOrganisationList(response)) {
      return createSuccess(response);
    }
    return createFailure(new Error("Failed to fetch organisation details because there is no organisation list in response."));
  } catch (e) {
    if (e instanceof Error) {
      return createFailure(e);
    }
    return createFailure(new Error("Failed to fetch organization details."));
  }
};

export const getUser = () => httpMethods[getUserRoute.httpMethod]({ url: getApiPath(authUrls.basePath, getUserRoute.path) });

export const getAllUsers = () =>
  httpMethods[getUsersRoute.httpMethod]({ url: getApiPath(authUrls.basePath, getUsersRoute.path) });

export const getOrganizationUsers = async (organization: string): Promise<Result<OrganizationUsersResponse>> => {
  try {
    const url = new URL(getApiPath(authUrls.basePath, getOrganizeUsersRoute.path), window.location.origin);
    url.searchParams.append("organization", organization);
    const res = await httpMethods[getOrganizeUsersRoute.httpMethod]({ url: String(url) });
    return createSuccess<OrganizationUsersResponse>(res.result);
  } catch (e) {
    if (e instanceof Error) {
      return createFailure(e);
    }
    return createFailure(new Error("Failed to get organization users."));
  }
};

export const logout = () => httpMethods[logoutRoute.httpMethod]({ url: getApiPath(authUrls.basePath, logoutRoute.path) });

export const fetchSessions = () => get({ url: `/api/auth/fetch-sessions` });

export const registerUser = (data: AnyTodo) =>
  httpMethods[registerRoute.httpMethod]({ url: getApiPath(authUrls.basePath, registerRoute.path), data });

export const getHealthCheckOutboundRequest = (filters: FilterData[], clientId?: string) => {
  const queryIntegrationHealthCheckUrl = integrationHealthCheckUrls.routes.outboundRequest;

  const url = new URL(
    getApiPath(integrationHealthCheckUrls.basePath, queryIntegrationHealthCheckUrl.path),
    window.location.origin
  );
  if (clientId) url.searchParams.append("client_id", clientId);
  filters.forEach((filter) => {
    if (filter.apply) url.searchParams.append(filter.key, filter.value);
  });

  return httpMethods[queryIntegrationHealthCheckUrl.httpMethod]({ url: String(url) }) as Promise<GetHealthCheckoutboundRequests>;
};

export const getHealthCheckEvents = (filters: FilterData[], clientId?: string) => {
  const queryEventsUrl = integrationHealthCheckUrls.routes.events;

  const url = new URL(getApiPath(integrationHealthCheckUrls.basePath, queryEventsUrl.path), window.location.origin);
  if (clientId) url.searchParams.append("client_id", clientId);
  filters.forEach((filter) => {
    if (filter.apply) url.searchParams.append(filter.key, filter.value);
  });

  return httpMethods[queryEventsUrl.httpMethod]({ url: String(url) }) as Promise<GetHealthCheckEvents>;
};

export const getHealthCheckInboundRequest = (filters: FilterData[], clientId?: string) => {
  const queryInboundRequestUrl = integrationHealthCheckUrls.routes.inboundRequest;

  const url = new URL(getApiPath(integrationHealthCheckUrls.basePath, queryInboundRequestUrl.path), window.location.origin);
  if (clientId) url.searchParams.append("client_id", clientId);

  filters.forEach((filter) => {
    if (filter.apply) url.searchParams.append(filter.key, filter.value);
  });

  return httpMethods[queryInboundRequestUrl.httpMethod]({ url: String(url) }) as Promise<GetHealthCheckInboundRequests>;
};

export const getCredentialsByName = (name: string) => {
  const url = new URL(getApiPath(superAdminUrls.basePath, getCredentialsRoute.path), window.location.origin);
  url.searchParams.append("organisation", name);
  return httpMethods[getCredentialsRoute.httpMethod]({ url: String(url) });
};

export const revokeCredentials = (data: AnyTodo) => {
  const url = new URL(getApiPath(superAdminUrls.basePath, revokeCredentialsRoute.path), window.location.origin);
  return httpMethods[revokeCredentialsRoute.httpMethod]({ url: String(url), data });
};

export const generateNewCredentials = (data: AnyTodo) => {
  const url = new URL(getApiPath(superAdminUrls.basePath, generateCredentialsRoute.path), window.location.origin);
  return httpMethods[generateCredentialsRoute.httpMethod]({ url: String(url), data });
};

export const requestResetPasswordLink = (data: ResetPasswordLinkRequestBody) =>
  httpMethods[resetPasswordLinkRoute.httpMethod]({ url: getApiPath(authUrls.basePath, resetPasswordLinkRoute.path), data });

export const loginUser = (data: SignInData) =>
  httpMethods[loginRoute.httpMethod]({ url: getApiPath(authUrls.basePath, loginRoute.path), data });

export const loginUserResult = async (data: SignInData) => {
  try {
    const result = await loginUser(data);
    if (isSignInSuccessResponse(result)) {
      return createSuccess(result);
    }
    return createFailure(new Error("Sign in response structure is invalid"));
  } catch (error) {
    captureException(error);
    if (error instanceof Error) {
      return createFailure(error);
    }
    return createFailure(new Error("Sign in failed"));
  }
};

export const fetchInvitations = (id: string) => get({ url: `/api/organisation/fetch-invitations?organisation=${id}` });

export const generateSendInvite = (id: string, emails: string[], link: string) =>
  post({
    url: `/api/organisation/generate-send-invite`,
    data: {
      organisation: id,
      emails,
      link,
    },
  });

export const sendAdminNotification = (subject: string, users: EmailConfig[], message: string) =>
  httpMethods[adminNotification.httpMethod]({
    url: getApiPath(organisationUrls.basePath, adminNotification.path),
    data: {
      subject,
      users,
      message,
    },
  });

export const getEmailFromToken = (token: string) => get({ url: `/api/auth/get-email-from-token?token=${token}` });

export const getDocumentVerification = (id: string): Promise<DocumentVerification> => {
  const documentVerificationUrl = documentVerificationsUrls.routes.details;
  const url = getApiPath(documentVerificationsUrls.basePath, documentVerificationUrl.path.replace(":id", id));
  return httpMethods[documentVerificationUrl.httpMethod]({ url });
};

export const getDocumentVerificationsImages = (front_image_path?: string, back_image_path?: string, selfie_path?: string) => {
  const getDocumentVerificationsImagesUrl = documentVerificationsUrls.routes.images;

  const url = new URL(
    getApiPath(documentVerificationsUrls.basePath, getDocumentVerificationsImagesUrl.path),
    window.location.origin
  );

  if (front_image_path) url.searchParams.append("front_image_path", front_image_path);
  if (back_image_path) url.searchParams.append("back_image_path", back_image_path);
  if (selfie_path) url.searchParams.append("selfie_path", selfie_path);

  if (url.search)
    return httpMethods[getDocumentVerificationsImagesUrl.httpMethod]({
      url: url.toString(),
    }) as Promise<DocumentVerificationImages>;

  return {};
};

export const emailInvitationLink = (data: AnyTodo) => post({ url: `/api/organisation/email-invite`, data });

export const getMetabaseToken = (id: string) => get({ url: `/api/organisation/metabase-token?organisation=${id}` });

export const getMetabaseTokenForRelayDashboard = () => get({ url: `/api/organisation/metabase-token-relay` });

export const getClientIdObject = (id: string): Promise<ClientIdObject> =>
  get({ url: `/api/organisation/client-id?organisation=${id}` });

export const getClientIdResult = async (id: string): Promise<Result<string>> => {
  try {
    const response = await getClientIdObject(id);
    if (isClientIdObject(response)) {
      const clientId = response.client_id;
      return createSuccess(clientId);
    }
    return createFailure(new Error("Failed to get the client ID"));
  } catch (e) {
    if (e instanceof Error) {
      return createFailure(e);
    }
    return createFailure(new Error("Failed to get the client ID"));
  }
};

export const getOrganisations = () => get({ url: `/api/organisation/list` });

// Rules Module

export const createRule = (data: AnyTodo, id: string) => {
  const url = new URL(getApiPath(ruleUrls.basePath, createRuleRoute.path), window.location.origin);
  url.searchParams.append("organisation", id);
  return httpMethods[createRuleRoute.httpMethod]({ url: String(url), data });
};
export const sendUpdateRuleRequest = (
  data: UpdateRuleRequest | UpdateRuleRequest2,
  orgName: string
): Promise<UpdateRuleResponse | ErrorMessageResponse> => {
  const url = new URL(getApiPath(ruleUrls.basePath, updateRuleRoute.path), window.location.origin);
  url.searchParams.append("organisation", orgName);
  return httpMethods[updateRuleRoute.httpMethod]({ url: String(url), data });
};

export const getRules = (clientId: string, checkpoint: string): Promise<Array<Rule>> => {
  const url = new URL(getApiPath(ruleUrls.basePath, listRuleRoute.path), window.location.origin);
  url.searchParams.append("clientId", clientId);
  url.searchParams.append("checkpoint", checkpoint);
  return httpMethods[listRuleRoute.httpMethod]({ url: String(url) });
};

export const getRulesResult = async (clientId: string, checkpoint: string): Promise<Result<Array<Rule>>> => {
  try {
    const rules = await getRules(clientId, checkpoint);
    return createSuccess(rules);
  } catch (error) {
    if (error instanceof Error) {
      return createFailure(error);
    }
    return createFailure(new Error("Failed to fetch the rules"));
  }
};

export const getRuleDetails = (ruleId: string): Promise<RuleDetails> => {
  const url = new URL(getApiPath(ruleUrls.basePath, getRuleDetailsRoute.path), window.location.origin);
  url.searchParams.append("ruleID", ruleId);
  return httpMethods[getRuleDetailsRoute.httpMethod]({ url: String(url) });
};

export const getCreatingRuleStats = (data: AnyTodo, id: string) => {
  const url = new URL(getApiPath(ruleUrls.basePath, getCreatingdRuleStatsRoute.path), window.location.origin);
  url.searchParams.append("organisation", id);
  return httpMethods[getCreatingdRuleStatsRoute.httpMethod]({ url: String(url), data });
};
export const getRuleStats = (ruleId: string, days: string, clientId: string, id: string) => {
  const url = new URL(getApiPath(ruleUrls.basePath, getRuleStatsRoute.path), window.location.origin);
  url.searchParams.append("ruleId", ruleId);
  url.searchParams.append("days", days);
  url.searchParams.append("clientId", clientId);
  url.searchParams.append("organisation", id);
  return httpMethods[getRuleStatsRoute.httpMethod]({ url: String(url) });
};

export const getRulesPerformanceData = (): Promise<{ rules_performance: Array<RulePerformanceKind> }> => {
  const url = new URL(getApiPath(ruleUrls.basePath, getRulePerformance.path), window.location.origin);
  return get({ url: String(url) });
};

export const sortRules = (data: SortRulesRequestBody, id: string) => {
  const url = new URL(getApiPath(ruleUrls.basePath, orderRuleRoute.path), window.location.origin);
  url.searchParams.append("organisation", id);
  return post({ url: String(url), data });
};

export const getRuleFeatureStats = (data: RuleFeatureStatsRequestBody, id: string) => {
  const url = new URL(getApiPath(ruleUrls.basePath, getFeatureStatsRoute.path), window.location.origin);
  url.searchParams.append("organisation", id);
  return httpMethods[getFeatureStatsRoute.httpMethod]({ url: String(url), data });
};
export const getExecutedRules = (date: string, sessionKey: string, clientId: string) => {
  const url = new URL(getApiPath(ruleUrls.basePath, getExecutionsRoute.path), window.location.origin);
  url.searchParams.append("date", date);
  url.searchParams.append("sessionKey", sessionKey);
  url.searchParams.append("clientId", clientId);
  return httpMethods[getExecutionsRoute.httpMethod]({ url: String(url) });
};
export const disableRule = (data: DisableRuleRequestBody) =>
  httpMethods[disableRuleRoute.httpMethod]({ url: getApiPath(ruleUrls.basePath, disableRuleRoute.path), data });

// Device Intelligence
export const fetchDeviceDetails = (data: SearchDetailsRequestBody) =>
  httpMethods[getDeviceDetailsRoute.httpMethod]({ url: getApiPath(searchUrls.basePath, getDeviceDetailsRoute.path), data });

export const fetchDeviceProfile = (data: FetchDeviceProfileRequestBody): Promise<{ result: DeviceProfileResponse }> =>
  httpMethods[getDeviceProfileRoute.httpMethod]({ url: getApiPath(searchUrls.basePath, getDeviceProfileRoute.path), data });

// Customer Intelligence
export const getCustomers = (clientId: string, data: CustomerRequestBody) => {
  const url = new URL(getApiPath(customerUrls.basePath, getCustomersRoute.path), window.location.origin);
  url.searchParams.append("clientId", clientId);
  return httpMethods[getCustomersRoute.httpMethod]({ url: String(url), data });
};

export const fetchUserAggregations = (data: UserAggregationsRequestBody): Promise<{ result: UserAggregationKind }> =>
  httpMethods[getUserAggregationsRoute.httpMethod]({ url: getApiPath(searchUrls.basePath, getUserAggregationsRoute.path), data });
export const getCustomerBankDetails = (customerId: string) => {
  const url = new URL(getApiPath(customerUrls.basePath, getBankDetailsRoute.path), window.location.origin);
  url.searchParams.append("customerId", customerId);
  return httpMethods[getBankDetailsRoute.httpMethod]({ url: String(url) });
};
export const getCustomerCardDetails = (customerId: string) => {
  const url = new URL(getApiPath(customerUrls.basePath, getCardDetailsRoute.path), window.location.origin);
  url.searchParams.append("customerId", customerId);
  return httpMethods[getCardDetailsRoute.httpMethod]({ url: String(url) });
};
export const getCustomerCryptoDetails = (customerId: string) => {
  const url = new URL(getApiPath(customerUrls.basePath, getCryptoDetailsRoute.path), window.location.origin);
  url.searchParams.append("customerId", customerId);
  return httpMethods[getCryptoDetailsRoute.httpMethod]({ url: String(url) });
};

export const getCustomerDetails = (customerId: string, sessionKey: string, timestamp: string) => {
  const url = new URL(getApiPath(customerUrls.basePath, getCustomerDetailsRoute.path), window.location.origin);
  url.searchParams.append("customerId", customerId);
  url.searchParams.append("sessionKey", sessionKey);
  url.searchParams.append("timestamp", timestamp);
  return httpMethods[getCustomerDetailsRoute.httpMethod]({ url: String(url) });
};

export const getCustomerWithTransactionDetails = (
  customerId: string,
  sessionKey: string,
  clientId: string
): Promise<SessionWithTransactions> => {
  const url = new URL(getApiPath(sessionUrls.basePath, sessionWithTransactionsRoute.path), window.location.origin);
  url.searchParams.append(sessionWithTransactionsRoute.params.customerId, customerId);
  url.searchParams.append(sessionWithTransactionsRoute.params.sessionKey, sessionKey);
  url.searchParams.append(sessionWithTransactionsRoute.params.clientId, clientId);
  return get({
    url: url.toString(),
  });
};

export const getCustomerProfile = (customerId: string, clientId: string): Promise<CustomerProfileResponse> => {
  const url = new URL(getApiPath(customerUrls.basePath, profileRoute.path), window.location.origin);
  if (profileRoute.params) {
    url.searchParams.append(profileRoute.params.customerId, customerId);
    url.searchParams.append(profileRoute.params.clientId, clientId);
  }
  return httpMethods[profileRoute.httpMethod]({
    url: url.toString(),
  });
};

export const updateCaseStatus = (
  customerIds: string[],
  sessionKeys: string[],
  clientId: string,
  data: StatusData,
  checkpoint: string,
  transactionIds: string[],
  queueName: string
) => {
  const url = new URL(getApiPath(sessionUrls.basePath, updateCaseStatusRoute.path), window.location.origin);
  return httpMethods[updateCaseStatusRoute.httpMethod]({
    url: url.toString(),
    data: {
      queueName,
      customerIds,
      sessionKeys,
      clientId,
      data,
      checkpoint,
      transactionIds,
    },
  });
};

export const getAmlData = (customerId: string, clientId: string, sessionKey: string): Promise<GetAmlResponse> => {
  const url = new URL(getApiPath(sessionUrls.basePath, amlSessionRoute.path), window.location.origin);
  url.searchParams.append(amlSessionRoute.params.clientId, clientId);
  url.searchParams.append(amlSessionRoute.params.customerId, customerId);
  url.searchParams.append(amlSessionRoute.params.sessionKey, sessionKey);

  return httpMethods[amlSessionRoute.httpMethod]({ url: url.toString() }) as Promise<GetAmlResponse>;
};

// Blocklist
export const getBlocklist = (organisation: string, scope: string) => {
  const url = new URL(getApiPath(blockListUrls.basePath, getBlockListRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  url.searchParams.append("scope", scope);

  return httpMethods[getBlockListRoute.httpMethod]({ url: url.toString() });
};
export const addBlocklist = (data: CreateBlockAllowlistRequestBody) => {
  const url = new URL(getApiPath(blockListUrls.basePath, addNewBlockListRoute.path), window.location.origin);
  return httpMethods[addNewBlockListRoute.httpMethod]({ url: url.toString(), data });
};
export const updateBlocklist = (data: UpdateBlockAllowlistRequestBody) => {
  const url = new URL(getApiPath(blockListUrls.basePath, updateNewBlockListRoute.path), window.location.origin);
  return httpMethods[updateNewBlockListRoute.httpMethod]({ url: url.toString(), data });
};
export const deleteBlocklist = (id: string, organisation: string) => {
  const url = new URL(getApiPath(blockListUrls.basePath, deleteNewBlockListRoute.path), window.location.origin);
  url.searchParams.append("id", id);
  url.searchParams.append("organisation", organisation);

  return httpMethods[deleteNewBlockListRoute.httpMethod]({ url: url.toString() });
};

// Allowlist
export const getAllowlist = (organisation: string, scope: string) => {
  const url = new URL(getApiPath(allowListUrls.basePath, getAllowListRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  url.searchParams.append("scope", scope);

  return get({ url: url.toString() });
};

export const addAllowlist = (data: CreateBlockAllowlistRequestBody) => {
  const url = new URL(getApiPath(allowListUrls.basePath, addNewAllowListRoute.path), window.location.origin);
  return httpMethods[addNewAllowListRoute.httpMethod]({ url: url.toString(), data });
};
export const updateAllowlist = (data: UpdateBlockAllowlistRequestBody) => {
  const url = new URL(getApiPath(allowListUrls.basePath, updateNewAllowListRoute.path), window.location.origin);
  return httpMethods[updateNewAllowListRoute.httpMethod]({ url: url.toString(), data });
};

export const deleteAllowlist = (id: string, organisation: string) => {
  const url = new URL(getApiPath(allowListUrls.basePath, deleteNewAllowListRoute.path), window.location.origin);
  url.searchParams.append("id", id);
  url.searchParams.append("organisation", organisation);

  return httpMethods[deleteNewAllowListRoute.httpMethod]({ url: url.toString() });
};

// PurchaseLimit
export const getPurchaseLimit = (organisation: string) => {
  const url = new URL(getApiPath(purchaseLimitUrls.basePath, getPurchaseLimitsRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  return httpMethods[getPurchaseLimitsRoute.httpMethod]({ url: url.toString() });
};
export const addPurchaseLimit = (organisation: string, data: PurchaseLimitRequestBody) => {
  const url = new URL(getApiPath(purchaseLimitUrls.basePath, createPurchaseLimitRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  return httpMethods[createPurchaseLimitRoute.httpMethod]({ url: url.toString(), data });
};
export const updatePurchaseLimit = (organisation: string, data: PurchaseLimitRequestBody) => {
  const url = new URL(getApiPath(purchaseLimitUrls.basePath, updatePurchaseLimitRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  return httpMethods[updatePurchaseLimitRoute.httpMethod]({ url: url.toString(), data });
};
export const deletePurchaseLimit = (id: string) => {
  const url = new URL(getApiPath(purchaseLimitUrls.basePath, deletePurchaseLimitsRoute.path), window.location.origin);
  url.searchParams.append("id", id);
  return httpMethods[deletePurchaseLimitsRoute.httpMethod]({ url: url.toString() });
};

// Datastore
export const getSessions = (
  clientId: string,
  start_date: number,
  end_date: number,
  filters: { [key: string]: string },
  page_cursor: string | null = null,
  limit: number | null = null
): Promise<SessionListResponse> => {
  const url = new URL(getApiPath(sessionUrls.basePath, listSessionRoute.path), window.location.origin);
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("start_date", start_date.toString());
  url.searchParams.append("end_date", end_date.toString());
  Object.keys(filters).forEach((key) => {
    url.searchParams.append(key, filters[key]);
  });
  if (page_cursor) {
    url.searchParams.append("page_cursor", page_cursor);
  }
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }
  return get({ url: url.toString() });
};

export const getTransactions = (clientId: string, customerId: string, sessionKey: string): Promise<TransactionListResponse> =>
  get({ url: `/api/sessions/transactions?client_id=${clientId}&customer_id=${customerId}&session_key=${sessionKey}` });

// Data distribution

export const fetchDataDistributionChartValues = async <ResultType>({
  organisation,
  chartName,
  typeGuard,
}: {
  organisation: string;
  chartName: ChartName;
  typeGuard: (data: unknown) => data is ResultType;
}): Promise<Result<ResultType>> => {
  try {
    const response = await httpMethods[getChartValues.httpMethod]({
      url: `/api${dataDistributionUrls.basePath}${getChartValues.path}?organisation=${organisation}&chart=${chartName}`,
    });
    if (typeGuard(response)) {
      return createSuccess(response);
    }
    return createFailure(new Error("Invalid response"));
  } catch (e) {
    return createFailure(new Error(getErrorMessage(e)));
  }
};

// Case Management
export const getQueueslist = (organisation: string, checkpoint: string) => {
  const url = new URL(getApiPath(queueUrls.basePath, getListQueueRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  url.searchParams.append("checkpoint", checkpoint);
  return httpMethods[getListQueueRoute.httpMethod]({ url: String(url) });
};

export const deleteQueue = (organisation: string, queueId: number) => {
  const url = new URL(getApiPath(queueUrls.basePath, deleteQueueRoute.path), window.location.origin);
  url.searchParams.append("id", String(queueId));
  url.searchParams.append("organisation", organisation);
  return httpMethods[deleteQueueRoute.httpMethod]({ url: String(url) });
};

export const addNewQueue = (data: AnyTodo) => {
  const url = new URL(getApiPath(queueUrls.basePath, addNewQueueRoute.path), window.location.origin);
  return httpMethods[addNewQueueRoute.httpMethod]({ url: String(url), data });
};
export const updateQueue = (data: AnyTodo) => {
  const url = new URL(getApiPath(queueUrls.basePath, updateQueueRoute.path), window.location.origin);
  return httpMethods[updateQueueRoute.httpMethod]({ url: String(url), data });
};

// TODO: Specify return types
export const getSessionslist = (
  queueId: string,
  page: string,
  organisation: string,
  limit: string,
  start_date: number,
  end_date: number,
  filters: { [key: string]: string }
) => {
  const url = new URL(getApiPath(queueUrls.basePath, getListSessionsInQueue.path), window.location.origin);
  url.searchParams.append("queueId", queueId);
  url.searchParams.append("page", page);
  url.searchParams.append("organisation", organisation);
  url.searchParams.append("limit", limit);
  url.searchParams.append("start_date", start_date.toString());
  url.searchParams.append("end_date", end_date.toString());
  Object.keys(filters).forEach((key) => {
    url.searchParams.append(key, encodeURIComponent(filters[key]));
  });
  return httpMethods[getListSessionsInQueue.httpMethod]({ url: String(url) });
};

// Jira Management
export const getJiraToken = (clientId: string) => {
  const url = new URL(getApiPath(jiraUrls.basePath, getJiraTokenRoute.path), window.location.origin);
  url.searchParams.append("clientId", clientId);
  return httpMethods[getJiraTokenRoute.httpMethod]({ url: String(url) });
};
export const createJiraToken = (data: JiraRequestBody) => {
  const url = new URL(getApiPath(jiraUrls.basePath, createJiraTokenRoute.path), window.location.origin);
  return httpMethods[createJiraTokenRoute.httpMethod]({ url: String(url), data });
};
export const deleteJiraToken = (id: string) => {
  const url = new URL(getApiPath(jiraUrls.basePath, deleteJiraTokenRoute.path), window.location.origin);
  url.searchParams.append("id", id);
  return httpMethods[deleteJiraTokenRoute.httpMethod]({ url: String(url) });
};

// Queue Comments
export const getQueueCommentslist = (clientId: string, sessionKey: string) => {
  const url = new URL(getApiPath(commentUrls.basePath, getListCommentRoute.path), window.location.origin);
  url.searchParams.append("clientId", clientId);
  url.searchParams.append("sessionKey", sessionKey);

  return httpMethods[getListCommentRoute.httpMethod]({ url: url.toString() });
};
export const addNewComment = (data: AddNewCommentRequestBody) => {
  const url = new URL(getApiPath(commentUrls.basePath, addNewCommentRoute.path), window.location.origin);
  return httpMethods[addNewCommentRoute.httpMethod]({ url: url.toString(), data });
};

// Admin: Users List
export const getAdminOrganisations = (): Promise<OrgAdminList> => get({ url: `/api/organisation/admin-list` });
export const getAllAdminUsers = () =>
  httpMethods[getAdminUsersRoute.httpMethod]({ url: getApiPath(authUrls.basePath, getAdminUsersRoute.path) });
export const deleteUser = (uID: string, organisation: string) => {
  const url = new URL(getApiPath(authUrls.basePath, deleteUserRoute.path), window.location.origin);
  url.searchParams.append("id", uID);
  url.searchParams.append("organisation", organisation);
  return httpMethods[deleteUserRoute.httpMethod]({ url: String(url) });
};

// Webhooks
export const getWebhooks = () => {
  const url = new URL(getApiPath(webhookUrls.basePath, getWebhookRoute.path), window.location.origin);
  return httpMethods[getWebhookRoute.httpMethod]({ url: String(url) });
};
export const addWebhook = (data: CreateWebhookRequestBody) => {
  const url = new URL(getApiPath(webhookUrls.basePath, createWebhookRoute.path), window.location.origin);
  return httpMethods[createWebhookRoute.httpMethod]({ url: String(url), data });
};
export const updateWebhook = (id: string, data: CreateWebhookRequestBody) => {
  const url = new URL(getApiPath(webhookUrls.basePath, updateWebhookRoute.path), window.location.origin);
  url.searchParams.append("id", id);
  return httpMethods[updateWebhookRoute.httpMethod]({ url: String(url), data });
};
export const deleteWebhook = (id: string) => {
  const url = new URL(getApiPath(webhookUrls.basePath, deleteWebhookRoute.path), window.location.origin);
  url.searchParams.append("id", id);
  return httpMethods[updateWebhookRoute.httpMethod]({ url: String(url) });
};

// Transactions Intelligence
export const fetchTransactionsData = (organisation: string, data: TransactionsRequestBody) => {
  const url = new URL(getApiPath(transactionUrls.basePath, getTransactionsRoute.path), window.location.origin);
  url.searchParams.append("organisation", organisation);
  return httpMethods[getTransactionsRoute.httpMethod]({ url: String(url), data });
};
export const fetchTransactionDetails = (clientId: string, data: TransactionsRequestBody) => {
  const url = new URL(getApiPath(transactionUrls.basePath, getTransactionDetailsRoute.path), window.location.origin);
  url.searchParams.append("clientId", clientId);
  return httpMethods[getTransactionDetailsRoute.httpMethod]({ url: String(url), data });
};

// Feedback
export const submitFeedback = (body: FeedbackRequest, organisation?: string) => {
  const url = new URL(getApiPath(feedbackUrls.basePath, submitFeedbackRoute.path), window.location.origin);
  if (organisation) {
    url.searchParams.append("organisation", organisation);
  }
  return httpMethods.post({ url: String(url), data: body });
};

export const getFeedbacks = async (sessionKey: string): Promise<Result<GetFeedbacksResponse>> => {
  try {
    const url = new URL(getApiPath(feedbackUrls.basePath, getFeedbacksRoute.path), window.location.origin);
    url.searchParams.append("sessionKey", sessionKey);
    const res = await httpMethods[getFeedbacksRoute.httpMethod]({ url: String(url) });
    return createSuccess<GetFeedbacksResponse>(res.result);
  } catch (e) {
    if (e instanceof Error) {
      return createFailure(e);
    }
    return createFailure(new Error("Failed to get feedbacks."));
  }
};
