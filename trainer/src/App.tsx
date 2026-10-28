import { useState } from "react";
import { fullSet, findTask } from "./demo";
import { isCorrect, correctOptionIdFor } from "./answers";
import { TaskList } from "./TaskList";
import { TaskCard } from "./TaskCard";
import type { Answer } from "./domain";

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(
    fullSet.tasks.length > 0 ? fullSet.tasks[0].id : "",
  );
  const [userAnswers, setUserAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const selectedTask = selectedId ? findTask(fullSet, selectedId) : undefined;
  const currentAnswer = selectedId ? userAnswers[selectedId] : undefined;
  const isChecked = selectedId ? checked[selectedId] === true : false;
  const correct =
    isChecked && currentAnswer ? isCorrect(selectedId, currentAnswer) : false;
  const correctOptionId = selectedId
    ? correctOptionIdFor[selectedId]
    : undefined;

  const handleAnswer = (answer: Answer) => {
    if (!selectedId) return;
    setUserAnswers((prev) => ({ ...prev, [selectedId]: answer }));
  };

  const handleCheck = () => {
    if (!selectedId) return;
    setChecked((prev) => ({ ...prev, [selectedId]: true }));
  };

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "1rem",
        overflowWrap: "break-word",
      }}
    >
      <header>
        <h1>
          {fullSet.title}{" "}
          <span style={{ fontWeight: "normal", fontSize: "0.7em" }}>
            ({fullSet.tasks.length})
          </span>
        </h1>
      </header>

      <TaskList
        tasks={fullSet.tasks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        userAnswers={userAnswers}
        checked={checked}
      />

      <TaskCard
        task={selectedTask}
        answer={currentAnswer}
        isChecked={isChecked}
        isCorrect={correct}
        correctOptionId={correctOptionId}
        onAnswer={handleAnswer}
        onCheck={handleCheck}
      />
    </main>
  );
}
