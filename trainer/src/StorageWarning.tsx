interface StorageWarningProps {
  readonly error: string;
}

export function StorageWarning({ error }: StorageWarningProps) {
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
      <strong>Внимание:</strong> Не удалось сохранить черновик в localStorage.
      Ввод продолжается в памяти, но данные будут потеряны при перезагрузке.
      {error && <div style={{ marginTop: "0.5rem", fontSize: "0.9em" }}>{error}</div>}
    </div>
  );
}