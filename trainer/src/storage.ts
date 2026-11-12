import type { Answer, Draft, DraftStatus } from "./domain";

const STORAGE_PREFIX = "trainer-draft-";

export function getStorageKey(setId: string): string {
  return `${STORAGE_PREFIX}${setId}`;
}

export function readDraft(raw: string | null): Draft | null {
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    // Проверяем структуру
    if (typeof parsed !== "object" || parsed === null) return null;

    const obj = parsed as Record<string, unknown>;

    // Проверяем обязательные поля
    if (obj.version !== 1) return null;
    if (typeof obj.setId !== "string") return null;
    if (typeof obj.currentIndex !== "number") return null;
    if (typeof obj.status !== "string") return null;
    if (!Array.isArray(obj.answers)) return null;

    // Проверяем status
    if (obj.status !== "in-progress" && obj.status !== "submitted") return null;

    // Проверяем answers
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
        return {
          kind: "short-text",
          taskId: ans.taskId,
          text: ans.text,
        };
      }

      return null;
    });

    // Если хотя бы один ответ невалиден — весь черновик невалиден
    if (answers.some((a) => a === null)) return null;

    return {
      version: 1,
      setId: obj.setId,
      currentIndex: obj.currentIndex,
      answers: answers as Answer[],
      status: obj.status as DraftStatus,
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft): { success: boolean; error?: string } {
  try {
    const key = getStorageKey(draft.setId);
    localStorage.setItem(key, JSON.stringify(draft));
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
    const key = getStorageKey(setId);
    localStorage.removeItem(key);
  } catch {
    // Игнорируем ошибки при очистке
  }
}