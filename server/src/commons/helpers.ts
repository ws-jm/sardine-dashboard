import axios from "axios";
import { Request } from "express";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

const GOOGLE_VERIFICATION_URL = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=`;

export const getIp = function (req: Request) {
  return req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
};

export const isValidUuid = function (id: string) {
  const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidV4Regex.test(id);
};

export const verifyGoogleToken = (token: string) => axios.get(`${GOOGLE_VERIFICATION_URL}${token}`);

export const groupBy = function (xs: AnyTodo[], key: string) {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export const helpers = {
  getIp,
  isValidUuid,
  verifyGoogleToken,
  groupBy,
};
