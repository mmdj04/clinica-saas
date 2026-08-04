"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import { isDemo } from "@/lib/demo";

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
  cnpj?: string;
  primaryColor?: string;
  ownerUserId: string;
}

export async function createOrganization(params: CreateOrganizationParams) {
  if (isDemo) {
    return { id: "demo-org-001", name: params.name, slug: slugify(params.slug || params.name), cnpj: params.cnpj || null, logoUrl: null, primaryColor: params.primaryColor || "#7c3aed", plan: "PRO", status: "ACTIVE", settings: {}, createdAt: new Date(), updatedAt: new Date() };
  }
  const baseSlug = slugify(params.slug || params.name);
  const slug = await ensureUniqueSlug(baseSlug);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: params.name,
        slug,
        cnpj: params.cnpj || null,
        primaryColor: params.primaryColor || "#7c3aed",
        settings: {
          slotMinutes: 30,
          weekdays: [1, 2, 3, 4, 5],
          workingHours: { start: "08:00", end: "18:00" },
          timezone: "America/Sao_Paulo",
          locale: "pt-BR",
          currency: "BRL",
        },
      },
    });

    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: params.ownerUserId,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    await tx.financeCategory.createMany({
      data: [
        { organizationId: organization.id, type: "REVENUE", name: "Consultas", color: "#7c3aed" },
        { organizationId: organization.id, type: "REVENUE", name: "Exames", color: "#0ea5e9" },
        { organizationId: organization.id, type: "REVENUE", name: "Procedimentos", color: "#10b981" },
        { organizationId: organization.id, type: "EXPENSE", name: "Aluguel", color: "#f43f5e" },
        { organizationId: organization.id, type: "EXPENSE", name: "Salários", color: "#f59e0b" },
        { organizationId: organization.id, type: "EXPENSE", name: "Materiais", color: "#6366f1" },
        { organizationId: organization.id, type: "EXPENSE", name: "Impostos", color: "#ef4444" },
      ],
    });

    return organization;
  });
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let tries = 0;
  while (true) {
    const existing = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    tries += 1;
    slug = `${base}-${tries}`;
  }
}

export interface UpdateOrganizationParams {
  id: string;
  name?: string;
  cnpj?: string;
  logoUrl?: string;
  primaryColor?: string;
  plan?: string;
  status?: string;
  settings?: Prisma.InputJsonValue;
}

export async function updateOrganization(params: UpdateOrganizationParams) {
  if (isDemo) {
    return { ...params, updatedAt: new Date() } as any;
  }
  const { id, ...data } = params;
  return prisma.organization.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
      ...(data.plan !== undefined && { plan: data.plan }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.settings !== undefined && { settings: data.settings }),
    },
  });
}

export async function getOrganizationBySlug(slug: string) {
  if (isDemo) {
    return { id: "demo-org-001", name: "Clínica Saúde Total", slug, cnpj: "12.345.678/0001-90", logoUrl: null, primaryColor: "#7c3aed", plan: "PRO", status: "ACTIVE", settings: {}, createdAt: new Date(), updatedAt: new Date() };
  }
  return prisma.organization.findUnique({ where: { slug } });
}

export async function listMemberships(userId: string) {
  if (isDemo) {
    return [{ id: "mem-1", organizationId: "demo-org-001", userId, role: "OWNER", status: "ACTIVE", createdAt: new Date(), organization: { id: "demo-org-001", name: "Clínica Saúde Total", slug: "clinica-saude-total", logoUrl: null, primaryColor: "#7c3aed" } }];
  }
  return prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  });
}