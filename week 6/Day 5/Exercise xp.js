

const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

let posts = [
  { id: 1, title: 'First Post', content: 'Hello from the blog API!' },
  { id: 2, title: 'Second Post', content: 'This is another blog post.' }
];

app.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

app.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.status(200).json(post);
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newPost = {
    id: posts.length ? posts[posts.length - 1].id + 1 : 1,
    title,
    content
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

app.put('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const postIndex = posts.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const { title, content } = req.body;
  posts[postIndex] = {
    ...posts[postIndex],
    title: title || posts[postIndex].title,
    content: content || posts[postIndex].content
  };

  res.status(200).json(posts[postIndex]);
});

app.delete('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const initialLength = posts.length;
  posts = posts.filter(p => p.id !== id);

  if (posts.length === initialLength) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.status(200).json({ message: 'Post deleted successfully' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

app.listen(port, () => {
  console.log(`Blog API running on http://localhost:${port}`);
});

{
const express = require('express');

const app = express();
const PORT = 5000;

app.use(express.json());

const books = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', publishedYear: 1937 },
  { id: 2, title: '1984', author: 'George Orwell', publishedYear: 1949 },
  { id: 3, title: 'Pride and Prejudice', author: 'Jane Austen', publishedYear: 1813 }
];

app.get('/api/books', (req, res) => {
  res.status(200).json(books);
});

app.get('/api/books/:bookId', (req, res) => {
  const bookId = Number(req.params.bookId);
  const book = books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.status(200).json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, publishedYear } = req.body;

  if (!title || !author || !publishedYear) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author,
    publishedYear
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

app.listen(PORT, () => {
  console.log(`Book API is running on http://localhost:${PORT}`);
});
}

// Run the book API from its own project directory:
// cd "c:\Users\EHK STUDENT 013\Di-Bootcamp\week 6\Day 5\book-api"
// node app.js

{
const express = require('express');
const { fetchPosts } = require('./data/dataService');

const app = express();
const PORT = 5000;

app.get('/posts', async (req, res) => {
  try {
    const posts = await fetchPosts();
    console.log('Data successfully retrieved from JSONPlaceholder');
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ message: 'Failed to retrieve posts' });
  }
});

app.listen(PORT, () => {
  console.log(`CRUD API running on http://localhost:${PORT}`);
});

// Run the CRUD API from its own project directory:
// cd "c:\Users\EHK STUDENT 013\Di-Bootcamp\week 6\Day 5\crud-api"
// node app.js
}