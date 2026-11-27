interface NetworkStatusProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function NetworkStatus({ message, onRetry }: NetworkStatusProps) {
  return (
    <div
      role="alert"
      style={{
        padding: "0.75rem",
        background: "#ffebee",
        border: "1px solid #c62828",
        borderRadius: "4px",
        marginBottom: "1rem",
        color: "#c62828",
      }}
    >
      <strong>Ошибка сети:</strong> {message}
      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={onRetry} style={{ padding: "0.25rem 0.5rem" }}>
          Повторить
        </button>
      </div>
    </div>
  );
}
