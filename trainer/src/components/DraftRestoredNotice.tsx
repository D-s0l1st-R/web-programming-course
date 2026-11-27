interface DraftRestoredNoticeProps {
  readonly onDismiss: () => void;
}

// Информационное уведомление: попытка восстановлена из локального черновика
export function DraftRestoredNotice({ onDismiss }: DraftRestoredNoticeProps) {
  return (
    <div
      role="status"
      style={{
        padding: "0.75rem",
        background: "#e3f2fd",
        border: "1px solid #1565c0",
        borderRadius: "4px",
        marginBottom: "1rem",
        color: "#0d47a1",
      }}
    >
      <strong>Черновик восстановлен:</strong> попытка продолжена из сохранённого
      в браузере черновика — ответы и текущая позиция не потеряны.
      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={onDismiss} style={{ padding: "0.25rem 0.5rem" }}>
          Понятно
        </button>
      </div>
    </div>
  );
}
