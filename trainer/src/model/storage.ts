import type { Answer, AttemptStatus } from "./domain";

const STORAGE_PREFIX = "trainer-draft-";

export interface Draft {
  version: 1;
  setId: string;
  attemptId?: string;
  currentIndex: number;
  answers: readonly Answer[];
  status: AttemptStatus;
  score?: number | null;
}

export function getStorageKey(setId: string): string {
  return `${STORAGE_PREFIX}${setId}`;
}

export function readDraft(raw: string | null): Draft | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (obj.version !== 1) return null;
    if (typeof obj.setId !== "string") return null;
    if (typeof obj.currentIndex !== "number") return null;
    if (typeof obj.status !== "string") return null;
    if (!Array.isArray(obj.answers)) return null;

    const validStatuses: AttemptStatus[] = [
      "in-progress",
      "submitted",
      "pending-review",
    ];
    if (!validStatuses.includes(obj.status as AttemptStatus)) return null;

    const answers = obj.answers.map((a: unknown) => {
      if (typeof a !== "object" || a === null) return null;
      const ans = a as Record<string, unknown>;
      if (typeof ans.taskId !== "string") return null;
      if (typeof ans.kind !== "string") return null;
      if (ans.kind === "single-choice") {
        if (typeof ans.optionId !== "string") return null;
        return {
          kind: "single-choice",
          taskId: ans.taskId,
          optionId: ans.optionId,
        };
      } else if (ans.kind === "short-text") {
        if (typeof ans.text !== "string") return null;
        return { kind: "short-text", taskId: ans.taskId, text: ans.text };
      }
      return null;
    });

    if (answers.some((a) => a === null)) return null;

    return {
      version: 1,
      setId: obj.setId,
      attemptId: typeof obj.attemptId === "string" ? obj.attemptId : undefined,
      currentIndex: obj.currentIndex,
      answers: answers as Answer[],
      status: obj.status as AttemptStatus,
      score:
        obj.score === null
          ? null
          : typeof obj.score === "number"
            ? obj.score
            : undefined,
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft): { success: boolean; error?: string } {
  try {
    localStorage.setItem(getStorageKey(draft.setId), JSON.stringify(draft));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
}

export function clearDraft(setId: string): void {
  try {
    localStorage.removeItem(getStorageKey(setId));
  } catch {
    // ignore
  }
}
