import type { Task, Answer, AttemptStatus } from "../model/domain";
import { getAnswer } from "../model/attempt";
import { ReviewItem } from "./ReviewItem";

interface AttemptReviewProps {
  readonly tasks: readonly Task[];
  readonly answers: readonly Answer[];
  readonly readonly: boolean;
  readonly onGoTo?: (index: number) => void;
  readonly onRemove?: (taskId: string) => void;
  readonly onFinish?: () => void;
  readonly isSubmitting?: boolean;
  readonly score?: number | null;
  readonly status?: AttemptStatus;
}

// Обзор попытки: итоговый статус и список ответов по заданиям
export function AttemptReview({
  tasks,
  answers,
  readonly,
  onGoTo,
  onRemove,
  onFinish,
  isSubmitting,
  score,
  status,
}: AttemptReviewProps) {
  return (
    <section style={{ marginTop: "1rem" }}>
      <h2>{readonly ? "Итоговый обзор" : "Обзор ответов"}</h2>

      {readonly && status && (
        <div
          style={{
            padding: "1rem",
            background: status === "pending-review" ? "#fff3e0" : "#e8f5e9",
            border: `1px solid ${status === "pending-review" ? "#ff9800" : "#4caf50"}`,
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <strong>
            {status === "pending-review"
              ? "Попытка ожидает проверки преподавателем"
              : "Попытка завершена"}
          </strong>
          {score === null && status === "pending-review" && (
            <div style={{ marginTop: "0.5rem" }}>Балл: ожидает проверки</div>
          )}
          {typeof score === "number" && (
            <div style={{ marginTop: "0.5rem" }}>Балл: {score}</div>
          )}
          {score === null && status !== "pending-review" && (
            <div style={{ marginTop: "0.5rem" }}>Балл: не начислен</div>
          )}
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task, index) => (
          <ReviewItem
            key={task.id}
            task={task}
            answer={getAnswer(answers, task.id)}
            index={index}
            readonly={readonly}
            isSubmitting={isSubmitting}
            onGoTo={onGoTo}
            onRemove={onRemove}
          />
        ))}
      </ul>

      {!readonly && onFinish && (
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={onFinish}
            disabled={isSubmitting}
            style={{ padding: "0.5rem 1rem" }}
          >
            {isSubmitting ? "Отправка..." : "Завершить попытку"}
          </button>
        </div>
      )}
    </section>
  );
}
