export const isDemo =
  !process.env.DATABASE_URL || process.env.DEMO_MODE === "true";

export const demoUser = {
  id: "demo-user-001",
  name: "Dra. Maria Silva",
  email: "maria@clinica.com.br",
  image: null,
  emailVerified: true,
};

export const demoOrganization = {
  id: "demo-org-001",
  name: "Clínica Saúde Integral",
  slug: "saude-integral",
  cnpj: "12.345.678/0001-90",
  logoUrl: null,
  primaryColor: "#7c3aed",
  plan: "professional",
  status: "active",
  settings: null,
};

export const demoMemberships = [
  {
    id: "demo-mem-001",
    organizationId: "demo-org-001",
    userId: "demo-user-001",
    role: "OWNER",
    status: "ACTIVE",
    organization: demoOrganization,
  },
];

export const demoSpecialties = [
  { id: "sp-1", name: "Clínica Geral", color: "#7c3aed", durationMinutes: 30 },
  { id: "sp-2", name: "Dermatologia", color: "#0ea5e9", durationMinutes: 45 },
  { id: "sp-3", name: "Psicologia", color: "#f59e0b", durationMinutes: 50 },
  { id: "sp-4", name: "Odontologia", color: "#10b981", durationMinutes: 40 },
];

export const demoRooms = [
  { id: "rm-1", name: "Sala 1", color: "#7c3aed" },
  { id: "rm-2", name: "Sala 2", color: "#0ea5e9" },
  { id: "rm-3", name: "Sala 3", color: "#10b981" },
];

export const demoProfessionals = [
  { id: "pr-1", name: "Dra. Maria Silva", color: "#7c3aed", specialtyId: "sp-1", specialty: { name: "Clínica Geral" } },
  { id: "pr-2", name: "Dr. João Santos", color: "#0ea5e9", specialtyId: "sp-2", specialty: { name: "Dermatologia" } },
  { id: "pr-3", name: "Dra. Ana Costa", color: "#f59e0b", specialtyId: "sp-3", specialty: { name: "Psicologia" } },
  { id: "pr-4", name: "Dr. Pedro Lima", color: "#10b981", specialtyId: "sp-4", specialty: { name: "Odontologia" } },
];

export const demoPatients = [
  { id: "pt-1", name: "Carlos Alberto de Souza", phone: "(11) 99876-5432", email: "carlos@email.com", cpf: "123.456.789-00", status: "active", birthDate: "1985-03-15" },
  { id: "pt-2", name: "Fernanda Oliveira", phone: "(11) 98765-4321", email: "fernanda@email.com", cpf: "987.654.321-00", status: "active", birthDate: "1992-07-22" },
  { id: "pt-3", name: "Roberto Nascimento", phone: "(11) 97654-3210", email: "roberto@email.com", cpf: "456.789.123-00", status: "active", birthDate: "1978-11-08" },
  { id: "pt-4", name: "Juliana Ferreira", phone: "(11) 96543-2109", email: "juliana@email.com", cpf: "321.654.987-00", status: "active", birthDate: "1995-01-30" },
  { id: "pt-5", name: "Marcos Pereira", phone: "(11) 95432-1098", email: "marcos@email.com", cpf: "654.321.098-00", status: "inactive", birthDate: "1980-06-12" },
  { id: "pt-6", name: "Ana Beatriz Lima", phone: "(11) 94321-0987", email: "ana.lima@email.com", cpf: "789.123.456-00", status: "active", birthDate: "1988-09-05" },
  { id: "pt-7", name: "Lucas Martins", phone: "(11) 93210-9876", email: "lucas@email.com", cpf: "098.765.432-00", status: "active", birthDate: "2000-04-18" },
  { id: "pt-8", name: "Mariana Almeida", phone: "(11) 92109-8765", email: "mariana@email.com", cpf: "234.567.890-00", status: "blocked", birthDate: "1975-12-03" },
];

