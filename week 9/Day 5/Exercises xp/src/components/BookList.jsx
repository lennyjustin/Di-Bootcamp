export default function BookList({ books }) {
  if (books.length === 0) {
    return (
      <p className="empty-state" role="status">
        No books found in this genre.
      </p>
    );
  }

  return (
    <ul className="book-grid">
      {books.map((book) => (
        <li className="book-card" key={book.id}>
          <span className="book-genre">{book.genre}</span>
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </li>
      ))}
    </ul>
  );
}
