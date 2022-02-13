import express, { Response } from "express";
import { query, body } from "express-validator";
import config from "config";
import * as Sentry from "@sentry/node";
import sgMail from "@sendgrid/mail";
import {
  authUrls,
  getFailureResult,
  getSuccessResult,
  isFailure,
  ResetPasswordLinkRequestBody,
  ALL,
  MULTI_ORG_ADMIN,
  SARDINE_ADMIN,
  AUDIT_LOG_TYPES,
} from "sardine-dashboard-typescript-definitions";
import { helpers } from "../../commons/helpers";
import { db } from "../../commons/db";
import { mw } from "../../commons/middleware";
import { firebaseAdmin } from "../../commons/firebase";
import { AuthService } from "../../commons/AuthService";
import { captureException, getErrorMessage, isErrorWithSpecificCode } from "../../utils/error-utils";
import {
  RequestWithUser,
  RegistrationRequest,
  GoogleSigninRequest,
  LoginRequest,
  CreateOrganisation,
} from "../request-interface";
import { resetPasswordRateLimitByEmailMw, resetPasswordRateLimitByIpMw } from "../middlewares/auth";
import { writeAuditLog } from "../utils/routes/audit";

const milliSecondsInTwoWeeks = 1209600000;
const router = express.Router();
const {
  registerRoute,
  googleSignInRoute,
  loginRoute,
  createOrganisationRoute,
  fetchOrganisationRoute,
  fetchOrganisationDetailRoute,
  getUsersRoute,
  getUserRoute,
  getAdminUsersRoute,
  deleteUserRoute,
  getOrganizeUsersRoute,
  logoutRoute,
  resetPasswordLinkRoute,
} = authUrls.routes;

const createSession = async (res: Response, userId: string, ip: string | string[]) => {
  const session = await db.session.createSession(userId, "2 weeks", ip);
  const sessionCookieSecure: boolean = config.get("SESSION_COOKIE_SECURE");
  const sessionCookieSameSite: boolean = config.get("SESSION_COOKIE_SAME_SITE");

  const cookieOptions = {
    maxAge: milliSecondsInTwoWeeks,
    secure: sessionCookieSecure,
    httpOnly: true,
    path: "/",
    sameSite: sessionCookieSameSite,
  };

  res.cookie("sardine__sess", session.id, cookieOptions);
};

