import { BaseService } from "./BaseService";

class AnalyticsService extends BaseService {
  getDashboard() {
    return this.client.get<{
      success: boolean;
      dashboard: {
        totalWorkers: number; activeWorkers: number;
        todayAttendance: number; attendanceRate: number;
        currentMonth: string; currentPayroll: Record<string, unknown> | null;
        totalDisbursedNGN: number; completedPayrolls: number;
      };
    }>("/api/analytics/dashboard");
  }

  getWorkforceHealth(month?: string) {
    return this.client.get<{
      success: boolean;
      workforceHealth: {
        totalWorkers: number; eligibleWorkers: number;
        ineligibleWorkers: number; eligibilityRate: number;
        avgAttendancePercent: number;
        departments: { name: string; count: number }[];
      };
    }>("/api/analytics/workforce-health", month ? { month } : undefined);
  }
}

export const analyticsService = new AnalyticsService();
