import {
  trainingSet,
  TrainingSet,
  Task,
  Answer,
  findTask,
  filterByTopic,
  calculateProgress,
} from "./domain";

const ts1 = trainingSet.tasks.find((t) => t.id === "ts-1") as Task;
const react1 = trainingSet.tasks.find((t) => t.id === "react-1") as Task;

console.log("=== Загруженные задания ===");
console.log("ts-1:", ts1);
console.log("react-1:", react1);

const answersFull: Answer[] = [
  { taskId: "ts-1", kind: "single-choice", optionId: "b" },
  {
    taskId: "react-1",
    kind: "short-text",
    text: "Props передаются извне, state — внутреннее",
  },
];

const answersOtherIds: Answer[] = [
  { taskId: "http-1", kind: "short-text", text: "Content-Type" },
];

const answersEmpty: Answer[] = [];

console.log("\n=== findTask ===");
console.log("ts-1:", findTask(trainingSet, "ts-1"));
console.log("react-1:", findTask(trainingSet, "react-1"));
console.log("unknown:", findTask(trainingSet, "unknown-id")); // undefined

console.log("\n=== filterByTopic ===");
console.log("typescript:", filterByTopic(trainingSet, "typescript"));
console.log("react:", filterByTopic(trainingSet, "react"));
console.log("unknown:", filterByTopic(trainingSet, "unknown")); // []
console.log("empty string:", filterByTopic(trainingSet, "")); // []

console.log("\n=== calculateProgress ===");
console.log("full set:", calculateProgress(trainingSet, answersFull));
console.log("other ids:", calculateProgress(trainingSet, answersOtherIds));
console.log("empty:", calculateProgress(trainingSet, answersEmpty));

const emptySet: TrainingSet = { id: "empty", title: "Empty", tasks: [] };
console.log("empty set:", calculateProgress(emptySet, answersFull));

const whitespaceAnswer: Answer[] = [
  { taskId: "react-1", kind: "short-text", text: "   " },
];
console.log("whitespace:", calculateProgress(trainingSet, whitespaceAnswer));

console.log("\n=== Immutability ===");
console.log("tasks length:", trainingSet.tasks.length);
console.log("answersFull length:", answersFull.length);
