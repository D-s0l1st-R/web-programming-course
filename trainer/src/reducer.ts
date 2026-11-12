import type { Answer, AttemptState, Draft } from "./domain";

export type Action =
  | { type: "answerChanged"; answer: Answer }
  | { type: "moved"; index: number }
  | { type: "restored"; state: AttemptState }
  | { type: "reset" }
  | { type: "submitted" };

export function createInitialState(): AttemptState {
  return {
    currentIndex: 0,
    answers: [],
    status: "in-progress",
  };
}

export function reducer(state: AttemptState, action: Action): AttemptState {
  // В submitted блокируем изменения
  if (state.status === "submitted" && action.type !== "reset") {
    return state;
  }

  switch (action.type) {
    case "answerChanged":
      return {
        ...state,
        answers: [
          ...state.answers.filter((a) => a.taskId !== action.answer.taskId),
          action.answer,
        ],
      };

    case "moved":
      return {
        ...state,
        currentIndex: action.index,
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

export function stateToDraft(setId: string, state: AttemptState): Draft {
  return {
    version: 1,
    setId,
    currentIndex: state.currentIndex,
    answers: state.answers,
    status: state.status,
  };
}