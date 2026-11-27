import type { Task, Answer } from "../model/domain";
import { getAnswer, isAnswered } from "../model/attempt";

interface TaskListProps {
  readonly tasks: readonly Task[];
  readonly currentIndex: number;
  readonly answers: readonly Answer[];
  readonly onSelect: (index: number) => void;
}

export function TaskList({
  tasks,
  currentIndex,
  answers,
  onSelect,
}: TaskListProps) {
  return (
    <nav aria-label="Список заданий" style={{ marginTop: "1rem" }}>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {tasks.map((task, index) => {
          const isCurrent = index === currentIndex;
          const filled = isAnswered(getAnswer(answers, task.id));
          return (
            <li key={task.id}>
              <button
                onClick={() => onSelect(index)}
                aria-current={isCurrent ? "true" : undefined}
                style={{
                  padding: "0.5rem 1rem",
                  fontWeight: isCurrent ? "bold" : "normal",
                  cursor: "pointer",
                  border: isCurrent ? "2px solid #1976d2" : "1px solid #888",
                  borderRadius: "4px",
                  background: isCurrent
                    ? "#e0e7ff"
                    : filled
                      ? "#e8f5e9"
                      : "#ffffff",
                }}
              >
                {task.id}
                {filled && " ✓"}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
