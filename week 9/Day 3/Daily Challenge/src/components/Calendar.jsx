import { useSelector, useDispatch } from 'react-redux';
import {
  getLocalDateString,
  setSelectedDate,
} from '../features/planner/plannerSlice.js';

function shiftDate(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getLocalDateString(date);
}

function getWeek(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const monday = new Date(year, month - 1, day);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateKey = getLocalDateString(date);
    return {
      date: dateKey,
      weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      dayNumber: date.getDate(),
    };
  });
}

function formatMonth(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export default function Calendar() {
  const dispatch = useDispatch();
  const selectedDate = useSelector((state) => state.selectedDate);
  const tasksByDay = useSelector((state) => state.tasksByDay);
  const week = getWeek(selectedDate);
  const today = getLocalDateString();

  return (
    <section className="calendar" aria-label="Choose a day">
      <div className="calendar-heading">
        <div>
          <span className="section-kicker">YOUR CALENDAR</span>
          <h2>{formatMonth(selectedDate)}</h2>
        </div>
        <div className="calendar-controls">
          <button
            className="button button-quiet today-button"
            type="button"
            onClick={() => dispatch(setSelectedDate(today))}
          >
            Today
          </button>
          <label className="date-picker">
            <span className="sr-only">Choose a date</span>
            <input
              aria-label="Choose a date"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) {
                  dispatch(setSelectedDate(event.target.value));
                }
              }}
            />
          </label>
          <button
            className="icon-button"
            type="button"
            aria-label="Previous week"
            onClick={() => dispatch(setSelectedDate(shiftDate(selectedDate, -7)))}
          >
            ‹
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Next week"
            onClick={() => dispatch(setSelectedDate(shiftDate(selectedDate, 7)))}
          >
            ›
          </button>
        </div>
      </div>
      <div className="week-strip">
        {week.map((day) => {
          const selected = day.date === selectedDate;
          const hasTasks = (tasksByDay[day.date]?.length ?? 0) > 0;
          return (
            <button
              className={`day-button${selected ? ' is-selected' : ''}${day.date === today ? ' is-today' : ''}`}
              type="button"
              key={day.date}
              aria-pressed={selected}
              aria-label={`${day.weekday}, ${day.date}${hasTasks ? ', has tasks' : ''}`}
              onClick={() => dispatch(setSelectedDate(day.date))}
            >
              <span className="day-name">{day.weekday}</span>
              <span className="day-number">{day.dayNumber}</span>
              <span className={`day-indicator${hasTasks ? ' has-tasks' : ''}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
