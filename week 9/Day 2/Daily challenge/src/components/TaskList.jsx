import { connect } from 'react-redux';
import { deleteTask } from '../redux/actions.js';
import { getLocalDateString } from '../redux/reducer.js';

function formatSelectedDay(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = getLocalDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let relative = '';
  if (dateString === today) {
    relative = 'Today';
  } else if (dateString === getLocalDateString(tomorrow)) {
    relative = 'Tomorrow';
  }

  const longDate = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return relative ? `${relative} · ${longDate}` : longDate;
}

function formatTime(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hours, minutes));
}

function TaskList({ date, tasks, onAdd, onEdit, deleteTask }) {
  return (
    <section className="task-section" aria-labelledby="task-list-title">
      <div className="task-section-heading">
        <div>
          <span className="section-kicker">YOUR PLAN</span>
          <h2 id="task-list-title">{formatSelectedDay(date)}</h2>
          <p className="task-summary">
            {tasks.length === 0
              ? 'A blank page is full of possibility.'
              : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} planned`}
          </p>
        </div>
        <button className="button button-primary add-task-button" type="button" onClick={onAdd}>
          <span aria-hidden="true">+</span>
          Add a task
        </button>
      </div>

      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map((task, index) => (
            <li className="task-row" key={task.id}>
              <span className="task-order" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="task-main">
                <span className="task-name">{task.title}</span>
                {task.notes && <span className="task-notes">{task.notes}</span>}
              </div>
              {task.time && (
                <span className="task-time">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle
                      cx="8"
                      cy="8"
                      r="5.7"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M8 4.8V8l2.1 1.3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {formatTime(task.time)}
                </span>
              )}
              <div className="task-actions">
                <button
                  className="icon-button task-action"
                  type="button"
                  aria-label={`Edit ${task.title}`}
                  onClick={() => onEdit({ date, task })}
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
                <button
                  className="icon-button task-action delete-action"
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => deleteTask(date, task.id)}
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M4.5 6h11m-9.7 0 .6 9.2c.1.8.7 1.3 1.5 1.3h4.2c.8 0 1.4-.5 1.5-1.3l.6-9.2M8 6V4.5h4V6m-3.5 3v4m3-4v4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-art" aria-hidden="true">
            <svg viewBox="0 0 56 56" fill="none">
              <rect
                x="9"
                y="12"
                width="38"
                height="35"
                rx="7"
                fill="#F1F4EF"
                stroke="#E2E9DF"
              />
              <path
                d="M18 9v8m20-8v8M10 22h36"
                stroke="#7E957C"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 32h6m-6 7h16"
                stroke="#A4B3A0"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="37" cy="32" r="4" fill="#D5E0D1" />
            </svg>
          </span>
          <h3>Nothing on the agenda.</h3>
          <p>Give this day a little shape by adding a task.</p>
          <button className="empty-add-button" type="button" onClick={onAdd}>
            Add your first task <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </section>
  );
}

const mapStateToProps = (state) => ({
  date: state.selectedDate,
  tasks: state.tasksByDay[state.selectedDate] ?? [],
});

export { TaskList };
export default connect(mapStateToProps, { deleteTask })(TaskList);
