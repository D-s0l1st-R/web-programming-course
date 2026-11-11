import { useState, useMemo } from "react";
import { fullSet } from "./demo";
import type { Answer, Task } from "./domain";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import { Progress } from "./Progress";
import { Review } from "./Review";
import { ConfirmDialog } from "./ConfirmDialog";

type Status = "idle" | "submitted";

function isAnswered(answers: readonly Answer[], taskId: string): boolean {
  const answer = answers.find((a) => a.taskId === taskId);
  if (!answer) return false;
  if (answer.kind === "single-choice") return answer.optionId.length > 0;
  return answer.text.trim().length > 0;
}

export default function App() {
  const tasks = fullSet.tasks;

  const [answers, setAnswers] = useState<readonly Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [showWarning, setShowWarning] = useState(false);

  const currentTask: Task | undefined = tasks[currentIndex];

  const answeredCount = useMemo(
    () => tasks.reduce((c, t) => c + (isAnswered(answers, t.id) ? 1 : 0), 0),
    [tasks, answers],
  );

  const missingTasks = useMemo(
    () => tasks.filter((t) => !isAnswered(answers, t.id)),
    [tasks, answers],
  );

  const replaceAnswer = (next: Answer) => {
    if (status !== "idle") return;
    setAnswers((prev) => [
      ...prev.filter((a) => a.taskId !== next.taskId),
      next,
    ]);
  };

  const goTo = (index: number) => {
    if (status !== "idle") return;
    setCurrentIndex(Math.max(0, Math.min(index, tasks.length - 1)));
  };

  const goNext = () => goTo(currentIndex + 1);
  const goPrev = () => goTo(currentIndex - 1);

  const requestFinish = () => {
    if (missingTasks.length === 0) {
      setStatus("submitted");
    } else {
      setShowWarning(true);
    }
  };

  const confirmFinish = () => {
    setShowWarning(false);
    setStatus("submitted");
  };

  const cancelFinish = () => {
    setShowWarning(false);
  };

  const startNewAttempt = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setStatus("idle");
    setShowWarning(false);
  };

  if (status === "submitted") {
    return (
      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "1rem" }}>
        <header>
          <h1>{fullSet.title} — попытка завершена</h1>
        </header>
        <Review tasks={tasks} answers={answers} />
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

      <Progress
        answered={answeredCount}
        total={tasks.length}
        missing={missingTasks}
      />

      <TaskList
        tasks={tasks}
        currentIndex={currentIndex}
        answers={answers}
        onSelect={goTo}
      />

      {currentTask && (
        <TaskCard
          task={currentTask}
          answer={answers.find((a) => a.taskId === currentTask.id)}
          onAnswer={replaceAnswer}
          onPrev={goPrev}
          onNext={goNext}
          onFinish={requestFinish}
          isFirst={currentIndex === 0}
          isLast={currentIndex === tasks.length - 1}
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
