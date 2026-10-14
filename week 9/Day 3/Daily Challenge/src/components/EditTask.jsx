import { useState } from 'react';
import TaskForm from './TaskForm.jsx';

export default function EditTask({ date, task }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="icon-button task-action"
        type="button"
        aria-label={`Edit ${task.title}`}
        onClick={() => setIsOpen(true)}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="m12.8 4.2 3 3M5 15l3-.7 8.6-8.6a1.4 1.4 0 0 0-2-2L6 12.3 5 15Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen && (
        <TaskForm
          date={date}
          task={task}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
