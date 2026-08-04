export type PatientStatus = "active" | "inactive" | "blocked";

export type PatientGender = "MALE" | "FEMALE" | "OTHER" | "NOT_INFORMED";

export interface PatientTagItem {
  id: string;
  name: string;
  color: string;
}

export interface PatientListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  birthDate: Date | null;
  gender: PatientGender;
  photoUrl: string | null;
  cep: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  responsibleName: string | null;
  responsiblePhone: string | null;
  notes: string | null;
  source: string | null;
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  tags: PatientTagItem[];
}

export interface PatientDetailItem extends PatientListItem {
  _count: {
    appointments: number;
    anamnesis: number;
    evolutions: number;
    prescriptions: number;
    exams: number;
    attachments: number;
  };
  recentAppointments: {
    id: string;
    startAt: Date;
    endAt: Date;
    status: string;
    professional: { name: string };
  }[];
}

export interface PatientListParams {
  q?: string;
  status?: PatientStatus;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface PatientListResult {
  items: PatientListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const GENDER_LABELS: Record<PatientGender, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
  NOT_INFORMED: "Não informado",
};

export const STATUS_LABELS: Record<PatientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};
