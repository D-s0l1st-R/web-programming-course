import type { Task, Answer } from "../model/domain";
import { isAnswered } from "../model/attempt";

interface ReviewItemProps {
  readonly task: Task;
  readonly answer: Answer | undefined;
  readonly index: number;
  readonly readonly: boolean;
  readonly isSubmitting?: boolean;
  readonly onGoTo?: (index: number) => void;
  readonly onRemove?: (taskId: string) => void;
}

// Один элемент обзора: задание, ответ пользователя и действия
export function ReviewItem({
  task,
  answer,
  index,
  readonly,
  isSubmitting,
  onGoTo,
  onRemove,
}: ReviewItemProps) {
  const filled = isAnswered(answer);
  const display = !answer
    ? "— пропущено —"
    : answer.kind === "single-choice"
      ? `вариант: ${answer.optionId}`
      : `текст: ${answer.text || "(пусто)"}`;

  return (
    <li
      style={{
        padding: "0.75rem",
        marginBottom: "0.5rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        background: filled ? "#f9f9f9" : "#fff8e1",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>{task.id}</strong>
        {!readonly && onGoTo && (
          <button
            onClick={() => onGoTo(index)}
            disabled={isSubmitting}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.9em" }}
          >
            Перейти
          </button>
        )}
      </div>
      <div style={{ marginTop: "0.25rem", fontWeight: "bold" }}>
        {task.topic}
      </div>
      <div style={{ marginTop: "0.25rem" }}>{task.prompt}</div>
      <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>{display}</div>
      {!readonly && filled && onRemove && (
        <div style={{ marginTop: "0.5rem" }}>
          <button
            onClick={() => onRemove(task.id)}
            disabled={isSubmitting}
            style={{
              padding: "0.25rem 0.5rem",
              fontSize: "0.9em",
              color: "#c62828",
            }}
            aria-label={`Удалить ответ для ${task.id}`}
          >
            Удалить ответ
          </button>
        </div>
      )}
    </li>
  );
}
