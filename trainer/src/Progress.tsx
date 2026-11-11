import type { Task } from "./domain";

interface ProgressProps {
  readonly answered: number;
  readonly total: number;
  readonly missing: readonly Task[];
}

export function Progress({ answered, total, missing }: ProgressProps) {
  return (
    <section
      style={{
        padding: "1rem",
        background: "#f9f9f9",
        borderRadius: "8px",
        marginTop: "1rem",
      }}
    >
      <p>
        <strong>Прогресс:</strong> {answered} из {total}
      </p>
      {missing.length > 0 && (
        <div>
          <strong>Не заполнено:</strong>
          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
            {missing.map((t) => (
              <li key={t.id}>
                {t.id} — {t.topic}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
