import { BaseService } from "./BaseService";

class PayrollService extends BaseService {
  getPayrollHistory() {
    return this.client.get<{ success: boolean; payrollRuns: Record<string, unknown>[] }>(
      "/api/payroll/history"
    );
  }

  getPayrollRun(id: string) {
    return this.client.get<{
      success: boolean;
      payrollRun: Record<string, unknown>;
      transfers: Record<string, unknown>[];
    }>(`/api/payroll/${id}`);
  }

  createPayrollRun(month: string) {
    return this.client.post<{ success: boolean; payrollRun: Record<string, unknown> }>(
      "/api/payroll/run",
      { month }
    );
  }

  approvePayrollRun(id: string) {
    return this.client.patch<{ success: boolean; payrollRun: Record<string, unknown> }>(
      `/api/payroll/${id}/approve`
    );
  }

  disbursePayroll(id: string) {
    return this.client.post<{ success: boolean; payrollRun: Record<string, unknown> }>(
      `/api/payroll/${id}/disburse`
    );
  }
}

export const payrollService = new PayrollService();
