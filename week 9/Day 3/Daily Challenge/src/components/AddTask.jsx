import { useState } from 'react';
import { useSelector } from 'react-redux';
import TaskForm from './TaskForm.jsx';

export default function AddTask() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = useSelector((state) => state.selectedDate);

  return (
    <>
      <button
        className="button button-primary add-task-button"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true">+</span>
        Add a task
      </button>
      {isOpen && (
        <TaskForm date={selectedDate} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
