export type DateRangePreset = "today" | "7days" | "30days" | "thisMonth" | "lastMonth" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface PatientReportData {
  totalPatients: number;
  totalPatientsTrend: number;
  newPatientsMonthly: { month: string; count: number }[];
  genderDistribution: { name: string; value: number }[];
  topSources: { name: string; count: number }[];
  insuranceDistribution: { name: string; count: number }[];
  statusBreakdown: { name: string; value: number }[];
}

export interface AppointmentReportData {
  totalAppointments: number;
  totalAppointmentsTrend: number;
  averageDaily: number;
  byStatus: { name: string; count: number }[];
  byProfessional: { name: string; count: number }[];
  byDayOfWeek: { name: string; count: number }[];
  byHour: { hour: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface FinanceReportData {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  averageTicket: number;
  balanceTrend: number;
  monthlyData: { month: string; receita: number; despesa: number }[];
  byPaymentMethod: { name: string; value: number }[];
  byCategory: { name: string; value: number }[];
  topProfessional: { name: string; revenue: number } | null;
}

export interface CancellationReportData {
  totalCancellations: number;
  totalNoShows: number;
  cancelRate: number;
  noShowRate: number;
  cancelRateTrend: number;
  byReason: { name: string; count: number }[];
  byProfessional: { name: string; cancelled: number; noShow: number }[];
  monthlyTrend: { month: string; cancelled: number; noShow: number }[];
}
