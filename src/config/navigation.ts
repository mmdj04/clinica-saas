import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  ClipboardPlus,
  BarChart3,
  Settings,
  Plug,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  badge?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const mainNav: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/app/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
      {
        title: "Agenda",
        href: "/app/agenda",
        icon: CalendarDays,
        permission: "appointments.view",
      },
      {
        title: "Pacientes",
        href: "/app/pacientes",
        icon: Users,
        permission: "patients.view",
      },
      {
        title: "Financeiro",
        href: "/app/financeiro",
        icon: Wallet,
        permission: "finance.view",
      },
      {
        title: "Prontuário",
        href: "/app/prontuario",
        icon: ClipboardPlus,
        permission: "prontuario.view",
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Relatórios",
        href: "/app/relatorios",
        icon: BarChart3,
        permission: "reports.view",
      },
      {
        title: "Administração",
        href: "/app/administracao",
        icon: Settings,
        permission: "admin.settings",
      },
      {
        title: "Integrações",
        href: "/app/integracoes",
        icon: Plug,
        permission: "admin.settings",
      },
    ],
  },
];

export function filterNav(groups: NavGroup[], has: (p: Permission) => boolean): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || has(item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}