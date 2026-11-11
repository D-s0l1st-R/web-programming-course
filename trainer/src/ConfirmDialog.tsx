import type { Task } from "./domain";

interface ConfirmDialogProps {
  readonly missing: readonly Task[];
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmDialog({
  missing,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          maxWidth: "480px",
          width: "90%",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Не все задания заполнены</h3>
        <p>Остались пропущенные задания:</p>
        <ul style={{ paddingLeft: "1.5rem" }}>
          {missing.map((t) => (
            <li key={t.id}>
              {t.id} — {t.topic}
            </li>
          ))}
        </ul>
        <p>Завершить попытку всё равно?</p>
        <div
          style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
        >
          <button onClick={onCancel} style={{ padding: "0.5rem 1rem" }}>
            Отмена
          </button>
          <button onClick={onConfirm} style={{ padding: "0.5rem 1rem" }}>
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}
