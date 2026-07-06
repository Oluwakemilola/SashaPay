import { BaseService } from "./BaseService";

class StaffService extends BaseService {
  getStaff() {
    return this.client.get<{ success: boolean; staff: Record<string, unknown>[] }>("/api/staff");
  }

  updateStaff(id: string, data: { salary?: number; department?: string }) {
    return this.client.patch<{ success: boolean; worker: Record<string, unknown> }>(
      `/api/staff/${id}`,
      data
    );
  }
}

export const staffService = new StaffService();
