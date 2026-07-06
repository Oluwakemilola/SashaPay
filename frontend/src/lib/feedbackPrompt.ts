const KEY = "feedback_prompted";

function readPrompted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function hasBeenPrompted(contextType: string, contextId: string): boolean {
  return readPrompted().includes(`${contextType}:${contextId}`);
}

export function markPrompted(contextType: string, contextId: string) {
  if (typeof window === "undefined") return;
  const key = `${contextType}:${contextId}`;
  const existing = readPrompted();
  if (!existing.includes(key)) {
    localStorage.setItem(KEY, JSON.stringify([...existing, key]));
  }
}
