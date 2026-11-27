import type { Answer, Attempt, ResultStatus } from "./domain";
import {
  type AttemptState,
  createInitialState,
  replaceAnswer,
  removeAnswer,
  clampIndex,
} from "./attempt";

export type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "answerRemoved"; taskId: string }
  | { type: "answerSaved"; answer: Answer }
  | { type: "answerDeleted"; taskId: string }
  | { type: "moved"; index: number; tasksLength: number }
  | { type: "attemptLoaded"; attempt: Attempt }
  | { type: "attemptSubmitted" }
  | { type: "resultLoaded"; status: ResultStatus; score: number | null }
  | { type: "reset" };

export function reducer(state: AttemptState, action: Action): AttemptState {
  // Блокируем изменения после завершения, кроме reset и resultLoaded
  if (
    (state.status === "submitted" || state.status === "pending-review") &&
    action.type !== "reset" &&
    action.type !== "resultLoaded"
  ) {
    return state;
  }

  switch (action.type) {
    case "answerChanged":
      return { ...state, answers: replaceAnswer(state.answers, action.answer) };

    case "answerRemoved":
      return { ...state, answers: removeAnswer(state.answers, action.taskId) };

    case "answerSaved":
      return { ...state, answers: replaceAnswer(state.answers, action.answer) };

    case "answerDeleted":
      return { ...state, answers: removeAnswer(state.answers, action.taskId) };

    case "moved":
      return {
        ...state,
        currentIndex: clampIndex(action.index, action.tasksLength),
      };

    case "attemptLoaded":
      return {
        currentIndex: 0,
        answers: action.attempt.answers,
        status: action.attempt.status,
        attemptId: action.attempt.id,
        score: action.attempt.score,
      };

    case "attemptSubmitted":
      return { ...state, status: "submitted" };

    case "resultLoaded":
      return {
        ...state,
        // Статус результата ("graded" | "pending-review") переводим
        // в статус попытки: "graded" означает завершённую попытку
        status:
          action.status === "pending-review" ? "pending-review" : "submitted",
        score: action.score,
      };

    case "reset":
      return createInitialState();

    default:
      return state;
  }
}
