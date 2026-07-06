import { BaseService } from "./BaseService";

class AgentService extends BaseService {
  sendChat(message: string) {
    return this.client.post<{ success: boolean; reply: string }>("/api/agent/chat", { message });
  }
}

export const agentService = new AgentService();
