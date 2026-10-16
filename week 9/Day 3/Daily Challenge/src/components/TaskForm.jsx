import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addTask,
  editTask,
} from '../features/planner/plannerSlice.js';

export default function TaskForm({ date, task, onClose }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(task?.title ?? '');
  const [time, setTime] = useState(task?.time ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Enter a task name before saving.');
      return;
    }

    const details = { title: cleanTitle, time, notes: notes.trim() };
    if (task) {
      dispatch(editTask({ date, id: task.id, changes: details }));
    } else {
      dispatch(addTask({
        date,
        task: { id: crypto.randomUUID(), ...details },
      }));
    }
    onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <section
        className="task-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="section-kicker">
              {task ? 'UPDATE YOUR PLAN' : 'MAKE A LITTLE PLAN'}
            </span>
            <h2 id="dialog-title">{task ? 'Edit task' : 'Add a task'}</h2>
          </div>
          <button
            className="icon-button dialog-close"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="task-title">
            Task name <span className="required-mark">*</span>
          </label>
          <input
            id="task-title"
            autoFocus
            maxLength={120}
            placeholder="What would you like to get done?"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError('');
            }}
          />
          <label htmlFor="task-time">Time</label>
          <input
            id="task-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
          <label htmlFor="task-notes">Notes</label>
          <textarea
            id="task-notes"
            rows={3}
            maxLength={400}
            placeholder="Add a little more detail (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="button button-quiet"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              {task ? 'Save changes' : 'Add to planner'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
