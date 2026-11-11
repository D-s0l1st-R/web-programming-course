import type { Task, Answer } from "./domain";

interface ReviewProps {
  readonly tasks: readonly Task[];
  readonly answers: readonly Answer[];
}

export function Review({ tasks, answers }: ReviewProps) {
  return (
    <section style={{ marginTop: "1rem" }}>
      <h2>Ваши ответы</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => {
          const answer = answers.find((a) => a.taskId === task.id);
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
              }}
            >
              <strong>{task.id}</strong> — {task.topic}
              <div style={{ marginTop: "0.25rem" }}>{task.prompt}</div>
              <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                {display}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
