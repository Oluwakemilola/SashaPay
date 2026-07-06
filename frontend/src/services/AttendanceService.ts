import { BaseService } from "./BaseService";

class AttendanceService extends BaseService {
  getMyAttendance() {
    return this.client.get<{ success: boolean; attendance: Record<string, unknown>[] }>(
      "/api/attendance/my-records"
    );
  }

  clockIn() {
    return this.client.post<{ success: boolean; message: string }>("/api/attendance/clock-in");
  }

  clockOut() {
    return this.client.post<{ success: boolean; message: string }>("/api/attendance/clock-out");
  }

  getOrgAttendanceSummary(month?: string) {
    return this.client.get<{ success: boolean; summary: Record<string, unknown> }>(
      "/api/attendance/org-summary",
      month ? { month } : undefined
    );
  }
}

export const attendanceService = new AttendanceService();
