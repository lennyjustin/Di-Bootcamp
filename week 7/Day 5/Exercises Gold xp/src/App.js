import Forms from './Components/Forms.js';

function App() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">React fundamentals · XP Gold</p>
        <h1>Forms that respond</h1>
        <p className="intro">
          Explore controlled inputs, conditional rendering, validation, and form submission.
        </p>
      </header>
      <Forms />
    </main>
  );
}

export default App;