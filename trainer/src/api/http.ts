import { applyFault } from "./fault";

export const API_BASE = "http://localhost:3001/api";

// ↓ Добавлено: тип для логирования запросов
export interface LogEntry {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status: number | "error" | "pending";
  duration: number;
  error?: string;
}

// ↓ Добавлено: тип ошибки по диапазону HTTP-статуса
export type HttpErrorKind = "client" | "server";

// ↓ Добавлено: ошибка с информацией о HTTP-статусе и его категории
export class HttpError extends Error {
  readonly status: number;
  readonly kind: HttpErrorKind;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.kind = status >= 500 ? "server" : "client";
  }
}

// Пояснение к HTTP-статусу для пользователя
const CLIENT_ERROR_MESSAGES: Record<number, string> = {
  400: "некорректный запрос",
  401: "требуется авторизация",
  403: "доступ запрещён",
  404: "ресурс не найден",
  409: "конфликт состояния",
  422: "данные не прошли проверку",
  429: "слишком много запросов",
};

const SERVER_ERROR_MESSAGES: Record<number, string> = {
  500: "внутренняя ошибка сервера",
  502: "неверный ответ вышестоящего сервиса",
  503: "сервер временно недоступен",
  504: "превышено время ожидания сервера",
};

function describeHttpError(status: number): string {
  if (status >= 500) {
    const known = SERVER_ERROR_MESSAGES[status] ?? "ошибка сервера";
    return `Ошибка сервера (HTTP ${status}): ${known}`;
  }
  const known = CLIENT_ERROR_MESSAGES[status] ?? "ошибка запроса";
  return `Ошибка клиента (HTTP ${status}): ${known}`;
}

// Пояснение к ошибке запроса с учётом категории HTTP-статуса
export function describeError(error: unknown, fallback: string): string {
  if (error instanceof HttpError) {
    return error.kind === "server"
      ? `${error.message} Попробуйте повторить позже.`
      : error.message;
  }
  if (error instanceof Error) {
    if (error.name === "TimeoutError") {
      return "Превышено время ожидания ответа сервера. Попробуйте повторить позже.";
    }
    if (error.name === "TypeError") {
      return "Не удалось подключиться к серверу. Проверьте, запущен ли сервер.";
    }
    return error.message;
  }
  return fallback;
}

async function handleResponse<T>(response: Response): Promise<T> {
  // 2xx — успех; всё остальное — ошибка с категорией 4xx/5xx
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const base = describeHttpError(response.status);
    throw new HttpError(
      response.status,
      detail ? `${base}. Ответ сервера: ${detail}` : base,
    );
  }
  // 204 No Content — успешный ответ без тела
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// Обёртка над fetch: проверяет fault-injection перед запросом
export async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const fault = applyFault(method);
  if (fault === "skip") {
    const response = await fetch(url, init);
    return handleResponse<T>(response);
  }
  return handleResponse<T>(fault);
}
