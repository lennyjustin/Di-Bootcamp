import { connect } from 'react-redux';
import { setSelectedDate } from '../redux/actions.js';
import { getLocalDateString } from '../redux/reducer.js';

function shiftDate(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getLocalDateString(date);
}

function getWeek(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const mondayOffset = (selected.getDay() + 6) % 7;
  selected.setDate(selected.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const dayDate = new Date(selected);
    dayDate.setDate(selected.getDate() + index);
    return {
      date: getLocalDateString(dayDate),
      weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(dayDate),
      dayNumber: dayDate.getDate(),
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

function DateNavigator({ selectedDate, setSelectedDate }) {
  const today = getLocalDateString();
  const week = getWeek(selectedDate);

  return (
    <div className="date-navigator">
      <div className="calendar-heading">
        <div className="month-heading">
          <span className="calendar-symbol" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <rect
                x="3"
                y="4.5"
                width="14"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M6.5 3v3M13.5 3v3M3 8h14"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h2>{formatMonth(selectedDate)}</h2>
        </div>
        <div className="date-controls">
          <button
            className="today-button"
            type="button"
            onClick={() => setSelectedDate(today)}
          >
            Today
          </button>
          <label className="date-input-wrap">
            <span className="sr-only">Choose a date</span>
            <input
              aria-label="Choose a date"
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) setSelectedDate(event.target.value);
              }}
            />
          </label>
          <button
            className="icon-button"
            type="button"
            aria-label="Previous week"
            onClick={() => setSelectedDate(shiftDate(selectedDate, -7))}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="m12 4-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Next week"
            onClick={() => setSelectedDate(shiftDate(selectedDate, 7))}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="m8 4 6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="week-strip" aria-label="Choose a day">
        {week.map((day) => {
          const selected = day.date === selectedDate;
          return (
            <button
              className={`day-button${selected ? ' is-selected' : ''}${day.date === today ? ' is-today' : ''}`}
              type="button"
              key={day.date}
              aria-pressed={selected}
              aria-label={`${day.weekday}, ${day.date}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <span className="day-name">{day.weekday}</span>
              <span className="day-number">{day.dayNumber}</span>
              <span className="day-indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  selectedDate: state.selectedDate,
});

export { DateNavigator };
export default connect(mapStateToProps, { setSelectedDate })(DateNavigator);
