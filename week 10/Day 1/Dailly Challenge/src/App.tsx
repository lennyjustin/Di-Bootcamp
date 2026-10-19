import { useState, type FormEvent } from 'react'
import { List } from './components/List'
import type { Book } from './types'

const initialBooks: Book[] = [
  { id: 'book-1', title: 'The Hobbit', author: 'J. R. R. Tolkien' },
  { id: 'book-2', title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: 'book-3', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin' },
]

function BookApp() {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  function addBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedAuthor = author.trim()
    if (!trimmedTitle || !trimmedAuthor) {
      return
    }

    const newBook: Book = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      author: trimmedAuthor,
    }

    setBooks((currentBooks) => [...currentBooks, newBook])
    setTitle('')
    setAuthor('')
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">A LITTLE LIBRARY</p>
        <h1>Books worth keeping.</h1>
        <p className="hero-copy">
          A small collection, with room for your next favorite.
        </p>
      </header>

      <div className="library-layout">
        <section aria-labelledby="collection-heading" className="collection">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR SHELF</p>
              <h2 id="collection-heading">The collection</h2>
            </div>
            <span aria-live="polite" className="book-count">
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </span>
          </div>

          <List
            emptyMessage="Your shelf is empty. Add a book to get started."
            getKey={(book) => book.id}
            items={books}
            renderItem={(book) => (
              <article className="book-card">
                <span aria-hidden="true" className="book-mark">
                  “
                </span>
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </div>
              </article>
            )}
          />
        </section>

        <section aria-labelledby="add-book-heading" className="add-book">
          <p className="eyebrow">GROW YOUR SHELF</p>
          <h2 id="add-book-heading">Add a book</h2>
          <p className="form-intro">Save a title you’d like to remember.</p>
          <form onSubmit={addBook}>
            <label htmlFor="book-title">Book title</label>
            <input
              autoComplete="off"
              id="book-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. A Wizard of Earthsea"
              required
              value={title}
            />
            <label htmlFor="book-author">Author</label>
            <input
              autoComplete="name"
              id="book-author"
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="e.g. Ursula K. Le Guin"
              required
              value={author}
            />
            <button type="submit">Add to my shelf <span aria-hidden="true">↗</span></button>
          </form>
        </section>
      </div>

      <footer className="page-footer">
        Built with React, TypeScript, and a generic List component.
      </footer>
    </main>
  )
}

export default BookApp
