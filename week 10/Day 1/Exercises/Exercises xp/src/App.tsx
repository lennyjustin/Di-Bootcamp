import { Counter } from './components/Counter'
import { Greeting } from './components/Greeting'
import { UserCard } from './components/UserCard'
import { UserList } from './components/UserList'
import './App.css'

function App() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">REACT + TYPESCRIPT · EXERCISES XP</p>
        <h1>Build with confidence.</h1>
        <p className="intro">
          Five small exercises for typed components, state, optional props, and
          fetching API data with effects.
        </p>
      </header>

      <div className="exercise-grid">
        <section aria-labelledby="greeting-title" className="exercise-card">
          <div className="card-heading">
            <span className="exercise-number">02</span>
            <div>
              <p className="eyebrow">TYPED PROPS</p>
              <h2 id="greeting-title">A warm welcome</h2>
            </div>
          </div>
          <Greeting name="Alex" messageCount={3} />
        </section>

        <section aria-labelledby="counter-title" className="exercise-card">
          <div className="card-heading">
            <span className="exercise-number">03</span>
            <div>
              <p className="eyebrow">TYPED STATE</p>
              <h2 id="counter-title">Counter</h2>
            </div>
          </div>
          <Counter />
        </section>

        <section
          aria-labelledby="user-card-title"
          className="exercise-card user-card-exercise"
        >
          <div className="card-heading">
            <span className="exercise-number">04</span>
            <div>
              <p className="eyebrow">OPTIONAL PROPS</p>
              <h2 id="user-card-title">User cards</h2>
            </div>
          </div>
          <div className="user-card-examples">
            <UserCard name="Sam Rivera" age={28} role="Designer" />
            <UserCard name="Taylor" />
          </div>
        </section>

        <section
          aria-labelledby="user-list-title"
          className="exercise-card user-list-exercise"
        >
          <div className="card-heading">
            <span className="exercise-number">05</span>
            <div>
              <p className="eyebrow">EFFECT + API</p>
              <h2 id="user-list-title">People directory</h2>
            </div>
          </div>
          <UserList />
        </section>
      </div>
      <footer className="page-footer">
        Exercise 01: This project was scaffolded with Vite’s React + TypeScript
        template.
      </footer>
    </main>
  )
}

export default App
