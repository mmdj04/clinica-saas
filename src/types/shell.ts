import type { Role } from "@prisma/client";

export interface ShellUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface ShellOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  plan?: string | null;
}

export interface ShellContext {
  user: ShellUser;
  organization: ShellOrganization;
  role: Role;
  memberships: Array<{ organizationId: string; role: Role; organization: ShellOrganization }>;
}