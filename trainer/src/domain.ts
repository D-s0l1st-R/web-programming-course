import trainingSetData from "../../course/data/training-set.json" with { type: "json" };

export type TrainingSet = typeof trainingSetData;
export type Task = TrainingSet["tasks"][number];

export type Answer =
  | { taskId: string; kind: "single-choice"; optionId: string }
  | { taskId: string; kind: "short-text"; text: string };

export const trainingSet: TrainingSet = trainingSetData;

export function findTask(set: TrainingSet, taskId: string): Task | undefined {
  return set.tasks.find((task) => task.id === taskId);
}

export function filterByTopic(set: TrainingSet, topic: string): Task[] {
  return set.tasks.filter((task) => task.topic === topic);
}

export function calculateProgress(
  set: TrainingSet,
  answers: Answer[],
): { completed: number; total: number } {
  const total = set.tasks.length;
  const completed = answers.filter((answer) => {
    const task = findTask(set, answer.taskId);
    if (!task) return false;
    if (task.kind === "short-text") {
      return answer.kind === "short-text" && answer.text.trim().length > 0;
    }
    return true;
  }).length;

  return { completed, total };
}
