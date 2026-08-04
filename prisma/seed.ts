import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  const passwordHash = await bcrypt.hash("senha-demo-123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@clinica.com.br" },
    update: {},
    create: {
      name: "Dr. Ana Demo",
      email: "demo@clinica.com.br",
      emailVerified: true,
      passwordHash,
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "clinica-demo" },
    update: {},
    create: {
      name: "Clínica Demo",
      slug: "clinica-demo",
      cnpj: "12.345.678/0001-90",
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

  const membership = await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  void membership;

  const specialty = await prisma.specialty.create({
    data: {
      organizationId: org.id,
      name: "Clínica Médica",
      durationMinutes: 30,
      color: "#7c3aed",
    },
  });

  const professional = await prisma.professional.create({
    data: {
      organizationId: org.id,
      name: "Dra. Ana Demo",
      email: "ana@clinica.com.br",
      documentNumber: "CRM 123456",
      specialtyId: specialty.id,
      color: "#7c3aed",
      commissionRate: 0.4,
    },
  });

  const room = await prisma.room.create({
    data: { organizationId: org.id, name: "Sala 01" },
  });

  const patients = await prisma.patient.createMany({
    data: [
      {
        organizationId: org.id,
        name: "Carlos Pereira",
        phone: "(11) 98888-1234",
        email: "carlos@email.com",
        cpf: "123.456.789-00",
        gender: "MALE",
        birthDate: new Date("1985-04-12"),
        insuranceProvider: "Amil",
      },
      {
        organizationId: org.id,
        name: "Mariana Souza",
        phone: "(11) 97777-5678",
        email: "mariana@email.com",
        cpf: "987.654.321-00",
        gender: "FEMALE",
        birthDate: new Date("1992-11-03"),
      },
      {
        organizationId: org.id,
        name: "João Almeida",
        phone: "(21) 96666-9012",
        gender: "MALE",
        birthDate: new Date("1978-07-21"),
        notes: "Paciente com histórico de hipertensão.",
      },
    ],
  });

  const allPatients = await prisma.patient.findMany({
    where: { organizationId: org.id },
  });

  const now = new Date();
  const todayStart = new Date(now.setHours(8, 0, 0, 0));

  for (let i = 0; i < allPatients.length; i++) {
    const start = new Date(todayStart.getTime() + i * 2 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    await prisma.appointment.create({
      data: {
        organizationId: org.id,
        patientId: allPatients[i].id,
        professionalId: professional.id,
        roomId: room.id,
        specialtyId: specialty.id,
        startAt: start,
        endAt: end,
        status: i === 2 ? "CONFIRMED" : "SCHEDULED",
        price: 250,
        paymentStatus: "PENDING",
      },
    });
  }

  const transactions = await prisma.transaction.createMany({
    data: [
      {
        organizationId: org.id,
        type: "REVENUE",
        description: "Consulta — Carlos Pereira",
        amount: 250,
        paymentMethod: "PIX",
        status: "PAID",
        date: new Date(),
        patientId: allPatients[0]?.id,
        professionalId: professional.id,
        commissionRate: 0.4,
        commissionAmount: 100,
      },
      {
        organizationId: org.id,
        type: "REVENUE",
        description: "Consulta — Mariana Souza",
        amount: 250,
        paymentMethod: "CARD",
        status: "PENDING",
        date: new Date(),
        patientId: allPatients[1]?.id,
      },
      {
        organizationId: org.id,
        type: "EXPENSE",
        description: "Material de escritório",
        amount: 150,
        paymentMethod: "TRANSFER",
        status: "PAID",
        date: new Date(),
      },
    ],
  });

  void transactions;

  const categories = await prisma.financeCategory.findMany({
    where: { organizationId: org.id },
  });

  console.log("✅ Seed concluído");
  console.log(`👤 Usuário: demo@clinica.com.br / senha-demo-123`);
  console.log(`🏥 Organização: clinica-demo`);
  console.log(`📊 ${allPatients.length} pacientes, ${categories.length} categorias financeiras`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());