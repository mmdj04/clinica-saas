"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireOrg } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { runWithTenant } from "@/lib/multi-tenancy";
import { recordAudit } from "@/lib/audit";
import {
  inviteMemberSchema,
  updateMemberSchema,
  specialtyCreateSchema,
  roomCreateSchema,
  professionalCreateSchema,
  organizationUpdateSchema,
} from "@/lib/validations/organization";
import * as adminService from "@/features/admin/services/admin-service";

async function requireAdmin() {
  const ctx = await requireOrg();
  if (!["OWNER", "ADMIN"].includes(ctx.role)) {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}

async function withTenant<T>(ctx: { organizationId: string; userId: string; role: string }, fn: () => Promise<T>): Promise<T> {
  return runWithTenant(
    { organizationId: ctx.organizationId, userId: ctx.userId, role: ctx.role },
    fn,
  );
}

// ── Members ──────────────────────────────────────────────────

export async function inviteMemberAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();

    const parsed = inviteMemberSchema.safeParse({
      email: formData.get("email"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.inviteMember(ctx.organization.id, parsed.data);
      },
    );

    await recordAudit({
      action: "member.invite",
      entityType: "OrganizationMember",
      metadata: { email: parsed.data.email, role: parsed.data.role },
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao convidar membro.";
    return { message };
  }
}

export async function updateMemberRoleAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();

    const parsed = updateMemberSchema.safeParse({
      memberId: formData.get("memberId"),
      role: formData.get("role"),
      status: formData.get("status") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.updateMemberRole(ctx.organization.id, parsed.data.memberId, {
          role: parsed.data.role,
          status: parsed.data.status,
        });
      },
    );

    await recordAudit({
      action: "member.updateRole",
      entityType: "OrganizationMember",
      entityId: parsed.data.memberId,
      metadata: { role: parsed.data.role },
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar membro.";
    return { message };
  }
}

export async function removeMemberAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const memberId = formData.get("memberId")?.toString();
    if (!memberId) return { message: "ID inválido." };

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.removeMember(ctx.organization.id, memberId);
      },
    );

    await recordAudit({
      action: "member.remove",
      entityType: "OrganizationMember",
      entityId: memberId,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao remover membro.";
    return { message };
  }
}

// ── Specialties ──────────────────────────────────────────────

export async function createSpecialtyAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();

    const parsed = specialtyCreateSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color") || undefined,
      durationMinutes: formData.get("durationMinutes") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.createSpecialty(ctx.organization.id, parsed.data);
      },
    );

    await recordAudit({
      action: "specialty.create",
      entityType: "Specialty",
      metadata: { name: parsed.data.name },
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar especialidade.";
    return { message };
  }
}

export async function updateSpecialtyAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const id = formData.get("id")?.toString();
    if (!id) return { message: "ID inválido." };

    const parsed = specialtyCreateSchema.partial().safeParse({
      name: formData.get("name") || undefined,
      color: formData.get("color") || undefined,
      durationMinutes: formData.get("durationMinutes") || undefined,
    });

    const active = formData.get("active");
    const activeValue = active !== null ? active === "true" : undefined;

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.updateSpecialty(ctx.organization.id, id, {
          ...parsed.data,
          active: activeValue,
        });
      },
    );

    await recordAudit({
      action: "specialty.update",
      entityType: "Specialty",
      entityId: id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar especialidade.";
    return { message };
  }
}

export async function deleteSpecialtyAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const id = formData.get("id")?.toString();
    if (!id) return { message: "ID inválido." };

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.deleteSpecialty(ctx.organization.id, id);
      },
    );

    await recordAudit({
      action: "specialty.delete",
      entityType: "Specialty",
      entityId: id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao excluir especialidade.";
    return { message };
  }
}

// ── Rooms ────────────────────────────────────────────────────

export async function createRoomAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();

    const parsed = roomCreateSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.createRoom(ctx.organization.id, parsed.data);
      },
    );

    await recordAudit({
      action: "room.create",
      entityType: "Room",
      metadata: { name: parsed.data.name },
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar sala.";
    return { message };
  }
}

