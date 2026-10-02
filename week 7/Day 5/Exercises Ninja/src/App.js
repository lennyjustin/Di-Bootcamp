import { useState } from 'react';
import Clock from './Components/Clock.js';
import Form from './Components/Form.js';

function App() {
  const [isClockVisible, setIsClockVisible] = useState(true);

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">React fundamentals · XP Ninja</p>
        <h1>Live time, better forms</h1>
        <p className="intro">A ticking local clock and a form with custom validation.</p>
      </header>

      <section className="clock-panel">
        <div className="clock-copy">
          <p className="panel-kicker">Your local time</p>
          <h2>Right now</h2>
        </div>
        {isClockVisible ? (
          <Clock />
        ) : (
          <p className="clock-paused">Clock unmounted. Its interval has been cleared.</p>
        )}
        <button
          aria-pressed={isClockVisible}
          className="button button-quiet"
          onClick={() => setIsClockVisible((visible) => !visible)}
          type="button"
        >
          {isClockVisible ? 'Unmount clock' : 'Show clock again'}
        </button>
      </section>

      <Form />
    </main>
  );
}

export default App;