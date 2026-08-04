import { betterAuth } from "better-auth";
import { isDemo } from "@/lib/demo";

let _auth: any = null;

async function initAuth() {
  const { prisma } = await import("@/lib/prisma");
  const { prismaAdapter } = await import("@/lib/prisma");
  const adapter = await prismaAdapter(prisma, { provider: "postgresql" });

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: adapter,
    user: {
      modelName: "User",
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
      sendResetPassword: async () => {},
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
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
    trustedOrigins: [
      process.env.BETTER_AUTH_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    ].filter(Boolean) as string[],
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
}

async function getAuth() {
  if (!_auth) {
    _auth = await initAuth();
  }
  return _auth;
}

// Proxy that lazily initializes auth on first access
export const auth = new Proxy({} as any, {
  get(_, prop) {
    if (isDemo) {
      if (prop === "api") {
        return new Proxy({} as any, {
          get(_, method) {
            if (method === "getSession") return async () => null;
            return async () => null;
          },
        });
      }
      return async () => null;
    }
    return (...args: any[]) =>
      getAuth().then((instance: any) => {
        const val = instance[prop];
        return typeof val === "function" ? val.apply(instance, args) : val;
      });
  },
});
