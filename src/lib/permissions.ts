import type { Role } from "@prisma/client";

/**
 * RBAC — Mapa de permissões por papel (função) dentro do tenant.
 * Cada `permission` é uma string `modulo.acao`.
 */

export type Permission =
  | "dashboard.view"
  | "patients.view"
  | "patients.create"
  | "patients.edit"
  | "patients.delete"
  | "patients.metadata"
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.cancel"
  | "appointments.waitlist"
  | "finance.view"
  | "finance.create"
  | "finance.edit"
  | "finance.delete"
  | "finance.export"
  | "prontuario.view"
  | "prontuario.create"
  | "prontuario.edit"
  | "reports.view"
  | "reports.export"
  | "admin.users"
  | "admin.settings"
  | "admin.catalog"
  | "audit.view";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "patients.edit",
    "patients.delete",
    "patients.metadata",
    "appointments.view",
    "appointments.create",
    "appointments.edit",
    "appointments.cancel",
    "appointments.waitlist",
    "finance.view",
    "finance.create",
    "finance.edit",
    "finance.delete",
    "finance.export",
    "prontuario.view",
    "prontuario.create",
    "prontuario.edit",
    "reports.view",
    "reports.export",
    "admin.users",
    "admin.settings",
    "admin.catalog",
    "audit.view",
  ],
  ADMIN: [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "patients.edit",
    "patients.delete",
    "patients.metadata",
    "appointments.view",
    "appointments.create",
    "appointments.edit",
    "appointments.cancel",
    "appointments.waitlist",
    "finance.view",
    "finance.create",
    "finance.edit",
    "finance.delete",
    "finance.export",
    "prontuario.view",
    "prontuario.create",
    "prontuario.edit",
    "reports.view",
    "reports.export",
    "admin.users",
    "admin.settings",
    "admin.catalog",
    "audit.view",
  ],
  STAFF: [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "patients.edit",
    "appointments.view",
    "appointments.create",
    "appointments.edit",
    "appointments.cancel",
    "appointments.waitlist",
    "finance.view",
    "finance.create",
    "prontuario.view",
    "prontuario.create",
    "prontuario.edit",
    "reports.view",
  ],
  RECEPTION: [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "patients.edit",
    "appointments.view",
    "appointments.create",
    "appointments.edit",
    "appointments.cancel",
    "appointments.waitlist",
    "finance.view",
    "finance.create",
  ],
  READONLY: [
    "dashboard.view",
    "patients.view",
    "appointments.view",
    "finance.view",
    "prontuario.view",
    "reports.view",
  ],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasPermission(
  role: Role | undefined | null,
  permissions: Permission[],
): boolean {
  if (!role) return false;
  const granted = new Set(ROLE_PERMISSIONS[role]);
  return permissions.some((p) => granted.has(p));
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  STAFF: "Equipe clínica",
  RECEPTION: "Recepção",
  READONLY: "Somente leitura",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: "Acesso total à clínica e à administração",
  ADMIN: "Gestão de usuários, catálogo e configurações",
  STAFF: "Agenda, pacientes, prontuário e financeiro",
  RECEPTION: "Agenda, pacientes e recebimentos",
  READONLY: "Visualização de todos os módulos",
};