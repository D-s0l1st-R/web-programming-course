import type { Answer, Task, TrainingSet } from "./domain";

export type AttemptStatus = "in-progress" | "submitted";

export interface AttemptState {
  currentIndex: number;
  answers: readonly Answer[];
  status: AttemptStatus;
}

export function createInitialState(): AttemptState {
  return {
    currentIndex: 0,
    answers: [],
    status: "in-progress",
  };
}

export function isAnswered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  if (answer.kind === "single-choice") return answer.optionId.length > 0;
  return answer.text.trim().length > 0;
}

export function getAnswer(
  answers: readonly Answer[],
  taskId: string,
): Answer | undefined {
  return answers.find((a) => a.taskId === taskId);
}

export function replaceAnswer(
  answers: readonly Answer[],
  next: Answer,
): readonly Answer[] {
  return [
    ...answers.filter((a) => a.taskId !== next.taskId),
    next,
  ];
}

export function removeAnswer(
  answers: readonly Answer[],
  taskId: string,
): readonly Answer[] {
  return answers.filter((a) => a.taskId !== taskId);
}

export function answeredCount(
  tasks: readonly Task[],
  answers: readonly Answer[],
): number {
  return tasks.reduce(
    (count, task) => count + (isAnswered(getAnswer(answers, task.id)) ? 1 : 0),
    0,
  );
}

export function getMissingTasks(
  tasks: readonly Task[],
  answers: readonly Answer[],
): readonly Task[] {
  return tasks.filter((task) => !isAnswered(getAnswer(answers, task.id)));
}

export function canFinish(
  tasks: readonly Task[],
  answers: readonly Answer[],
): boolean {
  return getMissingTasks(tasks, answers).length === 0;
}

export function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}