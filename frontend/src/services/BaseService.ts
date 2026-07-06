import { apiClient } from "./ApiClient";

export abstract class BaseService {
  protected client = apiClient;
}
