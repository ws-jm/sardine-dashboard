import mwRateLimit from "express-rate-limit";
import { ResetPasswordLinkRequestBody } from "sardine-dashboard-typescript-definitions";
import { RequestWithUser } from "../request-interface";

// This rate limit uses node.js in memory store. It won't work if we use multiple servers
const defaultResetPasswordRatelimitMw = {
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // start blocking after 3 requests
  message:
    "You have reached the limit for requesting password reset link for this email. Contact support if you cannot open the email",
};

export const resetPasswordRateLimitByEmailMw = mwRateLimit({
  ...defaultResetPasswordRatelimitMw,
  keyGenerator: (req: RequestWithUser<ResetPasswordLinkRequestBody>) => req.body.email,
});

export const resetPasswordRateLimitByIpMw = mwRateLimit({
  ...defaultResetPasswordRatelimitMw,
  keyGenerator: (req: RequestWithUser) => req.ip,
});
