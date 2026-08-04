import "server-only";
import type { PrismaClient } from "@prisma/client";
import { isDemo } from "@/lib/demo";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  const { PrismaClient: PC } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PC({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });
}

async function ensurePrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = await createPrismaClient();
  }
  return globalForPrisma.prisma;
}

function createProxy(target: any): any {
  return new Proxy(target, {
    get(_, prop) {
      if (isDemo) {
        throw new Error("Database not available in demo mode");
      }
      return createProxy(
        (...args: any[]) =>
          ensurePrisma().then((client) => {
            const val = (client as any)[prop];
            return typeof val === "function" ? val.apply(client, args) : val;
          })
      );
    },
    apply(_, __, args) {
      return target(...args);
    },
  });
}

export const prisma = createProxy({}) as PrismaClient;

export async function prismaAdapter(client: any, opts: { provider: "postgresql" }) {
  const { prismaAdapter: adapter } = await import("better-auth/adapters/prisma");
  return adapter(client, opts);
}
