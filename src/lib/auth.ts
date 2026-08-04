import { betterAuth } from "better-auth";
import { prismaAdapter, prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "User",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPassword: async () => {
      // Integração com provedor de e-mail (Resend) em production.
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 300,
      staleAfter: 60,
    },
  },
  advanced: {
    cookiePrefix: "clinica",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
  trustedOrigins: process.env.BETTER_AUTH_URL
    ? [process.env.BETTER_AUTH_URL]
    : [],
  rateLimit: {
    enabled: true,
    window: 60_000,
    max: 10,
    customRules: {
      "/sign-in/email": { window: 60_000, max: 5 },
      "/sign-up/email": { window: 60_000, max: 3 },
    },
  },
});