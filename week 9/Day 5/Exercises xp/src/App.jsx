import { useState } from 'react';
import { useSelector } from 'react-redux';
import BookList from './components/BookList.jsx';
import {
  selectBooks,
  selectFantasyBooks,
  selectHorrorBooks,
  selectScienceFictionBooks,
} from './features/books/booksSelectors.js';

const genres = [
  { id: 'all', label: 'All books', selector: selectBooks },
  { id: 'horror', label: 'Horror', selector: selectHorrorBooks },
  { id: 'fantasy', label: 'Fantasy', selector: selectFantasyBooks },
  {
    id: 'science-fiction',
    label: 'Science fiction',
    selector: selectScienceFictionBooks,
  },
];

export default function App() {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const activeGenre = genres.find((genre) => genre.id === selectedGenre);
  const books = useSelector(activeGenre.selector);

  return (
    <main className="page-shell">
      <header className="intro">
        <span className="eyebrow">A REDUX TOOLKIT EXERCISE</span>
        <h1>Find your next read.</h1>
        <p>
          Browse the collection by genre. Memoized selectors keep each list
          derived from the inventory.
        </p>
      </header>

      <section className="inventory" aria-labelledby="inventory-heading">
        <div className="inventory-heading">
          <div>
            <h2 id="inventory-heading">The bookshelf</h2>
            <p>Choose a genre to explore the collection.</p>
          </div>
          <span className="book-count" aria-live="polite">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </div>

        <div
          aria-label="Filter books by genre"
          className="genre-switcher"
          role="group"
        >
          {genres.map((genre) => (
            <button
              aria-pressed={selectedGenre === genre.id}
              className="genre-button"
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              type="button"
            >
              {genre.label}
            </button>
          ))}
        </div>

        <BookList books={books} />
      </section>

      <footer className="page-footer">
        Powered by React, Redux Toolkit, and createSelector.
      </footer>
    </main>
  );
}
