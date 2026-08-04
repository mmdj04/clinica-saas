import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { isDemo } from "@/lib/demo";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });
}

export const prisma = isDemo
  ? (null as unknown as PrismaClient)
  : (globalForPrisma.prisma ?? createPrismaClient());

if (!isDemo && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prismaAdapter };