const authRouter = (authService: AuthService) => {
  router[registerRoute.httpMethod](
    registerRoute.path,
    [(body("invitationToken").exists().optional(), body("idToken").exists())],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { name, email, idToken, invitationToken } = req.body as RegistrationRequest;
      let user;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { email_verified = false, uid } = await firebaseAdmin.verifyIdToken(idToken);
      const data = {
        email_verified,
        name,
        email,
      };
      try {
        const isSuperAdmin = await db.auth.checkSuperAdmin(data.email);
        if (isSuperAdmin) {
          user = await db.auth.createSuperadmin(name, email, data.email_verified, uid);
        } else {
          const isValidInvitation = await db.auth.checkInvitationToken(invitationToken);
          if (!isValidInvitation) {
            throw new Error("INVALID_INVITATION_TOKEN");
          }

          // eslint-disable-next-line @typescript-eslint/naming-convention
          const { disable_password_login } =
            (await db.organizationConfig.isDisablePasswordLogin(isValidInvitation.organisation_id)) || {};

          if (disable_password_login) {
            return res.status(403).json({ eror: "DISABLED_REGISTRATION_METHOD" });
          }

          const isAdminUser = await db.auth.isAdminUser(isValidInvitation.organisation_id);

          user = await db.auth.createUser(
            data.name,
            data.email,
            data.email_verified,
            isValidInvitation.organisation_id,
            uid,
            invitationToken,
            isAdminUser?.is_admin || false
          );
        }

        const sessionData = {
          id: user.id,
          name: user.name,
          organisation: user.organisation_id,
          email: user.email,
          user_role: user.user_role,
          is_email_verified: user.is_email_verified,
        };

        const clientID =
          user.user_role === SARDINE_ADMIN ? "" : await db.organisation.getClientIdFromOrganizationId(user.organisation_id);
        const userId = parseInt(user.id, 10);
        if (clientID && !Number.isNaN(userId)) {
          db.audit.createLog(clientID, AUDIT_LOG_TYPES.CREATE_USER, userId, userId, Object(sessionData)).catch(captureException);
        }

        if (data.email_verified) {
          await createSession(res, user.id, helpers.getIp(req));
          return res.json(sessionData);
        }

        return res.json({ is_email_verified: user.is_email_verified });
      } catch (e) {
        captureException(e);
        await firebaseAdmin.deleteUser(uid);
        return res.status(400).json({ error: "ERROR_IN_REGISTRATION" });
      }
    }
  );

  router[googleSignInRoute.httpMethod](
    googleSignInRoute.path,
    [body("invitationToken").exists().optional(), body("idToken").exists()],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { idToken, invitationToken } = req.body as GoogleSigninRequest;
      let user;
      const data = await firebaseAdmin.verifyIdToken(idToken);
      try {
        const isSuperAdmin = await db.auth.checkSuperAdmin(data.email);
        const isExistingUser = await db.auth.isExistingUser(data.email);
        if (isSuperAdmin) {
          user = await db.auth.createSuperadmin(data.name, data.email || "", data.email_verified || false, data.uid);
        } else if (!isExistingUser) {
          const isValidInvitation = await db.auth.checkInvitationToken(invitationToken);
          if (!isValidInvitation) {
            throw new Error("INVALID_INVITATION_TOKEN");
          }

          const isAdminUser = await db.auth.isAdminUser(isValidInvitation.organisation_id);

          user = await db.auth.createUser(
            data.name,
            data.email || "",
            data.email_verified || false,
            isValidInvitation.organisation_id,
            data.uid,
            invitationToken,
            isAdminUser.is_admin ? isAdminUser.is_admin : false
          );
        } else {
          user = await db.auth.getUserByFirebaseUid(data.uid);
        }

        const response = {
          id: user.id,
          name: user.name,
          organisation: user.user_role === SARDINE_ADMIN ? ALL : user.organisation_id,
          email: user.email,
          user_role: user.user_role,
          is_email_verified: user.is_email_verified,
        };

        if (!isExistingUser) {
          const clientID =
            user.user_role === SARDINE_ADMIN ? "" : await db.organisation.getClientIdFromOrganizationId(user.organisation_id);
          const userId = parseInt(user.id, 10);
          if (clientID && !Number.isNaN(userId)) {
            db.audit.createLog(clientID, AUDIT_LOG_TYPES.CREATE_USER, userId, userId, Object(response)).catch(captureException);
          }
        }

        await createSession(res, user.id, helpers.getIp(req));
        return res.json(response);
      } catch (e) {
        captureException(e);
        await firebaseAdmin.deleteUser(data.uid);
        return res.status(400).json({ error: "ERROR_IN_REGISTRATION" });
      }
    }
  );

  router[loginRoute.httpMethod](
    loginRoute.path,
    [body("idToken").exists()],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { idToken } = req.body as LoginRequest;
      try {
        const decodedToken = await firebaseAdmin.verifyIdToken(idToken);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { email_verified = false, uid } = decodedToken;
        if (!email_verified) {
          return res.status(400).json({ error: "EMAIL_NOT_VERIFIED" });
        }
        const userDetails = await db.auth.getUserByFirebaseUid(uid);
        await createSession(res, userDetails.id, helpers.getIp(req));
        return res.json({
          id: userDetails.id,
          name: userDetails.name,
          organisation: userDetails.user_role === SARDINE_ADMIN ? ALL : userDetails.organisation_id,
          email: userDetails.email,
          user_role: userDetails.user_role,
          is_email_verified: userDetails.is_email_verified,
        });
      } catch (e) {
        captureException(e);
        return res.status(400).json({ error: "LOGIN_FAILED" });
      }
    }
  );

  router.get(
    "/get-email-from-token",
    [query(["token"]).exists()],
    mw.validateRequest,
    async (req: RequestWithUser, res: Response) => {
      const { token = "" } = req.query;

      try {
        const email = await db.auth.retriveEmail(token.toString());
        return res.json({ email });
      } catch (e) {
        captureException(e);
        return res.status(400).json({ error: "failed to retrive email" });
      }
    }
  );

  router[createOrganisationRoute.httpMethod](
    createOrganisationRoute.path,
    mw.requireLoggedIn,
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { organisation, user_type, parentOrg } = req.body as CreateOrganisation;
      try {
        const isAdmin = user_type === MULTI_ORG_ADMIN;
        const result = await authService.createNewClient(organisation);
        // clientId might be null. It is fine.
        const clientId = (await db.organisation.getClientId(parentOrg)) || "";

        const { id } = await db.organisation.createOrganisation(
          result.clientID,
          organisation,
          isAdmin,
          (req.currentUser && req.currentUser.id) || "",
          clientId
        );

        if (id && !Number.isNaN(parseInt(id, 10))) {
          writeAuditLog(req, result.clientID, parseInt(id, 10), AUDIT_LOG_TYPES.CREATE_ORGANIZATION, {
            name: organisation,
            ...result,
          });
        }

        return res.json({ name: organisation, ...result });
      } catch (e) {
        captureException(e);
        return res.status(409).json({ error: getErrorMessage(e) });
      }
    }
  );

  router[fetchOrganisationRoute.httpMethod](
    fetchOrganisationRoute.path,
    mw.requireLoggedIn,
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      try {
        const organisationID = req.currentUser?.organisation_id || "";
        const organisationsResult = await db.organisation.getOrganisationsResult(organisationID);
        if (isFailure(organisationsResult)) {
          captureException(getFailureResult(organisationsResult));
          return res.status(500).json({ error: getErrorMessage(organisationsResult) });
        }
        const organisations = getSuccessResult(organisationsResult);
        const names = organisations.length > 0 ? organisations.map((org) => ({ name: org.display_name })) : [];
        return res.json(names);
      } catch (e) {
        captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[fetchOrganisationDetailRoute.httpMethod](
    fetchOrganisationDetailRoute.path,
    mw.requireLoggedIn,
    mw.requireAdminAccess,
    async (req: RequestWithUser, res: Response) => {
      try {
        const organisationID = req.currentUser?.organisation_id || "";
        const organisationsResult = await db.organisation.getOrganisationsResult(organisationID);
        if (isFailure(organisationsResult)) {
          captureException(getFailureResult(organisationsResult));
          return res.status(500).json({ error: getErrorMessage(organisationsResult) });
        }
        const organisations = getSuccessResult(organisationsResult);
        return res.json(organisations);
      } catch (e) {
        captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[getUserRoute.httpMethod](getUserRoute.path, mw.requireLoggedIn, (req: RequestWithUser, res: Response) => {
    try {
      const userData = req.currentUser;
      return res.json({ userData });
    } catch (e) {
      captureException(e);
      return res.status(500).json({ error: "internal error" });
    }
  });

  router[getUsersRoute.httpMethod](
    getUsersRoute.path,
    mw.requireLoggedIn,
    mw.requireSuperAdmin,
    async (req: RequestWithUser, res: Response) => {
      try {
        const result = await db.auth.getAllUsers();
        return res.json({ result });
      } catch (e) {
        captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[getAdminUsersRoute.httpMethod](
    getAdminUsersRoute.path,
    mw.requireLoggedIn,
    mw.requireSuperAdmin,
    async (req: RequestWithUser, res: Response) => {
      try {
        const result = await db.auth.getAllAdminUsers();
        return res.json({ result });
      } catch (e) {
        captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[deleteUserRoute.httpMethod](
    deleteUserRoute.path,
    mw.requireLoggedIn,
    mw.requireAdminAccess,
    [query("id").exists()],
    async (req: RequestWithUser, res: Response) => {
      try {
        const uID: string = req.query.id as string;
        const organisation: string = req.query.organisation as string;
        await db.auth.deleteUser(uID);

        const clientID = organisation && (await db.organisation.getClientId(organisation));
        if (clientID) {
          writeAuditLog(req, clientID, parseInt(uID, 10), AUDIT_LOG_TYPES.DELETE_USER, JSON.parse(`{ "user_id": "${uID}" }`));
        }

        return res.end();
      } catch (e) {
        captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[getOrganizeUsersRoute.httpMethod](
    getOrganizeUsersRoute.path,
    [query(["organization"]).exists()],
    mw.requireLoggedIn,
    async (req: RequestWithUser, res: Response) => {
      const organization: string = req.query.organization as string;

      try {
        const result = await db.auth.getOrganizationUsers(organization || "");
        return res.json({ result });
      } catch (e) {
        captureException(e);
        return res.status(500).json({ error: "internal error" });
      }
    }
  );

  router[logoutRoute.httpMethod](logoutRoute.path, mw.requireLoggedIn, async (req: RequestWithUser, res: Response) => {
    try {
      const sessionId = req.cookies.sardine__sess;
      if (sessionId && helpers.isValidUuid(sessionId)) {
        await db.session.logoutSession((req.currentUser && req.currentUser.id) || "", sessionId);
      }
      res.end();
    } catch (e) {
      captureException(e);
      res.status(500).json({ error: "internal error" });
    }
  });

  router[resetPasswordLinkRoute.httpMethod](
    resetPasswordLinkRoute.path,
    [body("email").isEmail()],
    mw.validateRequest,
    resetPasswordRateLimitByEmailMw,
    resetPasswordRateLimitByIpMw,
    async (req: RequestWithUser<ResetPasswordLinkRequestBody>, res: Response) => {
      try {
        const { email } = req.body;
        const link = await firebaseAdmin.auth.generatePasswordResetLink(email);
        sgMail.setApiKey(String(process.env.SENDGRID_SECRET));

        const msg = {
          to: email,
          from: "support@sardine.ai",
          subject: "Sardine Dashboard - Reset password",
          text: `Please click ${link} to reset your password for your ${email} account`,
          html: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<body>
  <div style="margin-bottom: 10px">Hi,</div> 
  <div style="margin-bottom: 10px">Follow this link to reset your password for your ${email} account.</div>
  <div style="margin-bottom: 10px">${link}</div>
  <div style="margin-bottom: 10px">If you didn’t ask to reset your password, you can ignore this email.</div>
  <div style="margin-bottom: 10px">Thanks,</div>
  <div>Sardine team</div>
</body>
</html>
          `,
        };
        await sgMail.send(msg);

        res.end();
      } catch (e) {
        // this code means firebase can't find the account related to the email address
        if (isErrorWithSpecificCode(e, "auth/email-not-found")) {
          // not expose email exists or not
          res.status(200);
          res.end();
          return;
        }

        Sentry.captureException(e);
        res.status(500).json({ error: "internal error" });
      }
    }
  );

  return router;
};

export default authRouter;
