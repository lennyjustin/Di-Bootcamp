import { useState } from 'react';
import { connect } from 'react-redux';
import { addTask, editTask } from './redux/actions.js';
import DateNavigator from './components/DateNavigator.jsx';
import TaskList from './components/TaskList.jsx';

function TaskDialog({ date, task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [time, setTime] = useState(task?.time ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Give your task a name before saving.');
      return;
    }

    onSave({
      date,
      id: task?.id,
      details: { title: cleanTitle, time, notes: notes.trim() },
    });
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
              {task ? 'MAKE IT YOURS' : 'ADD TO YOUR DAY'}
            </span>
            <h2 id="dialog-title">{task ? 'Edit task' : 'New task'}</h2>
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

function App({ selectedDate, addTask, editTask }) {
  const [dialogTask, setDialogTask] = useState(undefined);

  function handleSave({ date, id, details }) {
    if (id) {
      editTask(date, id, details);
    } else {
      addTask(date, details);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Daymark home">
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3v3m10-3v3M4.5 9h15M6 5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 6 5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m8.5 14 2 2 5-5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>daymark</span>
        </a>
        <span className="topbar-caption">Make room for what matters.</span>
      </header>

      <section className="welcome">
        <div>
          <span className="section-kicker">
            <span className="kicker-dot" />
            YOUR DAILY PLANNER
          </span>
          <h1>A day, at a time.</h1>
          <p>Make a little plan. Leave a little room.</p>
        </div>
        <div className="welcome-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="planner-card" aria-label="Daily planner">
        <DateNavigator />
        <div className="day-divider" />
        <TaskList onAdd={() => setDialogTask(null)} onEdit={setDialogTask} />
      </section>

      <footer className="app-footer">
        <span>One thoughtful day at a time.</span>
        <span className="footer-status">
          <span className="status-dot" />
          Your plans are saved on this device
        </span>
      </footer>

      {dialogTask !== undefined && (
        <TaskDialog
          date={dialogTask?.date ?? selectedDate}
          task={dialogTask?.task}
          onSave={handleSave}
          onClose={() => setDialogTask(undefined)}
        />
      )}
    </main>
  );
}

const mapStateToProps = (state) => ({
  selectedDate: state.selectedDate,
});

const mapDispatchToProps = { addTask, editTask };

export default connect(mapStateToProps, mapDispatchToProps)(App);
