import type { Answer } from "./domain";
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
  | { type: "moved"; index: number; tasksLength: number }
  | { type: "restored"; state: AttemptState }
  | { type: "reset" }
  | { type: "submitted" };

export function reducer(state: AttemptState, action: Action): AttemptState {
  if (state.status === "submitted" && action.type !== "reset") {
    return state;
  }

  switch (action.type) {
    case "answerChanged":
      return {
        ...state,
        answers: replaceAnswer(state.answers, action.answer),
      };

    case "answerRemoved":
      return {
        ...state,
        answers: removeAnswer(state.answers, action.taskId),
      };

    case "moved":
      return {
        ...state,
        currentIndex: clampIndex(action.index, action.tasksLength),
      };

    case "restored":
      return {
        ...state,
        ...action.state,
      };

    case "reset":
      return createInitialState();

    case "submitted":
      return {
        ...state,
        status: "submitted",
      };

    default:
      return state;
  }
}