function today() { return new Date(); }
function dateAt(d: Date, h: number, m: number) {
  const r = new Date(d);
  r.setHours(h, m, 0, 0);
  return r;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const todayDate = today();

export const demoAppointments = [
  { id: "ap-1", patientId: "pt-1", patientName: "Carlos Alberto de Souza", professionalId: "pr-1", professionalName: "Dra. Maria Silva", specialtyId: "sp-1", specialtyName: "Clínica Geral", roomId: "rm-1", roomName: "Sala 1", startAt: dateAt(todayDate, 9, 0), endAt: dateAt(todayDate, 9, 30), status: "CONFIRMED", type: "RETURN", price: 250, paymentStatus: "PAID" },
  { id: "ap-2", patientId: "pt-2", patientName: "Fernanda Oliveira", professionalId: "pr-2", professionalName: "Dr. João Santos", specialtyId: "sp-2", specialtyName: "Dermatologia", roomId: "rm-2", roomName: "Sala 2", startAt: dateAt(todayDate, 9, 0), endAt: dateAt(todayDate, 9, 45), status: "SCHEDULED", type: "FIRST_VISIT", price: 350, paymentStatus: "PENDING" },
  { id: "ap-3", patientId: "pt-3", patientName: "Roberto Nascimento", professionalId: "pr-1", professionalName: "Dra. Maria Silva", specialtyId: "sp-1", specialtyName: "Clínica Geral", roomId: "rm-1", roomName: "Sala 1", startAt: dateAt(todayDate, 10, 0), endAt: dateAt(todayDate, 10, 30), status: "COMPLETED", type: "RETURN", price: 250, paymentStatus: "PAID" },
  { id: "ap-4", patientId: "pt-4", patientName: "Juliana Ferreira", professionalId: "pr-3", professionalName: "Dra. Ana Costa", specialtyId: "sp-3", specialtyName: "Psicologia", roomId: "rm-3", roomName: "Sala 3", startAt: dateAt(todayDate, 10, 0), endAt: dateAt(todayDate, 10, 50), status: "CONFIRMED", type: "RETURN", price: 300, paymentStatus: "PAID" },
  { id: "ap-5", patientId: "pt-6", patientName: "Ana Beatriz Lima", professionalId: "pr-4", professionalName: "Dr. Pedro Lima", specialtyId: "sp-4", specialtyName: "Odontologia", roomId: "rm-2", roomName: "Sala 2", startAt: dateAt(todayDate, 11, 0), endAt: dateAt(todayDate, 11, 40), status: "SCHEDULED", type: "FIRST_VISIT", price: 200, paymentStatus: "PENDING" },
  { id: "ap-6", patientId: "pt-7", patientName: "Lucas Martins", professionalId: "pr-1", professionalName: "Dra. Maria Silva", specialtyId: "sp-1", specialtyName: "Clínica Geral", roomId: "rm-1", roomName: "Sala 1", startAt: dateAt(todayDate, 14, 0), endAt: dateAt(todayDate, 14, 30), status: "SCHEDULED", type: "RETURN", price: 250, paymentStatus: "PENDING" },
  { id: "ap-7", patientId: "pt-1", patientName: "Carlos Alberto de Souza", professionalId: "pr-2", professionalName: "Dr. João Santos", specialtyId: "sp-2", specialtyName: "Dermatologia", roomId: "rm-2", roomName: "Sala 2", startAt: dateAt(todayDate, 14, 0), endAt: dateAt(todayDate, 14, 45), status: "SCHEDULED", type: "RETURN", price: 350, paymentStatus: "PAID" },
  { id: "ap-8", patientId: "pt-4", patientName: "Juliana Ferreira", professionalId: "pr-3", professionalName: "Dra. Ana Costa", specialtyId: "sp-3", specialtyName: "Psicologia", roomId: "rm-3", roomName: "Sala 3", startAt: dateAt(todayDate, 15, 0), endAt: dateAt(todayDate, 15, 50), status: "CANCELLED", type: "RETURN", price: 300, paymentStatus: "CANCELLED" },
  { id: "ap-9", patientId: "pt-2", patientName: "Fernanda Oliveira", professionalId: "pr-1", professionalName: "Dra. Maria Silva", specialtyId: "sp-1", specialtyName: "Clínica Geral", roomId: "rm-1", roomName: "Sala 1", startAt: dateAt(addDays(todayDate, 1), 9, 0), endAt: dateAt(addDays(todayDate, 1), 9, 30), status: "SCHEDULED", type: "RETURN", price: 250, paymentStatus: "PENDING" },
  { id: "ap-10", patientId: "pt-6", patientName: "Ana Beatriz Lima", professionalId: "pr-4", professionalName: "Dr. Pedro Lima", specialtyId: "sp-4", specialtyName: "Odontologia", roomId: "rm-2", roomName: "Sala 2", startAt: dateAt(addDays(todayDate, 1), 10, 0), endAt: dateAt(addDays(todayDate, 1), 10, 40), status: "CONFIRMED", type: "RETURN", price: 200, paymentStatus: "PAID" },
];

export const demoTransactions = [
  { id: "tr-1", type: "REVENUE", description: "Consulta - Carlos Alberto", amount: 250, status: "PAID", date: todayDate, paymentMethod: "PIX", patientName: "Carlos Alberto de Souza" },
  { id: "tr-2", type: "REVENUE", description: "Consulta - Roberto Nascimento", amount: 250, status: "PAID", date: todayDate, paymentMethod: "CARD", patientName: "Roberto Nascimento" },
  { id: "tr-3", type: "REVENUE", description: "Anamnese - Juliana Ferreira", amount: 300, status: "PAID", date: todayDate, paymentMethod: "CASH", patientName: "Juliana Ferreira" },
  { id: "tr-4", type: "REVENUE", description: "Retorno - Fernanda Oliveira", amount: 250, status: "PENDING", date: addDays(todayDate, 1), paymentMethod: "PIX", patientName: "Fernanda Oliveira" },
  { id: "tr-5", type: "REVENUE", description: "Primeira consulta - Ana Beatriz", amount: 200, status: "PENDING", date: addDays(todayDate, 1), paymentMethod: "TRANSFER", patientName: "Ana Beatriz Lima" },
  { id: "tr-6", type: "EXPENSE", description: "Aluguel da sala", amount: 4500, status: "PAID", date: todayDate, paymentMethod: "TRANSFER", patientName: null },
  { id: "tr-7", type: "EXPENSE", description: "Material de escritório", amount: 350, status: "PAID", date: addDays(todayDate, -2), paymentMethod: "CARD", patientName: null },
  { id: "tr-8", type: "EXPENSE", description: "Software de gestão", amount: 199, status: "PAID", date: addDays(todayDate, -5), paymentMethod: "CARD", patientName: null },
  { id: "tr-9", type: "EXPENSE", description: "Manutenção equipamentos", amount: 800, status: "OVERDUE", date: addDays(todayDate, -10), paymentMethod: "TRANSFER", patientName: null },
  { id: "tr-10", type: "REVENUE", description: "Consulta - Lucas Martins", amount: 250, status: "PAID", date: addDays(todayDate, -1), paymentMethod: "PIX", patientName: "Lucas Martins" },
  { id: "tr-11", type: "REVENUE", description: "Retorno - Carlos Alberto", amount: 250, status: "PAID", date: addDays(todayDate, -3), paymentMethod: "PIX", patientName: "Carlos Alberto de Souza" },
  { id: "tr-12", type: "REVENUE", description: "Dermatologia - Fernanda", amount: 350, status: "PAID", date: addDays(todayDate, -4), paymentMethod: "CARD", patientName: "Fernanda Oliveira" },
  { id: "tr-13", type: "REVENUE", description: "Odontologia - Ana Beatriz", amount: 200, status: "PAID", date: addDays(todayDate, -6), paymentMethod: "PIX", patientName: "Ana Beatriz Lima" },
  { id: "tr-14", type: "EXPENSE", description: "Conta de luz", amount: 450, status: "PAID", date: addDays(todayDate, -7), paymentMethod: "TRANSFER", patientName: null },
  { id: "tr-15", type: "EXPENSE", description: "Internet", amount: 120, status: "PAID", date: addDays(todayDate, -7), paymentMethod: "TRANSFER", patientName: null },
  { id: "tr-16", type: "REVENUE", description: "Consulta - Mariana Almeida", amount: 300, status: "PAID", date: addDays(todayDate, -8), paymentMethod: "CASH", patientName: "Mariana Almeida" },
  { id: "tr-17", type: "REVENUE", description: "Psicologia - Juliana", amount: 300, status: "PAID", date: addDays(todayDate, -10), paymentMethod: "PIX", patientName: "Juliana Ferreira" },
  { id: "tr-18", type: "REVENUE", description: "Retorno - Roberto", amount: 250, status: "PAID", date: addDays(todayDate, -12), paymentMethod: "CARD", patientName: "Roberto Nascimento" },
];

export const demoDashboardData = {
  kpis: {
    totalPatients: 156,
    appointmentsToday: 6,
    monthRevenue: 18500,
    monthExpenses: 6419,
  },
  revenueChart: [
    { month: "Fev", revenue: 14200, expenses: 5800 },
    { month: "Mar", revenue: 16800, expenses: 6100 },
    { month: "Abr", revenue: 15400, expenses: 5900 },
    { month: "Mai", revenue: 17200, expenses: 6200 },
    { month: "Jun", revenue: 19100, expenses: 6500 },
    { month: "Jul", revenue: 18500, expenses: 6419 },
  ],
  recentActivity: [
    { action: "Consulta agendada", detail: "Carlos Alberto → Dra. Maria Silva", time: "09:00" },
    { action: "Pagamento recebido", detail: "PIX R$ 250,00 — Roberto Nascimento", time: "10:15" },
    { action: "Consulta concluída", detail: "Roberto Nascimento → Dra. Maria Silva", time: "10:30" },
    { action: "Consulta cancelada", detail: "Juliana Ferreira → Dra. Ana Costa", time: "13:20" },
    { action: "Novo paciente", detail: "Mariana Almeida cadastrada", time: "14:00" },
  ],
  todayAppointments: demoAppointments.filter(
    (a) => a.startAt.toDateString() === todayDate.toDateString()
  ),
};
