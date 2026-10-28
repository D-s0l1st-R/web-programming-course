import type { Answer } from "./domain";

export type AnswerChecker = (answer: Answer) => boolean;

export const checkAnswer: Record<string, AnswerChecker> = {
  "ts-1": (a) => a.kind === "single-choice" && a.optionId === "b",

  "ts-2": (a) => a.kind === "single-choice" && a.optionId === "a",

  "react-1": (a) => {
    if (a.kind !== "short-text") return false;
    const t = a.text.toLowerCase();
    return t.includes("props") && (t.includes("state") || t.includes("состоян"));
  },

  "http-1": (a) => {
    if (a.kind !== "short-text") return false;
    const t = a.text.toLowerCase();
    return (
      t.includes("ok") ||
      t.includes("status") ||
      t.includes("200") ||
      t.includes("response")
    );
  },
};

export function isCorrect(taskId: string, answer: Answer | undefined): boolean {
  if (!answer) return false;
  const checker = checkAnswer[taskId];
  if (!checker) return false;
  return checker(answer);
}

export const correctOptionIdFor: Record<string, string> = {
  "ts-1": "b",
  "ts-2": "a",
};