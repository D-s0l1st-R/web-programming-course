export type TaskKind = "single-choice" | "short-text";

export interface Option {
  id: string;
  label: string;
}

interface BaseTask {
  id: string;
  topic: string;
  prompt: string;
  code?: string;
}

export interface SingleChoiceTask extends BaseTask {
  kind: "single-choice";
  options: readonly Option[];
}

export interface ShortTextTask extends BaseTask {
  kind: "short-text";
}

export type Task = SingleChoiceTask | ShortTextTask;

export interface TrainingSet {
  id: string;
  title: string;
  tasks: readonly Task[];
}

// ↓ Добавлен kind — требуется контрактом API
export interface SingleChoiceAnswer {
  kind: "single-choice";
  taskId: string;
  optionId: string;
}

export interface ShortTextAnswer {
  kind: "short-text";
  taskId: string;
  text: string;
}

export type Answer = SingleChoiceAnswer | ShortTextAnswer;

export type AttemptStatus = "in-progress" | "submitted" | "pending-review";

export interface Attempt {
  id: string;
  setId: string;
  status: AttemptStatus;
  answers: readonly Answer[];
  score?: number | null;
}

// ↓ Исправлено: статус результата сервера — "graded" | "pending-review",
// а не AttemptStatus. См. course/CONTRACT.md раздел "Result".
export type ResultStatus = "graded" | "pending-review";

export type ResultItemStatus =
  | "correct"
  | "incorrect"
  | "unanswered"
  | "pending-review";

export interface ResultItem {
  taskId: string;
  status: ResultItemStatus;
  score: number | null;
  maxScore: number;
  feedback: string;
}

export interface AttemptResult {
  attemptId: string;
  status: ResultStatus;
  score: number | null;
  maxScore: number;
  items: readonly ResultItem[];
}

export type RequestStatus = "idle" | "loading" | "success" | "error";

export interface RequestState {
  status: RequestStatus;
  message?: string;
}
