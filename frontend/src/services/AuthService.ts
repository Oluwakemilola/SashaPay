import { BaseService } from "./BaseService";

export interface AuthResponse {
  success?: boolean;
  token: string;
  user: Record<string, unknown>;
  organization?: Record<string, unknown> & { inviteCode?: string };
}

class AuthService extends BaseService {
  login(email: string, password: string) {
    return this.client.post<AuthResponse>("/api/auth/login", { email, password });
  }

  registerOrg(payload: Record<string, unknown>) {
    return this.client.post<AuthResponse>("/api/auth/register-org", payload);
  }

  registerWorker(payload: Record<string, unknown>) {
    return this.client.post<AuthResponse>("/api/auth/register", payload);
  }

  getMe() {
    return this.client.get<{ success: boolean; user: Record<string, unknown> }>("/api/auth/me");
  }

  refreshInvite() {
    return this.client.post<{ success: boolean; inviteCode: string; expiresAt: string }>(
      "/api/auth/refresh-invite"
    );
  }
}

export const authService = new AuthService();
