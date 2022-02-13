import { Request } from "express";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

export interface CurrentUser {
  id: string;
  name: string;
  organisation: string;
  email: string;
  user_role: string;
  is_email_verified: boolean;
  organisation_id?: string;
  organisation_client_id?: string;
}

/**
 * @deprecated  Please use RequestWithCurrentUser for safer typing
 */
export interface RequestWithUser<T = AnyTodo> extends Request {
  body: T;
  currentUser?: CurrentUser;
  id?: string;
}

export interface RequestWithCurrentUser<ReqBody = {}, ReqQuery = {}> extends Request<{}, unknown, ReqBody, ReqQuery, {}> {
  currentUser?: CurrentUser;
  id?: string;
}
export interface RegistrationRequest {
  name: string;
  email: string;
  idToken: string;
  invitationToken: string;
}

export interface GoogleSigninRequest {
  idToken: string;
  invitationToken: string;
}

export interface LoginRequest {
  idToken: string;
}

export interface CreateOrganisation {
  organisation: string;
  user_type: string;
  parentOrg: string;
}

export interface SearchRequest {
  startDate: string;
  endDate: string;
  type: string;
  organisation: string;
}

export interface RevokeCredentialsRequest {
  uuid: string;
  clientID: string;
}

export interface GenerateCredentialRequest {
  organisation: string;
}

export interface FilterObject {
  key: string;
  value: AnyTodo;
}

export interface BlockAllowlistData {
  type: string;
  value: string;
}

export interface BlockAllowlistUpdateRequest {
  id: string;
  organisation: string;
  type: string;
  value: string;
  scope: string;
  expiry: number;
}

export interface BlockAllowlistRequest {
  organisation: string;
  data: BlockAllowlistData[];
  scope: string;
  expiry: string;
}

export interface UpdateSessionRequest {
  clientId: string;
  customerId: string;
  sessionKey: string;
  updated_data: { [key: string]: AnyTodo };
  owner: string;
  checkpoint: string;
  transactionID: string;
  queueName: string;
}
