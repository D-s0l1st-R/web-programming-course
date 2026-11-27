import type { Answer, Attempt, AttemptResult } from "../model/domain";
import { API_BASE, request } from "./http";

export async function createAttempt(setId: string): Promise<Attempt> {
  return request<Attempt>(`${API_BASE}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ setId }),
  });
}

export async function saveAnswer(
  attemptId: string,
  answer: Answer,
): Promise<Answer> {
  return request<Answer>(
    `${API_BASE}/attempts/${attemptId}/answers/${answer.taskId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answer),
    },
  );
}

export async function deleteAnswer(
  attemptId: string,
  taskId: string,
): Promise<void> {
  return request<void>(`${API_BASE}/attempts/${attemptId}/answers/${taskId}`, {
    method: "DELETE",
  });
}

// ↓ Исправлено: POST /submit возвращает Result, а не пустое тело
export async function submitAttempt(attemptId: string): Promise<AttemptResult> {
  return request<AttemptResult>(`${API_BASE}/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

export async function fetchResult(attemptId: string): Promise<AttemptResult> {
  return request<AttemptResult>(`${API_BASE}/attempts/${attemptId}/result`);
}

export async function fetchAttempt(attemptId: string): Promise<Attempt> {
  return request<Attempt>(`${API_BASE}/attempts/${attemptId}`);
}
