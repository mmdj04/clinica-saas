import { cache } from "react";
import { headers } from "next/headers";
import { getTenant } from "@/lib/multi-tenancy";
import { can as canWithRole, type Permission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

/**
 * Autorização de servidor.
 *
 * `requireOrg()` — Server Component: exige sessão + vínculo a uma organização.
 * `requirePermission(permission)` — Server Action / Route Handler: exige papel.
 */
export async function getSession() {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export const requireAuth = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
});

export async function requireOrg() {
  const session = await requireAuth();
  const { getCurrentOrganization } = await import("@/lib/multi-tenancy");
  const current = await getCurrentOrganization();
  if (!current) {
    throw new Error("NO_ORGANIZATION");
  }
  return {
    user: session.user,
    organization: current.organization,
    role: current.role as Role,
  };
}

export function requirePermission(permission: Permission): void {
  const tenant = getTenant();
  if (!tenant) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!canWithRole(tenant.role as Role, permission)) {
    throw new Error("FORBIDDEN");
  }
}

export async function assertPermission(permission: Permission) {
  const { requireOrg } = await import("@/lib/auth-guard");
  const ctx = await requireOrg();
  if (!canWithRole(ctx.role, permission)) {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}