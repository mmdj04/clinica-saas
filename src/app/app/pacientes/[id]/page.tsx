import { redirect, notFound } from "next/navigation";
import { getCurrentOrganization } from "@/lib/multi-tenancy";
import { getPatientById } from "@/features/pacientes/services/paciente-service";
import { PacienteDetailServer } from "./paciente-detail-server";
import { isDemo, demoPatients } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await getCurrentOrganization();
  if (!current) redirect("/onboard");

  const { id } = await params;

  let patient;
  if (isDemo) {
    const p = demoPatients.find((dp) => dp.id === id);
    if (!p) notFound();
    patient = {
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      cpf: p.cpf,
      rg: null,
      birthDate: p.birthDate ? new Date(p.birthDate) : null,
      gender: "NOT_INFORMED",
      photoUrl: null,
      cep: null,
      address: null,
      city: null,
      state: null,
      insuranceProvider: null,
      insuranceNumber: null,
      emergencyContact: null,
      emergencyPhone: null,
      responsibleName: null,
      responsiblePhone: null,
      notes: null,
      source: null,
      status: "active",
      createdAt: new Date(),
      tags: [],
      _count: { appointments: 3, anamnesis: 1, evolutions: 2, prescriptions: 1, exams: 0, attachments: 0 },
      recentAppointments: [],
    };
  } else {
    patient = await getPatientById(current.organization.id, id);
  }

  if (!patient) notFound();

  return <PacienteDetailServer patient={patient} />;
}
