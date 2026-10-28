import type { SingleChoiceTask, Answer } from "./domain";

interface SingleChoiceFormProps {
  readonly task: SingleChoiceTask;
  readonly answer: Answer | undefined;
  readonly isChecked: boolean;
  readonly correctOptionId: string | undefined;
  readonly onAnswer: (answer: Answer) => void;
}

export function SingleChoiceForm({
  task,
  answer,
  isChecked,
  correctOptionId,
  onAnswer,
}: SingleChoiceFormProps) {
  const selectedId =
    answer && answer.kind === "single-choice" ? answer.optionId : undefined;

  return (
    <fieldset style={{ border: "none", padding: 0, margin: "1rem 0" }}>
      <legend style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
        Выберите один вариант:
      </legend>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {task.options.map((opt) => {
          const isSelected = opt.id === selectedId;
          const isCorrectOpt = isChecked && opt.id === correctOptionId;
          const isWrongSelected =
            isChecked && isSelected && opt.id !== correctOptionId;

          let background = "#ffffff";
          let border = "1px solid #888";
          if (isSelected && !isChecked) {
            background = "#e3f2fd";
            border = "2px solid #1976d2";
          } else if (isCorrectOpt) {
            background = "#c8e6c9";
            border = "2px solid #2e7d32";
          } else if (isWrongSelected) {
            background = "#ffcdd2";
            border = "2px solid #c62828";
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() =>
                onAnswer({
                  kind: "single-choice",
                  taskId: task.id,
                  optionId: opt.id,
                })
              }
              aria-pressed={isSelected}
              style={{
                padding: "0.5rem 1rem",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "4px",
                background,
                border,
                fontWeight: isSelected ? "bold" : "normal",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
