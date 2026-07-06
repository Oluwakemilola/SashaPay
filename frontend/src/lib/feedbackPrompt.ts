import { readLocalJSON, getStoredUser } from "./api";

const KEY = "feedback_prompted";

function currentUserId(): string {
  const user = getStoredUser();
  return user?._id || user?.id || "anonymous";
}

function readPrompted(): string[] {
  return readLocalJSON<string[]>(KEY, []);
}

export function hasBeenPrompted(contextType: string, contextId: string): boolean {
  return readPrompted().includes(`${currentUserId()}:${contextType}:${contextId}`);
}

export function markPrompted(contextType: string, contextId: string) {
  if (typeof window === "undefined") return;
  const key = `${currentUserId()}:${contextType}:${contextId}`;
  const existing = readPrompted();
  if (!existing.includes(key)) {
    localStorage.setItem(KEY, JSON.stringify([...existing, key]));
  }
}
