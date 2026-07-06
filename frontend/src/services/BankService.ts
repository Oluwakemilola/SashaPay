import { BaseService } from "./BaseService";

export interface BankAccountPayload {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

class BankService extends BaseService {
  getMyBankAccounts() {
    return this.client.get<{
      success: boolean;
      accounts?: Record<string, unknown>[];
      bankAccounts?: Record<string, unknown>[];
    }>("/api/bank");
  }

  addBankAccount(data: BankAccountPayload) {
    return this.client.post<{ success: boolean }>("/api/bank", data);
  }

  setPrimaryBankAccount(id: string) {
    return this.client.patch<{ success: boolean }>(`/api/bank/${id}/set-primary`);
  }

  deleteBankAccount(id: string) {
    return this.client.delete<{ success: boolean }>(`/api/bank/${id}`);
  }
}

export const bankService = new BankService();
