import { useReducer, useEffect, useState } from "react";
import { fullSet } from "./demo";
import type { Answer, Task } from "./domain";
import { reducer, type Action } from "./reducer";
import {
  type AttemptState,
  createInitialState,
  getAnswer,
  answeredCount,
  getMissingTasks,
  canFinish,
} from "./attempt";
import { readDraft, saveDraft, clearDraft, getStorageKey } from "./storage";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { Progress } from "./Progress";
import { Review } from "./Review";
import { ConfirmDialog } from "./ConfirmDialog";
import { StorageWarning } from "./StorageWarning";

type AppMode = "task" | "review";

type RestoreStatus = "none" | "restored" | "corrupted" | "mismatch";

export default function App() {
  const tasks = fullSet.tasks;
  const setId = fullSet.id;

  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [mode, setMode] = useState<AppMode>("task");
  const [showWarning, setShowWarning] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>("none");

  // Восстановление черновика
  useEffect(() => {
    const key = getStorageKey(setId);
    const raw = localStorage.getItem(key);
    const draft = readDraft(raw);

    if (draft === null) {
      if (raw !== null) setRestoreStatus("corrupted");
      return;
    }

    if (draft.setId !== setId) {
      setRestoreStatus("mismatch");
      return;
    }

    dispatch({
      type: "restored",
      state: {
        currentIndex: draft.currentIndex,
        answers: draft.answers,
        status: draft.status,
      },
    });
    setRestoreStatus("restored");
  }, [setId]);

  // Сохранение черновика
  useEffect(() => {
    if (state.status === "in-progress") {
      const draft = {
        version: 1 as const,
        setId,
        currentIndex: state.currentIndex,
        answers: state.answers,
        status: state.status,
      };
      const result = saveDraft(draft);
      if (!result.success) {
        setStorageError(result.error || "Ошибка сохранения");
      } else {
        setStorageError(null);
      }
    }
  }, [state, setId]);

  const currentTask: Task | undefined = tasks[state.currentIndex];
  const currentAnswer = currentTask
    ? getAnswer(state.answers, currentTask.id)
    : undefined;

  const count = answeredCount(tasks, state.answers);
  const missing = getMissingTasks(tasks, state.answers);
  const finished = canFinish(tasks, state.answers);

  const goTo = (index: number) => {
    if (state.status !== "in-progress") return;
    dispatch({ type: "moved", index, tasksLength: tasks.length });
    setMode("task");
  };

  const goNext = () => goTo(state.currentIndex + 1);
  const goPrev = () => goTo(state.currentIndex - 1);

  const openReview = () => {
    if (state.status !== "in-progress") return;
    setMode("review");
  };

  const requestFinish = () => {
    if (finished) {
      dispatch({ type: "submitted" });
      setMode("task");
    } else {
      setShowWarning(true);
    }
  };

  const confirmFinish = () => {
    setShowWarning(false);
    dispatch({ type: "submitted" });
    setMode("task");
  };

  const cancelFinish = () => setShowWarning(false);

  const startNewAttempt = () => {
    clearDraft(setId);
    dispatch({ type: "reset" });
    setMode("task");
    setRestoreStatus("none");
    setStorageError(null);
  };

  const handleResetCorrupted = () => {
    clearDraft(setId);
    setRestoreStatus("none");
    dispatch({ type: "reset" });
    setMode("task");
  };

  // Повреждённый/чужой черновик
  if (restoreStatus === "corrupted" || restoreStatus === "mismatch") {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header><h1>{fullSet.title}</h1></header>
        <div style={{ padding: "1rem", background: "#fff3e0", border: "1px solid #ff9800", borderRadius: "8px", marginTop: "1rem" }}>
          <h3>{restoreStatus === "corrupted" ? "Черновик повреждён" : "Найден черновик другого набора"}</h3>
          <p>{restoreStatus === "corrupted" ? "Сохранённый черновик не удалось восстановить." : "Найден черновик от другого учебного модуля."}</p>
          <button onClick={handleResetCorrupted} style={{ padding: "0.5rem 1rem" }}>Начать новую попытку</button>
        </div>
      </main>
    );
  }

  // Завершённая попытка — только финальный обзор
  if (state.status === "submitted") {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header><h1>{fullSet.title} — попытка завершена</h1></header>
        <Review
          tasks={tasks}
          answers={state.answers}
          readonly
          onGoTo={goTo}
        />
        <div style={{ marginTop: "1rem" }}>
          <button onClick={startNewAttempt} style={{ padding: "0.5rem 1rem" }}>
            Начать новую попытку
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
      <header>
        <h1>
          {fullSet.title}{" "}
          <span style={{ fontWeight: "normal", fontSize: "0.7em" }}>
            ({tasks.length})
          </span>
        </h1>
      </header>

      {storageError && <StorageWarning error={storageError} />}

      {restoreStatus === "restored" && (
        <div style={{ padding: "0.5rem", background: "#e3f2fd", borderRadius: "4px", marginBottom: "1rem" }}>
          Черновик восстановлен
        </div>
      )}

      <Progress answered={count} total={tasks.length} missing={missing} />

      <TaskList
        tasks={tasks}
        currentIndex={state.currentIndex}
        answers={state.answers}
        onSelect={goTo}
      />

      {mode === "review" ? (
        <Review
          tasks={tasks}
          answers={state.answers}
          readonly={false}
          onGoTo={goTo}
          onRemove={(taskId) => dispatch({ type: "answerRemoved", taskId })}
          onFinish={requestFinish}
        />
      ) : currentTask ? (
        <TaskCard
          task={currentTask}
          answer={currentAnswer}
          onAnswer={(answer) => dispatch({ type: "answerChanged", answer })}
          onRemove={() => dispatch({ type: "answerRemoved", taskId: currentTask.id })}
          onPrev={goPrev}
          onNext={goNext}
          onReview={openReview}
          onFinish={requestFinish}
          isFirst={state.currentIndex === 0}
          isLast={state.currentIndex === tasks.length - 1}
        />
      ) : null}

      {showWarning && (
        <ConfirmDialog
          missing={missing}
          onConfirm={confirmFinish}
          onCancel={cancelFinish}
        />
      )}
    </main>
  );
}