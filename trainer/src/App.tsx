import { useReducer, useEffect, useState, useCallback } from "react";
import type { Answer, Task, TrainingSet, RequestState } from "./model/domain";
import { reducer } from "./model/reducer";
import {
  createInitialState,
  getAnswer,
  answeredCount,
  getMissingTasks,
  canFinish,
} from "./model/attempt";
import {
  readDraft,
  saveDraft,
  clearDraft,
  getStorageKey,
  type Draft,
} from "./model/storage";
import { fetchSet } from "./api/sets";
import {
  createAttempt,
  saveAnswer,
  deleteAnswer,
  submitAttempt,
  fetchResult,
  fetchAttempt,
} from "./api/attempts";
import { describeError } from "./api/http";
import {
  getFault,
  setFault,
  subscribeFault,
  type FaultConfig,
} from "./api/fault";
import { TaskList } from "./components/TaskList";
import { TaskCard } from "./components/TaskCard";
import { Progress } from "./components/Progress";
import { AttemptReview } from "./components/AttemptReview";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { StorageWarning } from "./components/StorageWarning";
import { NetworkStatus } from "./components/NetworkStatus";
import { DraftRestoredNotice } from "./components/DraftRestoredNotice";
import { FaultSimulator } from "./components/FaultSimulator";

const SET_ID = "web-basics";

