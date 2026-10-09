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

const normalizedSet = normalizeTrainingSet(rawTrainingSet);

const set1 = {
  id: normalizedSet.id,
  title: normalizedSet.title,
  tasks: [
    normalizedSet.tasks.find((t) => t.id === "ts-1")!,
    normalizedSet.tasks.find((t) => t.id === "react-1")!,
  ],
} satisfies TrainingSet;

const set2 = {
  id: "advanced-topics",
  title: "Продвинутые темы",
  tasks: [
    normalizedSet.tasks.find((t) => t.id === "ts-2")!,
    normalizedSet.tasks.find((t) => t.id === "http-1")!,
  ],
} satisfies TrainingSet;

const set3 = {
  id: "empty-set",
  title: "Пустой набор",
  tasks: [],
} satisfies TrainingSet;

const answers1: readonly Answer[] = [
  { taskId: "ts-1", optionId: "b" },
  { taskId: "react-1", text: "Props передаются извне, state — внутреннее." },
  { taskId: "unknown-task", optionId: "x" },
] as const;

const answers2: readonly Answer[] = [
  { taskId: "ts-2", optionId: "a" },
  { taskId: "http-1", text: "   " },
  { taskId: "ts-1", optionId: "a" },
] as const;

const answers3: readonly Answer[] = [] as const;

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

const foundTs1 = findTask(set1, "ts-1");
const notFound = findTask(set1, "non-existent");
console.log("\n[Поиск]");
console.log("Поиск ts-1:", foundTs1?.id);
console.log("Поиск non-existent:", notFound);

const tsTasks = filterByTopic(set1, "typescript");
const noMatch = filterByTopic(set1, "python");
const emptyFilter = filterByTopic(set3, "typescript");
console.log("\n[Фильтр]");
console.log("Фильтр typescript в set1 (ожидается 1):", tsTasks.length);
console.log("Фильтр python в set1 (ожидается 0):", noMatch.length);
console.log("Фильтр в пустом наборе set3 (ожидается 0):", emptyFilter.length);

const progress1 = calculateProgress(set1, answers1);
const progress2 = calculateProgress(set2, answers2);
const progress3 = calculateProgress(set3, answers3);
console.log("\n[Прогресс]");
console.log("Прогресс set1 (ожидается 2 из 2):", progress1);
console.log("Прогресс set2 (ожидается 1 из 2):", progress2);
console.log("Прогресс set3 пустой (ожидается 0 из 0):", progress3);

console.log("\n[Неизменяемость]");
console.log("Исходный набор set1 не изменен (длина):", set1.tasks.length === 2);
console.log(
  "Исходный массив answers1 не изменен (длина):",
  answers1.length === 3,
);
