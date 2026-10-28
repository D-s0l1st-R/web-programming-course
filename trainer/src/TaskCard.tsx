import type { Task, Answer } from "./domain";
import { SingleChoiceForm } from "./SingleChoiceForm";
import { ShortTextForm } from "./ShortTextForm";
import { Feedback } from "./Feedback";

interface TaskCardProps {
  readonly task: Task | undefined;
  readonly answer: Answer | undefined;
  readonly isChecked: boolean;
  readonly isCorrect: boolean;
  readonly correctOptionId: string | undefined;
  readonly onAnswer: (answer: Answer) => void;
  readonly onCheck: () => void;
}

export function TaskCard({
  task,
  answer,
  isChecked,
  isCorrect,
  correctOptionId,
  onAnswer,
  onCheck,
}: TaskCardProps) {
  if (!task) {
    return (
      <section
        style={{
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "1rem",
        }}
      >
        <p>Нет выбранного задания.</p>
      </section>
    );
  }

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
      <h2>{task.topic}</h2>
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

      {task.kind === "single-choice" ? (
        <SingleChoiceForm
          task={task}
          answer={answer}
          isChecked={isChecked}
          correctOptionId={correctOptionId}
          onAnswer={onAnswer}
        />
      ) : (
        <ShortTextForm task={task} answer={answer} onAnswer={onAnswer} />
      )}

      {!isChecked && (
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={onCheck}
            disabled={!hasAnswer}
            style={{
              padding: "0.5rem 1rem",
              cursor: hasAnswer ? "pointer" : "not-allowed",
            }}
          >
            Проверить
          </button>
        </div>
      )}

      {isChecked && <Feedback isCorrect={isCorrect} />}
    </section>
  );
}