type AppMode = "task" | "review";
type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [trainingSet, setTrainingSet] = useState<TrainingSet | null>(null);
  const [mode, setMode] = useState<AppMode>("task");
  const [showWarning, setShowWarning] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answerRequest, setAnswerRequest] = useState<RequestState>({
    status: "idle",
  });
  const [submitRequest, setSubmitRequest] = useState<RequestState>({
    status: "idle",
  });
  const [draftRestored, setDraftRestored] = useState(false);
  const [fault, setFaultState] = useState<FaultConfig>(() => getFault());
  // Счётчик повторов загрузки набора — меняется при нажатии «Повторить»
  const [retryKey, setRetryKey] = useState(0);

  // Подписка на изменения симуляции ошибок (включая авто-сброс failOnce)
  useEffect(() => {
    return subscribeFault(setFaultState);
  }, []);

  // Загрузка набора (только метаданные, попытка создаётся по кнопке)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadStatus("loading");
      try {
        const set = await fetchSet(SET_ID);
        if (cancelled) return;
        setTrainingSet(set);
        setLoadStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setLoadError(describeError(error, "Ошибка загрузки набора"));
        setLoadStatus("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  // Синхронизация черновика: храним актуальный статус попытки,
  // чтобы после перезагрузки не оставался устаревший "in-progress"
  useEffect(() => {
    if (state.attemptId) {
      const draft: Draft = {
        version: 1,
        setId: SET_ID,
        attemptId: state.attemptId,
        currentIndex: state.currentIndex,
        answers: state.answers,
        status: state.status,
        score: state.score,
      };
      const result = saveDraft(draft);
      if (!result.success) {
        setStorageError(result.error || "Ошибка сохранения");
      } else {
        setStorageError(null);
      }
    }
  }, [state]);

  const tasks = trainingSet?.tasks ?? [];
  const currentTask: Task | undefined = tasks[state.currentIndex];
  const currentAnswer = currentTask
    ? getAnswer(state.answers, currentTask.id)
    : undefined;
  const count = answeredCount(tasks, state.answers);
  const missing = getMissingTasks(tasks, state.answers);
  const finished = canFinish(tasks, state.answers);

  const goTo = useCallback(
    (index: number) => {
      if (state.status !== "in-progress") return;
      dispatch({ type: "moved", index, tasksLength: tasks.length });
      setMode("task");
    },
    [state.status, tasks.length],
  );

  const goNext = () => goTo(state.currentIndex + 1);
  const goPrev = () => goTo(state.currentIndex - 1);
  const openReview = () => {
    if (state.status !== "in-progress") return;
    setMode("review");
  };

  // Создание попытки по кнопке «Начать»
  const startAttempt = async () => {
    setLoadStatus("loading");
    try {
      // Сначала проверяем черновик: статус берём с сервера,
      // а не из локальной копии
      const raw = localStorage.getItem(getStorageKey(SET_ID));
      const draft = readDraft(raw);

      if (draft?.attemptId) {
        try {
          const attempt = await fetchAttempt(draft.attemptId);
          dispatch({ type: "attemptLoaded", attempt });
          setDraftRestored(true);
          // Attempt не содержит score — балл берём из Result
          if (attempt.status !== "in-progress") {
            try {
              const result = await fetchResult(attempt.id);
              dispatch({
                type: "resultLoaded",
                status: result.status,
                score: result.score,
              });
            } catch {
              // Балл недоступен — статус уже корректный
            }
          }
          setLoadStatus("ready");
          return;
        } catch {
          // Попытка не найдена или сервер недоступен — создаём новую
        }
      }

      const attempt = await createAttempt(SET_ID);
      dispatch({ type: "attemptLoaded", attempt });
      setLoadStatus("ready");
    } catch (error) {
      setLoadError(describeError(error, "Не удалось создать попытку"));
      setLoadStatus("error");
    }
  };

  const handleAnswer = async (answer: Answer) => {
    if (!state.attemptId || state.status !== "in-progress") return;
    setAnswerRequest({ status: "loading" });
    try {
      await saveAnswer(state.attemptId, answer);
      dispatch({ type: "answerSaved", answer });
      setAnswerRequest({ status: "success" });
    } catch (error) {
      setAnswerRequest({
        status: "error",
        message: describeError(error, "Ошибка сохранения"),
      });
      // Локально сохраняем всё равно — ввод не теряется
      dispatch({ type: "answerChanged", answer });
    }
  };

  const handleRemove = async (taskId: string) => {
    if (!state.attemptId || state.status !== "in-progress") return;
    setAnswerRequest({ status: "loading" });
    try {
      await deleteAnswer(state.attemptId, taskId);
      dispatch({ type: "answerDeleted", taskId });
      setAnswerRequest({ status: "success" });
    } catch (error) {
      setAnswerRequest({
        status: "error",
        message: describeError(error, "Ошибка удаления"),
      });
      dispatch({ type: "answerRemoved", taskId });
    }
  };

  // Завершение: submit сразу возвращает Result (attemptId, status, score)
  const handleSubmit = async () => {
    if (!state.attemptId || state.status !== "in-progress") return;
    setSubmitRequest({ status: "loading" });
    try {
      const result = await submitAttempt(state.attemptId);
      // Финальный статус + балл из ответа сервера
      dispatch({ type: "attemptSubmitted" });
      dispatch({
        type: "resultLoaded",
        status: result.status,
        score: result.score,
      });
      setSubmitRequest({ status: "success" });
    } catch (error) {
      setSubmitRequest({
        status: "error",
        message: describeError(error, "Ошибка завершения"),
      });
    }
  };

  const requestFinish = () => {
    if (finished) {
      handleSubmit();
    } else {
      setShowWarning(true);
    }
  };

  const confirmFinish = () => {
    setShowWarning(false);
    handleSubmit();
  };

  const cancelFinish = () => setShowWarning(false);

  const startNewAttempt = () => {
    clearDraft(SET_ID);
    dispatch({ type: "reset" });
    setMode("task");
    setAnswerRequest({ status: "idle" });
    setSubmitRequest({ status: "idle" });
    setLoadStatus("ready");
    setDraftRestored(false);
    // Пересоздаём попытку
    startAttempt();
  };

  const retryLoad = () => {
    setLoadError(null);
    setLoadStatus("idle");
    setRetryKey((k) => k + 1);
  };

  // ===== Рендер =====

  // Экран загрузки набора
  if (loadStatus === "loading" && !trainingSet) {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <p>Загрузка набора...</p>
      </main>
    );
  }

  // Ошибка загрузки набора
  if (loadStatus === "error" && !trainingSet) {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>Ошибка загрузки</h1>
        </header>
        <div
          style={{
            padding: "1rem",
            background: "#ffebee",
            border: "1px solid #c62828",
            borderRadius: "8px",
          }}
        >
          <p>{loadError}</p>
          <button onClick={retryLoad} style={{ padding: "0.5rem 1rem" }}>
            Повторить
          </button>
        </div>
        <FaultSimulator
          config={fault}
          onChange={(next) => {
            setFault(next);
            setFaultState(next);
          }}
        />
      </main>
    );
  }

  // Стартовый экран — набор загружен, но попытка не создана
  if (
    (loadStatus === "ready" || loadStatus === "loading") &&
    !state.attemptId &&
    state.status === "in-progress" &&
    state.answers.length === 0
  ) {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>{trainingSet?.title ?? "Тренажёр"}</h1>
        </header>
        <section
          style={{
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <h2>Описание</h2>
          <p>
            Учебный модуль содержит <strong>{tasks.length} заданий</strong> двух
            типов: выбор варианта и короткий текстовый ответ.
          </p>
          <p>
            После завершения попытки редактирование будет заблокировано.
            Черновик сохраняется автоматически.
          </p>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li>single-choice — выбор одного варианта</li>
            <li>short-text — развёрнутый текстовый ответ</li>
          </ul>
          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={startAttempt}
              disabled={loadStatus === "loading"}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1.1em",
                cursor: "pointer",
              }}
            >
              {loadStatus === "loading"
                ? "Создание попытки..."
                : "Начать попытку"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Ошибка создания попытки
  if (loadStatus === "error" && trainingSet && !state.attemptId) {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>{trainingSet.title}</h1>
        </header>
        <div
          style={{
            padding: "1rem",
            background: "#ffebee",
            border: "1px solid #c62828",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <p>{loadError}</p>
          <button onClick={startAttempt} style={{ padding: "0.5rem 1rem" }}>
            Попробовать снова
          </button>
        </div>
        <FaultSimulator
          config={fault}
          onChange={(next) => {
            setFault(next);
            setFaultState(next);
          }}
        />
      </main>
    );
  }

  // Финальный экран — попытка завершена или ожидает проверки
  if (state.status === "submitted" || state.status === "pending-review") {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>
            {trainingSet?.title} —{" "}
            {state.status === "pending-review"
              ? "Ожидает проверки"
              : "Завершено"}
          </h1>
        </header>
        <AttemptReview
          tasks={tasks}
          answers={state.answers}
          readonly
          score={state.score}
          status={state.status}
        />
        <div style={{ marginTop: "1rem" }}>
          <button onClick={startNewAttempt} style={{ padding: "0.5rem 1rem" }}>
            Начать новую попытку
          </button>
        </div>
      </main>
    );
  }

  // Основной экран попытки
  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
      <header>
        <h1>
          {trainingSet?.title}{" "}
          <span style={{ fontWeight: "normal", fontSize: "0.7em" }}>
            ({tasks.length})
          </span>
        </h1>
      </header>

      {fault.kind !== "none" && (
        <div
          role="alert"
          style={{
            padding: "0.75rem",
            background: "#fff3e0",
            border: "1px solid #ff9800",
            borderRadius: "4px",
            marginBottom: "1rem",
            color: "#e65100",
            fontWeight: "bold",
          }}
        >
          ⚠ Симуляция ошибок активна:
          {fault.kind === "network"
            ? " Network error (TypeError)"
            : fault.kind === "timeout"
              ? " Timeout (TimeoutError)"
              : fault.kind === "malformed"
                ? " malformed JSON (200 OK)"
                : ` HTTP ${fault.kind}`}
          (область:{" "}
          {fault.scope === "all"
            ? "все"
            : fault.scope === "write"
              ? "запись"
              : "чтение"}
          ){fault.failOnce && " · один раз"}
        </div>
      )}

      <FaultSimulator
        config={fault}
        onChange={(next) => {
          setFault(next);
          setFaultState(next);
        }}
      />

      {storageError && <StorageWarning error={storageError} />}
      {draftRestored && (
        <DraftRestoredNotice onDismiss={() => setDraftRestored(false)} />
      )}
      {answerRequest.status === "error" && (
        <NetworkStatus
          message={answerRequest.message || "Ошибка сохранения ответа"}
          onRetry={() => {
            if (currentTask && currentAnswer) handleAnswer(currentAnswer);
          }}
        />
      )}
      {submitRequest.status === "error" && (
        <NetworkStatus
          message={submitRequest.message || "Ошибка завершения"}
          onRetry={handleSubmit}
        />
      )}

      <Progress answered={count} total={tasks.length} missing={missing} />

      <TaskList
        tasks={tasks}
        currentIndex={state.currentIndex}
        answers={state.answers}
        onSelect={goTo}
      />

      {mode === "review" ? (
        <AttemptReview
          tasks={tasks}
          answers={state.answers}
          readonly={false}
          onGoTo={goTo}
          onRemove={handleRemove}
          onFinish={requestFinish}
          isSubmitting={submitRequest.status === "loading"}
        />
      ) : currentTask ? (
        <TaskCard
          task={currentTask}
          answer={currentAnswer}
          onAnswer={handleAnswer}
          onRemove={() => handleRemove(currentTask.id)}
          onPrev={goPrev}
          onNext={goNext}
          onReview={openReview}
          onFinish={requestFinish}
          isFirst={state.currentIndex === 0}
          isLast={state.currentIndex === tasks.length - 1}
          isSubmitting={submitRequest.status === "loading"}
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
