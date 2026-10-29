import { useDispatch, useSelector } from 'react-redux';
import { ageDownAsync, ageUpAsync } from './features/age/ageSlice.js';
import AgeControls from './features/age/AgeControls.jsx';
import AgeDisplay from './features/age/AgeDisplay.jsx';

export default function App() {
  const dispatch = useDispatch();
  const { age, loading } = useSelector((state) => state.age);

  function handleAgeChange(event) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value;

    if (action === 'up') {
      dispatch(ageUpAsync());
    } else if (action === 'down') {
      dispatch(ageDownAsync());
    }
  }

  return (
    <main className="page-shell">
      <header className="intro">
        <span className="eyebrow">A LITTLE OLDER, ONE STEP AT A TIME</span>
        <h1>Age Tracker</h1>
        <p>Every change takes a moment. Watch it happen.</p>
      </header>

      <section className="tracker-card" aria-label="Age tracker">
        <AgeDisplay age={age} loading={loading} />
        <AgeControls
          age={age}
          loading={loading}
          onSubmit={handleAgeChange}
        />
      </section>

      <footer className="page-footer">
        Powered by React and Redux Toolkit.
      </footer>
    </main>
  );
}