import type { Task, Answer } from "./domain";

interface TaskListProps {
  readonly tasks: readonly Task[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly userAnswers: Record<string, Answer>;
  readonly checked: Record<string, boolean>;
}

type Status = "idle" | "answered" | "checked";

function getStatus(
  taskId: string,
  userAnswers: Record<string, Answer>,
  checked: Record<string, boolean>,
): Status {
  if (checked[taskId]) return "checked";
  if (userAnswers[taskId]) return "answered";
  return "idle";
}

const statusStyles: Record<Status, { bg: string; label: string }> = {
  idle: { bg: "#ffffff", label: "" },
  answered: { bg: "#fff8e1", label: " • ответ" },
  checked: { bg: "#e8f5e9", label: " • проверено" },
};

export function TaskList({
  tasks,
  selectedId,
  onSelect,
  userAnswers,
  checked,
}: TaskListProps) {
  if (tasks.length === 0) return null;

  return (
    <nav aria-label="Список заданий">
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {tasks.map((task) => {
          const status = getStatus(task.id, userAnswers, checked);
          const isSelected = task.id === selectedId;
          const { bg, label } = statusStyles[status];
          return (
            <li key={task.id}>
              <button
                onClick={() => onSelect(task.id)}
                aria-current={isSelected ? "true" : undefined}
                style={{
                  padding: "0.5rem 1rem",
                  fontWeight: isSelected ? "bold" : "normal",
                  cursor: "pointer",
                  border: isSelected ? "2px solid #1976d2" : "1px solid #888",
                  borderRadius: "4px",
                  background: isSelected ? "#e0e7ff" : bg,
                }}
              >
                {task.id}
                <span style={{ fontSize: "0.8em", opacity: 0.7 }}>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}