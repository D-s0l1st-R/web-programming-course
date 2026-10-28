import { useState, useEffect } from "react";
import type { ShortTextTask, Answer } from "./domain";

interface ShortTextFormProps {
  readonly task: ShortTextTask;
  readonly answer: Answer | undefined;
  readonly onAnswer: (answer: Answer) => void;
}

export function ShortTextForm({ task, answer, onAnswer }: ShortTextFormProps) {
  const savedText = answer && answer.kind === "short-text" ? answer.text : "";
  const [text, setText] = useState(savedText);

  useEffect(() => {
    setText(savedText);
  }, [task.id, savedText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    onAnswer({ kind: "short-text", taskId: task.id, text: value });
  };

  return (
    <div style={{ margin: "1rem 0" }}>
      <label
        htmlFor={`answer-${task.id}`}
        style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}
      >
        Ваш ответ:
      </label>
      <textarea
        id={`answer-${task.id}`}
        value={text}
        onChange={handleChange}
        rows={3}
        style={{
          width: "100%",
          padding: "0.5rem",
          fontFamily: "inherit",
          fontSize: "1rem",
          boxSizing: "border-box",
        }}
        placeholder="Введите ответ..."
      />
    </div>
  );
}
