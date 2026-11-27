import { useState, useEffect } from "react";
import { pingServer } from "../api/sets";

type Status = "unknown" | "checking" | "online" | "offline";

export function ServerStatus() {
  const [status, setStatus] = useState<Status>("unknown");
  const [message, setMessage] = useState("");

  const check = async () => {
    setStatus("checking");
    setMessage("Проверка...");
    const result = await pingServer();
    setStatus(result.ok ? "online" : "offline");
    setMessage(result.message);
  };

  useEffect(() => {
    check();
  }, []);

  const colors = {
    unknown: "#888",
    checking: "#ff9800",
    online: "#4caf50",
    offline: "#c62828",
  };

  return (
    <div
      style={{
        padding: "0.75rem",
        background: "#f5f5f5",
        border: `1px solid ${colors[status]}`,
        borderRadius: "4px",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: colors[status],
            display: "inline-block",
          }}
        />
        <strong>
          {status === "unknown" && "Статус неизвестен"}
          {status === "checking" && "Проверка..."}
          {status === "online" && "Сервер подключён"}
          {status === "offline" && "Сервер недоступен"}
        </strong>
      </div>
      {message && (
        <span style={{ fontSize: "0.9em", color: "#555" }}>{message}</span>
      )}
      <button
        onClick={check}
        disabled={status === "checking"}
        style={{
          padding: "0.25rem 0.5rem",
          marginLeft: "auto",
          cursor: status === "checking" ? "not-allowed" : "pointer",
        }}
      >
        {status === "checking" ? "..." : "Проверить"}
      </button>
    </div>
  );
}
