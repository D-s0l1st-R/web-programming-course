interface FeedbackProps {
  readonly isCorrect: boolean;
}

export function Feedback({ isCorrect }: FeedbackProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        marginTop: "1rem",
        padding: "0.75rem 1rem",
        borderRadius: "4px",
        background: isCorrect ? "#e8f5e9" : "#ffebee",
        color: isCorrect ? "#2e7d32" : "#c62828",
        border: `1px solid ${isCorrect ? "#2e7d32" : "#c62828"}`,
      }}
    >
      {isCorrect ? "✓ Верно!" : "✗ Неверно. Попробуйте ещё раз."}
    </div>
  );
}