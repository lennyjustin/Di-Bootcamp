import Calendar from './components/Calendar.jsx';
import TaskList from './components/TaskList.jsx';

export default function App() {
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
        <Calendar />
        <div className="day-divider" />
        <TaskList />
      </section>

      <footer className="app-footer">
        <span>One thoughtful day at a time.</span>
        <span className="footer-status">
          <span className="status-dot" />
          Plans stay organized by day
        </span>
      </footer>
    </main>
  );
}
