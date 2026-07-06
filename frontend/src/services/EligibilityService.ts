import { BaseService } from "./BaseService";

class EligibilityService extends BaseService {
  getEligibilitySummary() {
    return this.client.get<{ success: boolean; qualified: number; total: number }>(
      "/api/eligibility/org-summary"
    );
  }

  checkMyEligibility() {
    return this.client.get<{ success: boolean }>("/api/eligibility/check");
  }
}

export const eligibilityService = new EligibilityService();
