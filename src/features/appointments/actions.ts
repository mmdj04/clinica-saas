"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { recordAudit } from "@/lib/audit";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  appointmentCancelSchema,
  waitlistCreateSchema,
} from "@/lib/validations/appointment";
import {
  createAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  createWaitingListEntry,
  updateWaitingListEntry,
  deleteWaitingListEntry,
} from "./services/appointment-service";

function getOrgId(session: { user: unknown }) {
  return (session.user as { organizationId?: string }).organizationId ?? null;
}

export async function createAppointmentAction(
  organizationId: string,
  _prev: unknown,
  formData: FormData,
) {
  const session = await requireAuth();

  const parsed = appointmentCreateSchema.safeParse({
    patientId: formData.get("patientId"),
    professionalId: formData.get("professionalId"),
    roomId: formData.get("roomId") || undefined,
    specialtyId: formData.get("specialtyId") || undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    type: formData.get("type") || undefined,
    price: formData.get("price") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten(), message: "Corrija os erros abaixo." };
  }

  try {
    const appointment = await createAppointment(organizationId, parsed.data);
    await recordAudit({
      action: "appointment.create",
      entityType: "Appointment",
      entityId: appointment.id,
      metadata: { patientId: parsed.data.patientId },
    });
    revalidatePath("/app/agenda");
    return { success: true };
  } catch (err) {
    console.error("[appointment.create]", err);
    return { message: "Erro ao criar agendamento." };
  }
}

export async function updateAppointmentAction(
  appointmentId: string,
  organizationId: string,
  _prev: unknown,
  formData: FormData,
) {
  const session = await requireAuth();

  const parsed = appointmentUpdateSchema.safeParse({
    patientId: formData.get("patientId") || undefined,
    professionalId: formData.get("professionalId") || undefined,
    roomId: formData.get("roomId") || undefined,
    specialtyId: formData.get("specialtyId") || undefined,
    startAt: formData.get("startAt") || undefined,
    endAt: formData.get("endAt") || undefined,
    status: formData.get("status") || undefined,
    type: formData.get("type") || undefined,
    price: formData.get("price") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten(), message: "Corrija os erros abaixo." };
  }

  try {
    await updateAppointment(appointmentId, organizationId, parsed.data);
    await recordAudit({
      action: "appointment.update",
      entityType: "Appointment",
      entityId: appointmentId,
    });
    revalidatePath("/app/agenda");
    return { success: true };
  } catch (err) {
    console.error("[appointment.update]", err);
    return { message: "Erro ao atualizar agendamento." };
  }
}

export async function cancelAppointmentAction(
  appointmentId: string,
  organizationId: string,
  _prev: unknown,
  formData: FormData,
) {
  await requireAuth();

  const parsed = appointmentCancelSchema.safeParse({
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten(), message: "Informe o motivo." };
  }

  try {
    await cancelAppointment(appointmentId, organizationId, parsed.data.reason);
    await recordAudit({
      action: "appointment.cancel",
      entityType: "Appointment",
      entityId: appointmentId,
      metadata: { reason: parsed.data.reason },
    });
    revalidatePath("/app/agenda");
    return { success: true };
  } catch (err) {
    console.error("[appointment.cancel]", err);
    return { message: "Erro ao cancelar agendamento." };
  }
}

export async function rescheduleAppointmentAction(
  appointmentId: string,
  organizationId: string,
  startAt: string,
  endAt: string,
) {
  await requireAuth();

  try {
    await rescheduleAppointment(
      appointmentId,
      organizationId,
      new Date(startAt),
      new Date(endAt),
    );
    await recordAudit({
      action: "appointment.reschedule",
      entityType: "Appointment",
      entityId: appointmentId,
    });
    revalidatePath("/app/agenda");
    return { success: true };
  } catch (err) {
    console.error("[appointment.reschedule]", err);
    return { message: "Erro ao reagendar." };
  }
}

// ── Waiting List ──────────────────────────────────────────────

export async function createWaitingListAction(
  organizationId: string,
  _prev: unknown,
  formData: FormData,
) {
  await requireAuth();

  const parsed = waitlistCreateSchema.safeParse({
    patientId: formData.get("patientId"),
    professionalId: formData.get("professionalId") || undefined,
    specialtyId: formData.get("specialtyId") || undefined,
    preferredDate: formData.get("preferredDate") || undefined,
    priority: formData.get("priority") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten(), message: "Corrija os erros abaixo." };
  }

  try {
    const entry = await createWaitingListEntry(organizationId, parsed.data);
    await recordAudit({
      action: "waitinglist.create",
      entityType: "WaitingListEntry",
      entityId: entry.id,
    });
    revalidatePath("/app/agenda");
    return { success: true };
  } catch (err) {
    console.error("[waitinglist.create]", err);
    return { message: "Erro ao adicionar à fila." };
  }
}

export async function updateWaitingListStatusAction(
  entryId: string,
  organizationId: string,
  status: string,
) {
  await requireAuth();
  await updateWaitingListEntry(entryId, organizationId, { status });
  await recordAudit({
    action: "waitinglist.update",
    entityType: "WaitingListEntry",
    entityId: entryId,
  });
  revalidatePath("/app/agenda");
  return { success: true };
}

export async function deleteWaitingListAction(
  entryId: string,
  organizationId: string,
) {
  await requireAuth();
  await deleteWaitingListEntry(entryId, organizationId);
  await recordAudit({
    action: "waitinglist.delete",
    entityType: "WaitingListEntry",
    entityId: entryId,
  });
  revalidatePath("/app/agenda");
  return { success: true };
}
