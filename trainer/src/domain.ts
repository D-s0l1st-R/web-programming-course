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

export type DraftStatus = "in-progress" | "submitted";

export interface Draft {
  version: 1;
  setId: string;
  currentIndex: number;
  answers: readonly Answer[];
  status: DraftStatus;
}

export interface AttemptState {
  currentIndex: number;
  answers: readonly Answer[];
  status: DraftStatus;
}