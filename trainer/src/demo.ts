import { TrainingSet, Task, Answer, ShortTextAnswer } from "./domain";

interface RawOption {
  "id ": string;
  "label ": string;
}

interface RawBaseTask {
  "id ": string;
  "topic ": string;
  "prompt ": string;
  "code "?: string;
}

interface RawSingleChoiceTask extends RawBaseTask {
  "kind ": "single-choice ";
  "options ": RawOption[];
}

interface RawShortTextTask extends RawBaseTask {
  "kind ": "short-text ";
}

type RawTask = RawSingleChoiceTask | RawShortTextTask;

interface RawTrainingSet {
  "id ": string;
  "title ": string;
  "tasks ": RawTask[];
}

import rawData from "../../course/data/training-set.json" with { type: "json" };

// console.log("Структура rawData:", JSON.stringify(rawData, null, 2));
// console.log("Ключи rawData:", Object.keys(rawData));

const rawTrainingSet = rawData as any;

function normalizeTask(rawTask: any): Task {
  const idKey = "id " in rawTask ? "id " : "id";
  const kindKey = "kind " in rawTask ? "kind " : "kind";
  const topicKey = "topic " in rawTask ? "topic " : "topic";
  const promptKey = "prompt " in rawTask ? "prompt " : "prompt";
  const codeKey = "code " in rawTask ? "code " : "code";
  const optionsKey = "options " in rawTask ? "options " : "options";

  const base: any = {
    id: rawTask[idKey]?.trim(),
    topic: rawTask[topicKey]?.trim(),
    prompt: rawTask[promptKey]?.trim(),
    code: rawTask[codeKey]?.trim(),
  };

  if (rawTask[kindKey]?.trim() === "single-choice") {
    return {
      ...base,
      kind: "single-choice",
      options: rawTask[optionsKey].map((opt: any) => {
        const optIdKey = "id " in opt ? "id " : "id";
        const optLabelKey = "label " in opt ? "label " : "label";
        return {
          id: opt[optIdKey].trim(),
          label: opt[optLabelKey].trim(),
        };
      }),
    };
  } else {
    return {
      ...base,
      kind: "short-text",
    };
  }
}

function normalizeTrainingSet(raw: any): TrainingSet {
  const idKey = "id " in raw ? "id " : "id";
  const titleKey = "title " in raw ? "title " : "title";
  const tasksKey = "tasks " in raw ? "tasks " : "tasks";

  return {
    id: raw[idKey]?.trim(),
    title: raw[titleKey]?.trim(),
    tasks: raw[tasksKey].map(normalizeTask),
  };
}

export const normalizedSet = normalizeTrainingSet(rawTrainingSet);

export const fullSet: TrainingSet = {
  id: normalizedSet.id,
  title: normalizedSet.title,
  tasks: normalizedSet.tasks,
};

const answers1: readonly Answer[] = [
  { kind: "single-choice", taskId: "ts-1", optionId: "b" },
  {
    kind: "short-text",
    taskId: "react-1",
    text: "Props передаются извне, state — внутреннее.",
  },
  { kind: "single-choice", taskId: "unknown-task", optionId: "x" },
] as const;

const answers2: readonly Answer[] = [
  { kind: "single-choice", taskId: "ts-2", optionId: "a" },
  { kind: "short-text", taskId: "http-1", text: "   " },
  { kind: "single-choice", taskId: "ts-1", optionId: "a" },
] as const;

export function findTask(set: TrainingSet, id: string): Task | undefined {
  return set.tasks.find((task) => task.id === id);
}

export function filterByTopic(
  set: TrainingSet,
  topic: string,
): readonly Task[] {
  return set.tasks.filter((task) => task.topic === topic);
}

export function calculateProgress(
  set: TrainingSet,
  answers: readonly Answer[],
): { filled: number; total: number } {
  let filled = 0;
  const total = set.tasks.length;

  for (const answer of answers) {
    const task = findTask(set, answer.taskId);

    if (!task) continue;

    if (task.kind === "single-choice") {
      filled++;
    } else {
      const textAnswer = answer as ShortTextAnswer;
      if (textAnswer.text.trim() !== "") {
        filled++;
      }
    }
  }

  return { filled, total };
}

console.log("--- Демонстрация работы с данными из JSON ---");
console.log("Загруженный JSON (id):", rawTrainingSet["id "]);
console.log("Нормализованный набор (id):", normalizedSet.id);
