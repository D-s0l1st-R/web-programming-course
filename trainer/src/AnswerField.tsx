import type { Task, Answer } from "./domain";

interface AnswerFieldProps {
  readonly task: Task;
  readonly answer: Answer | undefined;
  readonly onAnswer: (answer: Answer) => void;
}

export function AnswerField({ task, answer, onAnswer }: AnswerFieldProps) {
  if (task.kind === "single-choice") {
    return (
      <fieldset style={{ border: "none", padding: 0, margin: "1rem 0" }}>
        <legend style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          Выберите один вариант:
        </legend>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {task.options.map((opt) => {
            const isChecked =
              answer?.kind === "single-choice" && answer.optionId === opt.id;
            return (
              <label
                key={opt.id}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="radio"
                  name={task.id}
                  value={opt.id}
                  checked={isChecked}
                  onChange={() =>
                    onAnswer({
                      kind: "single-choice",
                      taskId: task.id,
                      optionId: opt.id,
                    })
                  }
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const textValue = answer?.kind === "short-text" ? answer.text : "";

  return (
    <div style={{ margin: "1rem 0" }}>
      <label
        htmlFor={`answer-${task.id}`}
        style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}
      >
        Ваш ответ:
      </label>
      <textarea
        id={`answer-${task.id}`}
        value={textValue}
        onChange={(e) =>
          onAnswer({
            kind: "short-text",
            taskId: task.id,
            text: e.target.value,
          })
        }
        rows={3}
        style={{
          width: "100%",
          padding: "0.5rem",
          fontFamily: "inherit",
          fontSize: "1rem",
          boxSizing: "border-box",
        }}
        placeholder="Введите ответ..."
      />
    </div>
  );
}
