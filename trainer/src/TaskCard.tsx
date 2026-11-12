import type { Task, Answer } from "./domain";
import { AnswerField } from "./AnswerField";

interface TaskCardProps {
  readonly task: Task;
  readonly answer: Answer | undefined;
  readonly onAnswer: (answer: Answer) => void;
  readonly onRemove: () => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onReview: () => void;
  readonly onFinish: () => void;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

export function TaskCard({
  task,
  answer,
  onAnswer,
  onRemove,
  onPrev,
  onNext,
  onReview,
  onFinish,
  isFirst,
  isLast,
}: TaskCardProps) {
  const hasAnswer = answer !== undefined;

  return (
    <section
      style={{
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        marginTop: "1rem",
      }}
    >
      <h2>
        {task.topic}{" "}
        <span style={{ fontWeight: "normal", fontSize: "0.7em" }}>
          ({task.id})
        </span>
      </h2>
      <p>{task.prompt}</p>

      {task.code != null && task.code !== "" && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <code>{task.code}</code>
        </pre>
      )}

      <AnswerField task={task} answer={answer} onAnswer={onAnswer} />

      <nav
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onPrev}
          disabled={isFirst}
          style={{ padding: "0.5rem 1rem" }}
        >
          Назад
        </button>

        {isLast ? (
          <button onClick={onFinish} style={{ padding: "0.5rem 1rem" }}>
            Завершить
          </button>
        ) : (
          <button onClick={onNext} style={{ padding: "0.5rem 1rem" }}>
            Далее
          </button>
        )}

        <button
          onClick={onReview}
          style={{ padding: "0.5rem 1rem", marginLeft: "auto" }}
        >
          Обзор
        </button>

        {hasAnswer && (
          <button
            onClick={() => {
              if (confirm(`Удалить ответ для "${task.id}"?`)) {
                onRemove();
              }
            }}
            style={{ padding: "0.5rem 1rem", color: "#c62828" }}
            aria-label={`Удалить ответ для задания ${task.id}`}
          >
            Удалить ответ
          </button>
        )}
      </nav>
    </section>
  );
}