export async function updateRoomAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const id = formData.get("id")?.toString();
    if (!id) return { message: "ID inválido." };

    const parsed = roomCreateSchema.partial().safeParse({
      name: formData.get("name") || undefined,
      color: formData.get("color") || undefined,
    });

    const active = formData.get("active");
    const activeValue = active !== null ? active === "true" : undefined;

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.updateRoom(ctx.organization.id, id, {
          ...parsed.data,
          active: activeValue,
        });
      },
    );

    await recordAudit({
      action: "room.update",
      entityType: "Room",
      entityId: id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar sala.";
    return { message };
  }
}

export async function deleteRoomAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const id = formData.get("id")?.toString();
    if (!id) return { message: "ID inválido." };

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.deleteRoom(ctx.organization.id, id);
      },
    );

    await recordAudit({
      action: "room.delete",
      entityType: "Room",
      entityId: id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao excluir sala.";
    return { message };
  }
}

// ── Professionals ────────────────────────────────────────────

export async function createProfessionalAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();

    const parsed = professionalCreateSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      documentNumber: formData.get("documentNumber") || undefined,
      specialtyId: formData.get("specialtyId") || undefined,
      color: formData.get("color") || undefined,
      commissionRate: formData.get("commissionRate") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.createProfessional(ctx.organization.id, parsed.data);
      },
    );

    await recordAudit({
      action: "professional.create",
      entityType: "Professional",
      metadata: { name: parsed.data.name },
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar profissional.";
    return { message };
  }
}

export async function updateProfessionalAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const id = formData.get("id")?.toString();
    if (!id) return { message: "ID inválido." };

    const parsed = professionalCreateSchema.partial().safeParse({
      name: formData.get("name") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      documentNumber: formData.get("documentNumber") || undefined,
      specialtyId: formData.get("specialtyId") || undefined,
      color: formData.get("color") || undefined,
      commissionRate: formData.get("commissionRate") || undefined,
    });

    const active = formData.get("active");
    const activeValue = active !== null ? active === "true" : undefined;

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.updateProfessional(ctx.organization.id, id, {
          ...parsed.data,
          active: activeValue,
        });
      },
    );

    await recordAudit({
      action: "professional.update",
      entityType: "Professional",
      entityId: id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar profissional.";
    return { message };
  }
}

export async function deleteProfessionalAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();
    const id = formData.get("id")?.toString();
    if (!id) return { message: "ID inválido." };

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.deleteProfessional(ctx.organization.id, id);
      },
    );

    await recordAudit({
      action: "professional.delete",
      entityType: "Professional",
      entityId: id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao excluir profissional.";
    return { message };
  }
}

// ── Organization Settings ────────────────────────────────────

export async function updateOrganizationSettingsAction(prev: unknown, formData: FormData) {
  try {
    const ctx = await requireAdmin();

    const weekdaysRaw = formData.get("weekdays");
    const weekdays = weekdaysRaw ? JSON.parse(weekdaysRaw as string) : undefined;

    const workingHoursRaw = formData.get("workingHours");
    const workingHours = workingHoursRaw ? JSON.parse(workingHoursRaw as string) : undefined;

    const parsed = organizationUpdateSchema.safeParse({
      name: formData.get("name") || undefined,
      cnpj: formData.get("cnpj") || undefined,
      primaryColor: formData.get("primaryColor") || undefined,
      logoUrl: formData.get("logoUrl") || undefined,
      settings: {
        ...(workingHours && { workingHours }),
        ...(formData.get("slotMinutes") && {
          slotMinutes: Number(formData.get("slotMinutes")),
        }),
        ...(weekdays && { weekdays }),
      },
    });

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors, message: "Corrija os erros." };
    }

    await withTenant(
      { organizationId: ctx.organization.id, userId: (ctx.user as { id: string }).id, role: ctx.role },
      async () => {
        await adminService.updateOrganizationSettings(ctx.organization.id, parsed.data);
      },
    );

    await recordAudit({
      action: "organization.updateSettings",
      entityType: "Organization",
      entityId: ctx.organization.id,
    });

    revalidatePath("/app/administracao");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar configurações.";
    return { message };
  }
}
