import type { LogEntry } from "../api/http";

interface RequestLogProps {
  readonly entries: readonly LogEntry[];
  readonly onClear: () => void;
}

function getStatusColor(status: number | "error" | "pending"): string {
  if (status === "pending") return "#ff9800";
  if (status === "error") return "#c62828";
  if (status >= 200 && status < 300) return "#4caf50";
  if (status >= 400) return "#c62828";
  return "#888";
}

function getMethodColor(method: string): string {
  switch (method) {
    case "GET":
      return "#2196f3";
    case "POST":
      return "#4caf50";
    case "PUT":
      return "#ff9800";
    case "DELETE":
      return "#c62828";
    default:
      return "#888";
  }
}

export function RequestLog({ entries, onClear }: RequestLogProps) {
  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "4px",
          textAlign: "center",
          color: "#888",
        }}
      >
        Запросы к API ещё не выполнялись
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Лог запросов к API ({entries.length})</h3>
        <button
          onClick={onClear}
          style={{ padding: "0.25rem 0.5rem", fontSize: "0.9em" }}
        >
          Очистить
        </button>
      </div>
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85em",
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "0.5rem", textAlign: "left" }}>Время</th>
              <th style={{ padding: "0.5rem", textAlign: "left" }}>Метод</th>
              <th style={{ padding: "0.5rem", textAlign: "left" }}>URL</th>
              <th style={{ padding: "0.5rem", textAlign: "left" }}>Статус</th>
              <th style={{ padding: "0.5rem", textAlign: "right" }}>мс</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                style={{
                  borderBottom: "1px solid #eee",
                  background:
                    entry.status === "error" ? "#fff5f5" : "transparent",
                }}
              >
                <td style={{ padding: "0.5rem" }}>{entry.timestamp}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      color: getMethodColor(entry.method),
                      fontWeight: "bold",
                    }}
                  >
                    {entry.method}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    fontFamily: "monospace",
                    fontSize: "0.9em",
                    wordBreak: "break-all",
                  }}
                >
                  {entry.url.replace("http://localhost:3001/api", "")}
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <span
                    style={{
                      color: getStatusColor(entry.status),
                      fontWeight: "bold",
                    }}
                  >
                    {entry.status}
                  </span>
                  {entry.error && (
                    <div
                      style={{
                        fontSize: "0.8em",
                        color: "#c62828",
                        marginTop: "0.25rem",
                      }}
                      title={entry.error}
                    >
                      {entry.error.length > 50
                        ? entry.error.slice(0, 50) + "..."
                        : entry.error}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    textAlign: "right",
                    fontFamily: "monospace",
                  }}
                >
                  {entry.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
