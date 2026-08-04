import { AsyncLocalStorage } from "node:async_hooks";
import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * MULTI-TENANCY
 *
 * Contexto de tenant propagado por requisição via AsyncLocalStorage.
 * Todas as queries de negócio DEVERÃO passar por `withTenant` (services)
 * para que o `organizationId` seja injetado automaticamente.
 */

export interface TenantContext {
  organizationId: string;
  role: string;
  userId: string;
}

const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function runWithTenant<T>(ctx: TenantContext, fn: () => T): T {
  return tenantStorage.run(ctx, fn);
}

export function getTenant(): TenantContext | null {
  return tenantStorage.getStore() ?? null;
}

export function requireTenant(): TenantContext {
  const ctx = tenantStorage.getStore();
  if (!ctx) {
    throw new Error(
      "TenantContext ausente. Execute dentro de requireOrgContext() (service).",
    );
  }
  return ctx;
}

export function injectTenantScope<T extends Record<string, unknown>>(
  where: T,
): T {
  const ctx = requireTenant();
  return { ...where, organizationId: ctx.organizationId };
}

/**
 * Resolve a organização do usuário autenticado.
 * Usado em Server Components (cacheado por requisição via React `cache`).
 */
export const getCurrentOrganization = cache(async () => {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: (session.user as { id: string }).id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return null;

  return {
    organization: membership.organization,
    role: membership.role,
    memberships: await prisma.organizationMember.findMany({
      where: { userId: (session.user as { id: string }).id },
      include: { organization: true },
    }),
  };
});

export const getCurrentUser = cache(async () => {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
});