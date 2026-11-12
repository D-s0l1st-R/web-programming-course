import type { Task, Answer } from "./domain";
import { isAnswered, getAnswer } from "./attempt";

interface ReviewProps {
  readonly tasks: readonly Task[];
  readonly answers: readonly Answer[];
  readonly readonly: boolean;
  readonly onGoTo: (index: number) => void;
  readonly onRemove?: (taskId: string) => void;
  readonly onFinish?: () => void;
}

export function Review({
  tasks,
  answers,
  readonly,
  onGoTo,
  onRemove,
  onFinish,
}: ReviewProps) {
  return (
    <section style={{ marginTop: "1rem" }}>
      <h2>{readonly ? "Итоговый обзор" : "Обзор ответов"}</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task, index) => {
          const answer = getAnswer(answers, task.id);
          const filled = isAnswered(answer);
          const display = !answer
            ? "— пропущено —"
            : answer.kind === "single-choice"
              ? `вариант: ${answer.optionId}`
              : `текст: ${answer.text || "(пусто)"}`;

          return (
            <li
              key={task.id}
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
                {!readonly && (
                  <button
                    onClick={() => onGoTo(index)}
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
              <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                {display}
              </div>
              {!readonly && filled && onRemove && (
                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    onClick={() => onRemove(task.id)}
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
        })}
      </ul>

      {!readonly && onFinish && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={onFinish} style={{ padding: "0.5rem 1rem" }}>
            Завершить попытку
          </button>
        </div>
      )}
    </section>
  );
}
