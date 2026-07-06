import { BaseService } from "./BaseService";

export type FeedbackContextType = "PAYROLL_RUN" | "PAYMENT";

export interface FeedbackPayload {
  contextType: FeedbackContextType;
  contextId: string;
  rating: number;
  message?: string;
}

class FeedbackService extends BaseService {
  submitFeedback(payload: FeedbackPayload) {
    return this.client.post<{ success: boolean; feedback: Record<string, unknown> }>(
      "/api/feedback",
      payload
    );
  }
}

export const feedbackService = new FeedbackService();
