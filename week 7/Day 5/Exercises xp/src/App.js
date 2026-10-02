import Car from './Components/Car.js';
import Events from './Components/Events.js';
import Phone from './Components/Phone.js';
import Color from './Components/Color.js';

const carinfo = { name: 'Ford', model: 'Mustang' };

function App() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">React fundamentals</p>
        <h1>Exercises XP</h1>
        <p className="intro">Components, state, events, and effects—try each example below.</p>
      </header>

      <div className="exercise-grid">
        <section className="exercise-card">
          <div className="card-heading">
            <span className="exercise-number">01</span>
            <div>
              <p className="card-kicker">Components &amp; state</p>
              <h2>Car and Garage</h2>
            </div>
          </div>
          <Car carInfo={carinfo} />
        </section>

        <section className="exercise-card">
          <div className="card-heading">
            <span className="exercise-number">02</span>
            <div>
              <p className="card-kicker">Event handlers</p>
              <h2>Events</h2>
            </div>
          </div>
          <Events />
        </section>

        <section className="exercise-card">
          <div className="card-heading">
            <span className="exercise-number">03</span>
            <div>
              <p className="card-kicker">Updating state</p>
              <h2>Phone</h2>
            </div>
          </div>
          <Phone />
        </section>

        <section className="exercise-card">
          <div className="card-heading">
            <span className="exercise-number">04</span>
            <div>
              <p className="card-kicker">Side effects</p>
              <h2>useEffect</h2>
            </div>
          </div>
          <Color />
        </section>
      </div>
    </main>
  );
}

export default App;