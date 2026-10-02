import { useState } from 'react';

const initialBook = {
  title: '',
  author: '',
  genre: '',
  year: '',
};

function BookForm({ onSubmit }) {
  const [bookData, setBookData] = useState(initialBook);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBookData((currentBook) => ({ ...currentBook, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...bookData });
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="book-title">Title</label>
        <input id="book-title" name="title" onChange={handleChange} placeholder="e.g. The Hobbit" value={bookData.title} required />
      </div>
      <div className="field-group">
        <label htmlFor="book-author">Author</label>
        <input id="book-author" name="author" onChange={handleChange} placeholder="e.g. J. R. R. Tolkien" value={bookData.author} required />
      </div>
      <div className="field-group">
        <label htmlFor="book-genre">Genre</label>
        <input id="book-genre" name="genre" onChange={handleChange} placeholder="e.g. Fantasy" value={bookData.genre} required />
      </div>
      <div className="field-group">
        <label htmlFor="book-year">Publication year</label>
        <input id="book-year" name="year" onChange={handleChange} placeholder="e.g. 1937" type="number" value={bookData.year} required />
      </div>
      <div className="form-actions">
        <button className="button button-primary" type="submit">Submit book</button>
      </div>
    </form>
  );
}

export default BookForm;