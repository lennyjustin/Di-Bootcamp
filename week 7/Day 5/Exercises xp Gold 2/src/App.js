import { useState } from 'react';
import BookForm from './Components/BookForm.js';
import UserDetailsForm from './Components/UserDetailsForm.js';

function App() {
  const [submittedBook, setSubmittedBook] = useState(null);

  const handleBookSubmit = (bookData) => {
    setSubmittedBook(bookData);
    console.log('Book form data:', bookData);
  };

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">React state · event handlers · forms</p>
        <h1>Forms in action</h1>
        <p className="intro">Collect book details, then preview a validated user profile.</p>
      </header>

      <div className="exercise-list">
        <section className="exercise-panel">
          <div className="panel-heading">
            <span className="step-number">01</span>
            <div>
              <p className="panel-kicker">Store and submit data</p>
              <h2>Add a book</h2>
            </div>
          </div>
          <BookForm onSubmit={handleBookSubmit} />
          {submittedBook && (
            <div className="success-box" role="status">
              <span className="success-icon" aria-hidden="true">✓</span>
              <div>
                <h3>Book submitted successfully</h3>
                <p><strong>{submittedBook.title}</strong> by {submittedBook.author}</p>
                <p>{submittedBook.genre} · {submittedBook.year}</p>
              </div>
            </div>
          )}
        </section>

        <section className="exercise-panel">
          <div className="panel-heading">
            <span className="step-number step-number-green">02</span>
            <div>
              <p className="panel-kicker">Form data preview</p>
              <h2>Your details</h2>
            </div>
          </div>
          <UserDetailsForm />
        </section>
      </div>
    </main>
  );
}

export default App;