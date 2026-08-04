import type {
  Anamnesis,
  Evolution,
  Prescription,
  Exam,
  Attachment,
  Patient,
  Professional,
} from "@prisma/client";

export type { Anamnesis, Evolution, Prescription, Exam, Attachment };

export type EvolutionType = "INITIAL" | "EVOLUTION" | "PROFESSIONAL_NOTE" | "DISCHARGE";

export type ExamStatus = "ordered" | "collected" | "ready" | "delivered";

export type AttachmentCategory =
  | "DOCUMENT"
  | "PHOTO"
  | "EXTERNAL_REPORT"
  | "EXAM"
  | "RECEIPT"
  | "OTHER";

export interface AnamnesisContent {
  chiefComplaint?: string;
  presentIllnessHistory?: string;
  pastHistory?: string;
  allergies?: string;
  currentMedications?: string;
  familyHistory?: string;
  lifestyle?: string;
  physicalExam?: string;
  [key: string]: unknown;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  observations: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  photoUrl: string | null;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  birthDate: Date | null;
  gender: string;
  status: string;
  totalVisits: number;
  lastVisit: Date | null;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  photoUrl: string | null;
  status: string;
}

export interface EvolutionWithProfessional extends Evolution {
  professional: Pick<Professional, "id" | "name">;
}

export interface PrescriptionWithProfessional extends Prescription {
  professional: Pick<Professional, "id" | "name">;
}

export interface ExamWithProfessional extends Exam {
  professional: Pick<Professional, "id" | "name"> | null;
}

export interface AttachmentWithUploader extends Attachment {
  uploadedBy: Pick<{ id: string; name: string | null }, "id" | "name"> | null;
}
