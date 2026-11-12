import { useReducer, useEffect, useState } from "react";
import { fullSet } from "./demo";
import type { Answer, Task, AttemptState } from "./domain";
import { reducer, createInitialState, stateToDraft, type Action } from "./reducer";
import { readDraft, saveDraft, clearDraft, getStorageKey } from "./storage";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { Progress } from "./Progress";
import { Review } from "./Review";
import { ConfirmDialog } from "./ConfirmDialog";
import { StorageWarning } from "./StorageWarning";

function isAnswered(answers: readonly Answer[], taskId: string): boolean {
  const answer = answers.find((a) => a.taskId === taskId);
  if (!answer) return false;
  if (answer.kind === "single-choice") return answer.optionId.length > 0;
  return answer.text.trim().length > 0;
}

type RestoreStatus = "none" | "restored" | "corrupted" | "mismatch";

export default function App() {
  const tasks = fullSet.tasks;
  const setId = fullSet.id;

  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [showWarning, setShowWarning] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>("none");

  // Восстановление черновика при монтировании
  useEffect(() => {
    const key = getStorageKey(setId);
    const raw = localStorage.getItem(key);
    const draft = readDraft(raw);

    if (draft === null) {
      if (raw !== null) {
        // Был черновик, но он повреждён или несовместим
        setRestoreStatus("corrupted");
      }
      return;
    }

    if (draft.setId !== setId) {
      // Черновик от другого набора
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

  // Сохранение черновика при изменении состояния
  useEffect(() => {
    if (state.status === "in-progress") {
      const draft = stateToDraft(setId, state);
      const result = saveDraft(draft);
      if (!result.success) {
        setStorageError(result.error || "Ошибка сохранения");
      } else {
        setStorageError(null);
      }
    }
  }, [state, setId]);

  const currentTask: Task | undefined = tasks[state.currentIndex];

  const answeredCount = tasks.reduce(
    (count, task) => count + (isAnswered(state.answers, task.id) ? 1 : 0),
    0,
  );

  const missingTasks = tasks.filter((t) => !isAnswered(state.answers, t.id));

  const goTo = (index: number) => {
    if (state.status !== "in-progress") return;
    const clamped = Math.max(0, Math.min(index, tasks.length - 1));
    dispatch({ type: "moved", index: clamped });
  };

  const goNext = () => goTo(state.currentIndex + 1);
  const goPrev = () => goTo(state.currentIndex - 1);

  const requestFinish = () => {
    if (missingTasks.length === 0) {
      dispatch({ type: "submitted" });
    } else {
      setShowWarning(true);
    }
  };

  const confirmFinish = () => {
    setShowWarning(false);
    dispatch({ type: "submitted" });
  };

  const cancelFinish = () => {
    setShowWarning(false);
  };

  const startNewAttempt = () => {
    clearDraft(setId);
    dispatch({ type: "reset" });
    setRestoreStatus("none");
    setStorageError(null);
  };

  const handleResetCorrupted = () => {
    clearDraft(setId);
    setRestoreStatus("none");
    dispatch({ type: "reset" });
  };

  // Если черновик повреждён или от другого набора — показываем сообщение
  if (restoreStatus === "corrupted" || restoreStatus === "mismatch") {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>{fullSet.title}</h1>
        </header>
        <div
          style={{
            padding: "1rem",
            background: "#fff3e0",
            border: "1px solid #ff9800",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <h3>
            {restoreStatus === "corrupted"
              ? "Черновик повреждён"
              : "Найден черновик другого набора"}
          </h3>
          <p>
            {restoreStatus === "corrupted"
              ? "Сохранённый черновик не удалось восстановить. Данные могут быть утеряны."
              : "Найден черновик от другого учебного модуля. Он несовместим с текущим набором."}
          </p>
          <button
            onClick={handleResetCorrupted}
            style={{ padding: "0.5rem 1rem" }}
          >
            Начать новую попытку
          </button>
        </div>
      </main>
    );
  }

  // Если попытка завершена — показываем обзор
  if (state.status === "submitted") {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>{fullSet.title} — попытка завершена</h1>
        </header>
        <Review tasks={tasks} answers={state.answers} />
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
        <div
          style={{
            padding: "0.5rem",
            background: "#e3f2fd",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          Черновик восстановлен
        </div>
      )}

      <Progress
        answered={answeredCount}
        total={tasks.length}
        missing={missingTasks}
      />

      <TaskList
        tasks={tasks}
        currentIndex={state.currentIndex}
        answers={state.answers}
        onSelect={goTo}
      />

      {currentTask && (
        <TaskCard
          task={currentTask}
          answer={state.answers.find((a) => a.taskId === currentTask.id)}
          onAnswer={(answer) => dispatch({ type: "answerChanged", answer })}
          onPrev={goPrev}
          onNext={goNext}
          onFinish={requestFinish}
          isFirst={state.currentIndex === 0}
          isLast={state.currentIndex === tasks.length - 1}
        />
      )}

      {showWarning && (
        <ConfirmDialog
          missing={missingTasks}
          onConfirm={confirmFinish}
          onCancel={cancelFinish}
        />
      )}
    </main>
  );
}