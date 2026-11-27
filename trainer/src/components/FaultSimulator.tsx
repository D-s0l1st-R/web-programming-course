import type { SimulatedError, FaultScope, FaultConfig } from "../api/fault";

interface FaultSimulatorProps {
  readonly config: FaultConfig;
  readonly onChange: (next: FaultConfig) => void;
}

const ERROR_CODES: { value: SimulatedError; label: string }[] = [
  { value: "none", label: "Отключено" },
  { value: "network", label: "Network error (TypeError)" },
  { value: "timeout", label: "Timeout (TimeoutError)" },
  { value: "malformed", label: "200 OK с битым JSON" },
  { value: "400", label: "400 — некорректный запрос" },
  { value: "401", label: "401 — требуется авторизация" },
  { value: "403", label: "403 — доступ запрещён" },
  { value: "404", label: "404 — ресурс не найден" },
  { value: "409", label: "409 — конфликт состояния" },
  { value: "422", label: "422 — данные не прошли проверку" },
  { value: "429", label: "429 — слишком много запросов" },
  { value: "500", label: "500 — внутренняя ошибка сервера" },
  { value: "502", label: "502 — неверный ответ вышестоящего сервиса" },
  { value: "503", label: "503 — сервер временно недоступен" },
  { value: "504", label: "504 — превышено время ожидания" },
];

const SCOPE_OPTIONS: { value: FaultScope; label: string }[] = [
  { value: "all", label: "Все запросы" },
  { value: "write", label: "Только запись (POST/PUT/DELETE)" },
  { value: "read", label: "Только чтение (GET)" },
];

// Панель fault-injection: позволяет вручную ломать ответы API,
// чтобы проверять обработку 4xx/5xx и сетевых ошибок в интерфейсе
export function FaultSimulator({ config, onChange }: FaultSimulatorProps) {
  const active = config.kind !== "none";

  return (
    <div
      style={{
        padding: "0.75rem",
        background: active ? "#fff8e1" : "#f5f5f5",
        border: `1px solid ${active ? "#ff9800" : "#bdbdbd"}`,
        borderRadius: "4px",
        marginBottom: "1rem",
        fontSize: "0.9em",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="checkbox"
          id="fault-toggle"
          checked={active}
          onChange={(e) =>
            onChange({
              ...config,
              kind: e.target.checked ? "500" : "none",
            })
          }
        />
        <label htmlFor="fault-toggle">
          <strong>Симуляция ошибок сервера</strong>
        </label>
        {active && (
          <span style={{ color: "#e65100", fontWeight: "bold" }}>включено</span>
        )}
      </div>

      {active && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "0.5rem",
            marginLeft: "1.5rem",
          }}
        >
          <label>
            Ошибка:{" "}
            <select
              value={config.kind}
              onChange={(e) =>
                onChange({ ...config, kind: e.target.value as SimulatedError })
              }
              style={{ padding: "0.2rem" }}
            >
              {ERROR_CODES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Область:{" "}
            <select
              value={config.scope}
              onChange={(e) =>
                onChange({ ...config, scope: e.target.value as FaultScope })
              }
              style={{ padding: "0.2rem" }}
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <input
              type="checkbox"
              checked={config.failOnce}
              onChange={(e) =>
                onChange({ ...config, failOnce: e.target.checked })
              }
            />
            Отключить после одного срабатывания
          </label>

          <button
            onClick={() =>
              onChange({ kind: "none", scope: "all", failOnce: false })
            }
            style={{ padding: "0.2rem 0.5rem", cursor: "pointer" }}
          >
            Выключить
          </button>
        </div>
      )}
    </div>
  );
}
