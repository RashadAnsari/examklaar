import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware, getIp } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";
import { sendEmail } from "@/lib/email/mailer";
import { confirmSignupEmail, resetPasswordEmail } from "@/lib/email/templates";
import { VerificationRepository } from "@/lib/repositories/verificationRepository";

/**
 * Endpoints worth an audit log line. Sign-in and the password flows are how
 * accounts get taken over, so their failures must be visible: a brute-force
 * run otherwise leaves no trace anywhere.
 */
const AUDITED_PATHS: Record<string, string> = {
  "/sign-in/email": "sign-in",
  "/sign-up/email": "sign-up",
  "/sign-out": "sign-out",
  "/request-password-reset": "password-reset-request",
  "/reset-password": "password-reset",
  "/delete-user": "account-delete",
};

export const auth = betterAuth({
  database: pool,
  hooks: {
    // Better Auth deletes an account without a password while the session is
    // less than a day old. Deletion cannot be undone, so always ask for it: a
    // session left open on a shared computer must not be enough.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/delete-user" && !ctx.body?.password) {
        throw new APIError("BAD_REQUEST", { message: "Password is required" });
      }
    }),
    // Runs after every auth endpoint, including ones that failed: a thrown
    // APIError lands in ctx.context.returned instead of unwinding the hook.
    after: createAuthMiddleware(async (ctx) => {
      const action = AUDITED_PATHS[ctx.path];
      if (!action) {
        return;
      }
      // The delete request carries no email, so take it from the session.
      const email =
        typeof ctx.body?.email === "string"
          ? ctx.body.email
          : (ctx.context.session?.user.email ?? "-");
      const ip = (ctx.headers && getIp(ctx.headers, ctx.context.options)) || "-";
      const returned = ctx.context.returned;
      if (returned instanceof APIError) {
        console.warn(
          "[auth] %s failed email=%s ip=%s reason=%s",
          action,
          email,
          ip,
          returned.status
        );
      } else {
        console.info("[auth] %s ok email=%s ip=%s", action, email, ip);
      }
    }),
  },
  user: {
    deleteUser: {
      enabled: true,
      // Deleting the "user" row cascades to sessions, accounts and exam
      // results. Verification tokens are outside that cascade.
      beforeDelete: async (user) => {
        await new VerificationRepository(pool).deleteForUser(user);
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: resetPasswordEmail(url),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your account",
        html: confirmSignupEmail(url),
      });
    },
  },
  plugins: [nextCookies()],
});
