export type SimulatedError =
  | "none"
  | "network"
  | "timeout"
  | "malformed"
  | "400"
  | "401"
  | "403"
  | "404"
  | "409"
  | "422"
  | "429"
  | "500"
  | "502"
  | "503"
  | "504";

export const FAULT_STORAGE_KEY = "trainer-fault";

export type FaultScope = "all" | "write" | "read";

export interface FaultConfig {
  // Код ошибки: "none" = отключено, иначе — HTTP-код или "network"/"timeout"/"malformed"
  kind: SimulatedError;
  // Область применения: all — все запросы, write — только POST/PUT/DELETE
  scope: FaultScope;
  // Применить один раз и автоматически отключить
  failOnce: boolean;
}

export const DEFAULT_FAULT: FaultConfig = {
  kind: "none",
  scope: "all",
  failOnce: false,
};

const VALID_KINDS: readonly SimulatedError[] = [
  "none",
  "network",
  "timeout",
  "malformed",
  "400",
  "401",
  "403",
  "404",
  "409",
  "422",
  "429",
  "500",
  "502",
  "503",
  "504",
];

// Локальное состояние модуля (считывается из localStorage при импорте)
let config: FaultConfig = loadFault();

// Подписчики — чтобы React-интерфейс узнавал об изменениях
type Listener = (cfg: FaultConfig) => void;
const listeners = new Set<Listener>();

export function subscribeFault(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFault(): FaultConfig {
  return config;
}

export function setFault(next: FaultConfig): void {
  config = next;
  persistFault(next);
  listeners.forEach((listener) => listener(next));
}

// Проверяет, нужно ли симулировать ошибку для данного запроса
export function applyFault(method: string): Response | "skip" | never {
  const fault = config;
  if (fault.kind === "none") return "skip";

  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (fault.scope === "write" && !isWrite) return "skip";
  if (fault.scope === "read" && isWrite) return "skip";

  // Симуляция ошибки один раз — затем автоотключение
  if (fault.failOnce) {
    setFault({ ...DEFAULT_FAULT });
  }

  if (fault.kind === "network") {
    throw new TypeError("Failed to fetch (simulated)");
  }
  if (fault.kind === "timeout") {
    const err = new Error("TimeoutError (simulated)");
    (err as Error & { name: string }).name = "TimeoutError";
    throw err;
  }
  if (fault.kind === "malformed") {
    return new Response("{ not valid json", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const status = parseInt(fault.kind, 10);
  return new Response(`Simulated error ${status}`, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

function loadFault(): FaultConfig {
  try {
    const raw = localStorage.getItem(FAULT_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FAULT };
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const kind = VALID_KINDS.includes(parsed.kind as SimulatedError)
      ? (parsed.kind as SimulatedError)
      : "none";
    const scope: FaultScope =
      parsed.scope === "write" || parsed.scope === "read"
        ? parsed.scope
        : "all";
    const failOnce = parsed.failOnce === true;
    return { kind, scope, failOnce };
  } catch {
    return { ...DEFAULT_FAULT };
  }
}

function persistFault(cfg: FaultConfig): void {
  try {
    localStorage.setItem(FAULT_STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    // ignore
  }
}
