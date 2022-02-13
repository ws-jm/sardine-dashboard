import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import { MULTI_ORG_ADMIN, SARDINE_ADMIN, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { helpers } from "./helpers";
import { RequestWithUser } from "../api/request-interface";
import { db } from "./db";
import { captureException } from "../utils/error-utils";

interface Error {
  status?: number;
  message?: string;
  code: number;
  response?: Response;
  name?: string;
  query: string;
  DB_ERROR?: boolean;
  stack: string;
}

const attachCurrentUserToRequest = (mydb: AnyTodo) => async (req: RequestWithUser, _res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sardine__sess;

  if (sessionId && helpers.isValidUuid(sessionId)) {
    const user = await mydb.session.getUserBySessionId(sessionId);
    if (user) {
      req.currentUser = user;
    }
  }

  next();
  return undefined;
};

const requireLoggedIn = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  next();
};

const requireSuperAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.currentUser || !(req.currentUser.user_role === SARDINE_ADMIN)) {
    return res.status(400).json({ error: "ACTION_ALLOWED_FOR_SUPERADMINS_ONLY" });
  }

  next();
  return undefined;
};

const requireAdminAccess = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.currentUser) {
    if (req.currentUser.user_role === SARDINE_ADMIN || req.currentUser.user_role === MULTI_ORG_ADMIN) {
      return next();
    }
  }
  return res.status(400).json({ error: "ACTION_ALLOWED_FOR_ADMINS_ONLY" });
};

const requireUserAccess = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const orgId = req.query.organisation || req.query.organization;
  if (req.currentUser && orgId) {
    if (req.currentUser.user_role === SARDINE_ADMIN || req.currentUser.user_role === MULTI_ORG_ADMIN) {
      return next();
    }
    if (
      req.currentUser.user_role === "user" &&
      (req.currentUser.organisation_id === orgId || req.currentUser.organisation === orgId)
    ) {
      return next();
    }
  }
  return res.status(400).json({ error: "UNAUTHORIZED" });
};

const requireOrganisationAccess = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  const isSuperAdmin = req.currentUser && req.currentUser.user_role === SARDINE_ADMIN;
  if (isSuperAdmin) {
    return next();
  }

  const hasOrganisationAccess = await db.organisation.hasOrganisationAccess(
    req.body.organisation,
    req.currentUser ? req.currentUser.id : ""
  );
  if (hasOrganisationAccess) {
    return next();
  }

  return res.status(409).json({ error: "ACCESS_DENIED" });
};

const expressErrorHandler = (prefix: string) => (error: Error, req: RequestWithUser, res: Response, next: NextFunction) => {
  if (error.message === "INVALID_JSON_BODY_PARSER") {
    return res.status(400).send("bad json");
  }

  if (error.name === "ValidationError" && !res.headersSent) {
    return res.status(error.code).json(error.response);
  }

  const query = error.query ? error.query.toString() : null;
  const code = error.code || null;
  const source = error.DB_ERROR ? `${prefix}_DB_ERROR` : `${prefix}_API_ERROR`;

  const message = JSON.stringify({
    message: error.message,
    url: req.url,
    method: req.method,
  });

  db.logs
    .logError(message, error.stack, req.id || "", req.currentUser ? req.currentUser.id : null, source, query, code)
    .then()
    .catch((e) => {
      captureException(e);
    });

  console.log(source, error);

  if (!res.headersSent) {
    res.status(500).send("An error occurred");
  }

  next(error);
  return undefined; // To satisfy ESLint rules
};

const assignId = function (req: RequestWithUser, _res: Response, next: NextFunction) {
  req.id = uuidv4();
  next();
};

const assignOrganisationClientId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (!req.currentUser) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
    let organisation = "";
    switch (req.currentUser.user_role) {
      case SARDINE_ADMIN:
        organisation = req.query.organisation as string;
        break;
      case MULTI_ORG_ADMIN:
        if (!(await db.organisation.hasOrganisationAccess(req.query.organisation as string, req.currentUser.id))) {
          organisation = req.query.organisation as string;
        }
        break;
      case "user":
        organisation = req.currentUser.organisation;
        break;
      default:
    }

    if (!organisation) {
      return res.status(400).json({ error: "Organisation is missing" });
    }

    req.currentUser.organisation_client_id = (await db.organisation.getClientId(organisation)) || undefined;
    next();
  } catch (err) {
    captureException(err);

    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

const jsonBodyParser = function (req: Request, res: Response, next: NextFunction) {
  bodyParser.json()(req, res, (err) => {
    if (err instanceof Error) next(new Error("INVALID_JSON_BODY_PARSER"));
    else next();
  });
};

const validateRequest = async (req: Request, res: Response, next: NextFunction) => {
  const errors = await validationResult(req);
  const hasErrors = !errors.isEmpty();
  if (hasErrors) {
    return res.status(400).json(errors);
  }
  next();
  return undefined;
};

export const mw = {
  attachCurrentUserToRequest,
  requireLoggedIn,
  expressErrorHandler,
  assignId,
  jsonBodyParser,
  requireSuperAdmin,
  validateRequest,
  requireAdminAccess,
  requireUserAccess,
  requireOrganisationAccess,
  assignOrganisationClientId,
};
