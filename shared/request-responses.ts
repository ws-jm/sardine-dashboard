import { WithPageCursor } from "./types";
import { AmlKind } from "./datastore/aml_schema";
import { DocumentVerification } from "./datastore/document-verifications-schema";
import { HealthCheckEvent, HealthCheckRequest } from "./bigquery";
import { OrganizationUser, Feedback } from "./domain";
import { RuleActionTag, RuleProps } from ".";

export type GetOrganisationFeatureFlagsResponse = {
  enabledFeatureFlagNames: string[];
  disabledFeatureFlagNames: string[];
};

export type GetDocumentVerificationsResponse = {
  documentVerifications: DocumentVerification[];
} & WithPageCursor;

export interface GetAmlResponse {
  aml?: AmlKind;
}

export type GetHealthCheckInboundRequests = {
  inboundRequests: HealthCheckRequest[];
};

export type GetHealthCheckoutboundRequests = {
  outboundRequests: HealthCheckRequest[];
};

export type GetHealthCheckEvents = {
  events: HealthCheckEvent[];
};

export interface UpdateRuleRequest {
  rule: {
    batchCount?: number;
    batchDuration?: string;
    id?: number;
    isShadow: boolean;
    queueID: string;
    name: string;
    condition: string;
    depreciated: boolean;
    description: string;
    reasonCodesExpr: string;
    action: {
      tags: RuleActionTag[];
    };
  };
  clientID: string;
  checkpoint: string;
  isDemo?: boolean;
}

// TODO: Merge UpdateRuleRequest2 and UpdateRuleRequest
export interface UpdateRuleRequest2 {
  rule: RuleProps;
  clientID: string;
  checkpoint: string;
}

export interface UpdateRuleResponse {
  action: { tags: RuleActionTag[] };
  condition: string;
  id: number;
  isEditable: boolean;
  isShadow: boolean;
  name: string;
}

export interface ErrorMessageResponse {
  error: string;
}

export const isErrorMessageResponse = (o: unknown): o is ErrorMessageResponse =>
  typeof o === "object" && o !== null && "error" in o;

export interface Organisation {
  client_id: string;
  display_name: string;
}

export interface OrgName {
  name: string;
}

export interface OrganizationUsersResponse extends Array<OrganizationUser> {}

const isOrganisation = (o: unknown): o is Organisation =>
  o !== undefined &&
  o !== null &&
  typeof o === "object" &&
  "client_id" in (o as Organisation) &&
  "display_name" in (o as Organisation);

export const isOrganisationList = (o: unknown): o is Organisation[] =>
  o !== undefined && Array.isArray(o) && o.every(isOrganisation);

// organisation
// `/api/organisation/client-id?organisation=${id}`
export interface ClientIdObject {
  client_id: string;
}

export const isClientIdObject = (response: unknown): response is ClientIdObject =>
  typeof response === "object" && response !== null && "client_id" in (response as ClientIdObject);

export interface OrgAdmin {
  clientID: string;
  name: string;
  users: Array<{
    id: string;
    name: string;
    email: string;
    organisation: string;
    is_email_verified: boolean;
  }>;
}

export interface OrgAdminList extends Array<OrgAdmin> {}

export interface GetFeedbacksResponse extends Array<Feedback> {}
