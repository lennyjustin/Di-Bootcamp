import { useSelector } from 'react-redux';
import AddTask from './AddTask.jsx';
import DeleteTask from './DeleteTask.jsx';
import EditTask from './EditTask.jsx';

const EMPTY_TASKS = [];

function formatSelectedDay(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  let relative = '';
  if (dateString === todayString) {
    relative = 'Today';
  } else {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, '0'),
      String(tomorrow.getDate()).padStart(2, '0'),
    ].join('-');
    if (dateString === tomorrowString) relative = 'Tomorrow';
  }

  const longDate = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
  return relative ? `${relative} · ${longDate}` : longDate;
}

function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hours, minutes));
}

export default function TaskList() {
  const selectedDate = useSelector((state) => state.selectedDate);
  const tasks = useSelector(
    (state) => state.tasksByDay[state.selectedDate] ?? EMPTY_TASKS,
  );

  return (
    <section className="task-section" aria-labelledby="task-list-title">
      <div className="task-section-heading">
        <div>
          <span className="section-kicker">YOUR PLAN</span>
          <h2 id="task-list-title">{formatSelectedDay(selectedDate)}</h2>
          <p className="task-summary">
            {tasks.length === 0
              ? 'A blank page is full of possibility.'
              : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} planned`}
          </p>
        </div>
        <AddTask />
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
                <time className="task-time" dateTime={task.time}>
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
                </time>
              )}
              <div className="task-actions">
                <EditTask date={selectedDate} task={task} />
                <DeleteTask date={selectedDate} task={task} />
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
          <AddTask />
        </div>
      )}
    </section>
  );
}
