import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loginUser, logout, registerUser } from './features/auth/authSlice';
import { createStory, deleteStory, fetchStories, updateStory } from './features/stories/storiesSlice';
import type { Story } from './types';
import './App.css';

function AuthScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      email: formValues.email,
      password: formValues.password,
      ...(isRegistering ? { username: formValues.username } : {}),
    };

    if (isRegistering) {
      dispatch(registerUser(payload));
      return;
    }

    dispatch(loginUser(payload));
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>{isRegistering ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">Keep your stories, collaborators, and ideas in one place.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <label>
              Username
              <input
                type="text"
                value={formValues.username}
                onChange={(event) => setFormValues((current) => ({ ...current, username: event.target.value }))}
                placeholder="Storyteller"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={formValues.password}
              onChange={(event) => setFormValues((current) => ({ ...current, password: event.target.value }))}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Loading...' : isRegistering ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <button type="button" className="secondary-button" onClick={() => setIsRegistering((current) => !current)}>
          {isRegistering ? 'Already have an account? Log in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const isAuthor = user?.id === story.author_id;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(story.title);
  const [content, setContent] = useState(story.content);

  const handleSave = () => {
    if (!token) return;
    dispatch(updateStory({ id: story.id, title, content }));
    setEditing(false);
  };

  const handleDelete = () => {
    if (!token) return;
    dispatch(deleteStory(story.id));
  };

  return (
    <article className="story-card">
      {editing ? (
        <div className="story-editor">
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} />
          <div className="story-actions">
            <button className="primary-button" type="button" onClick={handleSave}>Save</button>
            <button className="secondary-button" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="story-header">
            <div>
              <p className="eyebrow">{story.author?.username || 'Author'}</p>
              <h3>{story.title}</h3>
            </div>
            {isAuthor && (
              <div className="story-actions compact">
                <button type="button" className="secondary-button" onClick={() => setEditing(true)}>Edit</button>
                <button type="button" className="danger-button" onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>

          <p className="story-content">{story.content}</p>

          <div className="contributors">
            <span className="section-label">Contributors</span>
            {story.contributors.length > 0 ? (
              <ul>
                {story.contributors.map((contributor) => (
                  <li key={contributor.id}>{contributor.username}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No contributors yet.</p>
            )}
          </div>
        </>
      )}
    </article>
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { token, user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { items, loading: storiesLoading } = useAppSelector((state) => state.stories);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchStories());
    }
  }, [dispatch, token]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || !token) return;
    dispatch(createStory({ title, content }));
    setTitle('');
    setContent('');
  };

  if (!token || !user) {
    return <AuthScreen />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Collaborative storytelling</p>
          <h1>StoryBoard</h1>
        </div>

        <div className="topbar-actions">
          <span className="user-pill">{user.username}</span>
          <button type="button" className="secondary-button" onClick={() => dispatch(logout())}>Log out</button>
        </div>
      </header>

      <section className="composer card">
        <h2>Write a new story</h2>
        <form onSubmit={handleCreate} className="story-form">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Story title"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your story here..."
            rows={5}
          />
          <button type="submit" className="primary-button" disabled={authLoading || storiesLoading}>
            Publish story
          </button>
        </form>
      </section>

      <section className="stories-panel">
        <div className="section-header">
          <h2>Latest stories</h2>
          <span>{items.length} stories</span>
        </div>

        {storiesLoading ? (
          <p className="muted">Loading stories...</p>
        ) : (
          <div className="stories-list">
            {items.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
