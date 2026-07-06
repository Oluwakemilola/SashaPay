import { BaseService } from "./BaseService";

class PassportService extends BaseService {
  getMyPassport() {
    return this.client.get<{ success: boolean; passport: Record<string, unknown> }>(
      "/api/passport/me"
    );
  }

  getWorkerPassport(workerId: string) {
    return this.client.get<{ success: boolean; passport: Record<string, unknown> }>(
      `/api/passport/${workerId}`
    );
  }
}

export const passportService = new PassportService();
