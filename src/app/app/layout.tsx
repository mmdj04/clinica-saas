import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization, getCurrentUser } from "@/lib/multi-tenancy";
import { AppShell } from "@/components/layout/app-shell";
import { can, type Permission } from "@/lib/permissions";
import type { ShellContext } from "@/types/shell";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const orgId = current.organization.id;
  const memberships = current.memberships;

  const [specialtyCount, roomCount] = await Promise.all([
    prisma.specialty.count({ where: { organizationId: orgId } }),
    prisma.room.count({ where: { organizationId: orgId } }),
  ]);

  const untouched =
    specialtyCount === 0 && roomCount === 0
      ? await prisma.appointment.count({ where: { organizationId: orgId } })
      : 1;

  const shellContext: ShellContext = {
    user: {
      id: (user as { id: string }).id,
      name: (user as { name: string }).name,
      email: (user as { email: string }).email,
      image: (user as { image?: string | null }).image ?? null,
    },
    organization: {
      id: current.organization.id,
      name: current.organization.name,
      slug: current.organization.slug,
      logoUrl: current.organization.logoUrl,
      primaryColor: current.organization.primaryColor,
      plan: current.organization.plan,
    },
    role: current.role as Role,
    memberships: memberships.map((m: (typeof memberships)[number]) => ({
      organizationId: m.organization.id,
      role: m.role,
      organization: {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        logoUrl: m.organization.logoUrl,
        primaryColor: m.organization.primaryColor,
        plan: m.organization.plan,
      },
    })),
  };

  const has = (permission: Permission) => can(shellContext.role, permission);

  void untouched;

  return (
    <AppShell context={shellContext} has={has}>
      {children}
    </AppShell>
  );
}