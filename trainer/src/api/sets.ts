import type { TrainingSet } from "../model/domain";
import { API_BASE, request } from "./http";

// Проверка доступности сервера (без fault-injection, иначе сама себя сломает)
export async function pingServer(): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/sets`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      return { ok: true, message: `Сервер отвечает (HTTP ${response.status})` };
    }
    return { ok: false, message: `Ошибка HTTP ${response.status}` };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Сервер недоступен",
    };
  }
}

export async function fetchSet(id: string): Promise<TrainingSet> {
  return request<TrainingSet>(`${API_BASE}/sets/${id}`);
}
