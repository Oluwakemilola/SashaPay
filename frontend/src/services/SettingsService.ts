import { BaseService } from "./BaseService";

class SettingsService extends BaseService {
  getSettings() {
    return this.client.get<{ success: boolean; settings: Record<string, unknown> }>(
      "/api/settings"
    );
  }

  connectPayment(paystackSecretKey: string) {
    return this.client.post<{ success: boolean }>("/api/settings/payment", { paystackSecretKey });
  }

  fundWallet(amount: number) {
    return this.client.post<{ success: boolean; walletBalance: number }>(
      "/api/settings/fund-wallet",
      { amount }
    );
  }

  updatePayrollPolicy(payrollPolicy: string, thresholdPercent: number) {
    return this.client.patch<{ success: boolean }>("/api/settings/payroll-policy", {
      payrollPolicy,
      thresholdPercent,
    });
  }
}

export const settingsService = new SettingsService();
