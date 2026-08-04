"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import {
  createOrganization,
  updateOrganization,
} from "@/features/organization/services/organization-service";
import { organizationCreateSchema, organizationUpdateSchema } from "@/lib/validations";
import { isDemo } from "@/lib/demo";

export async function createOrganizationAction(_prev: unknown, formData: FormData) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;

  const parsed = organizationCreateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    cnpj: formData.get("cnpj") || undefined,
    primaryColor: formData.get("primaryColor") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten(),
      message: "Corrija os dados antes de continuar.",
    };
  }

  const organization = await createOrganization({
    name: parsed.data.name,
    slug: parsed.data.slug,
    cnpj: parsed.data.cnpj,
    primaryColor: parsed.data.primaryColor,
    ownerUserId: userId,
  });

  await recordAudit({
    action: "organization.create",
    entityType: "Organization",
    entityId: organization.id,
    metadata: { orgName: organization.name },
  });

  revalidatePath("/app");
  redirect(`/app/dashboard`);
}

export async function updateOrganizationAction(prev: unknown, formData: FormData) {
  const session = await requireAuth();
  const userId = (session.user as { id: string }).id;
  const orgId = formData.get("organizationId")?.toString();

  if (!orgId) return { message: "Organização inválida." };

  if (!isDemo) {
    const membership = await prisma.organizationMember.findFirst({
      where: { organizationId: orgId, userId },
    });
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return { message: "Acesso negado." };
    }
  }

  const parsed = organizationUpdateSchema.safeParse({
    name: formData.get("name") ?? undefined,
    cnpj: formData.get("cnpj") ?? undefined,
    primaryColor: formData.get("primaryColor") ?? undefined,
    logoUrl: formData.get("logoUrl") ?? undefined,
  });

  if (!parsed.success) {
    return { message: "Dados inválidos." };
  }

  await updateOrganization({
    id: orgId,
    name: parsed.data.name,
    cnpj: parsed.data.cnpj,
    primaryColor: parsed.data.primaryColor,
    logoUrl: parsed.data.logoUrl,
  });
  await recordAudit({
    action: "organization.update",
    entityType: "Organization",
    entityId: orgId,
  });

  revalidatePath("/app/administracao");
  return { success: true };
}