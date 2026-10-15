import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './features/user/userSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const { data: user, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const isLoading = status === 'loading';

  return (
    <main className="page-shell">
      <header className="intro">
        <span className="eyebrow">REDUX TOOLKIT + THUNK</span>
        <h1>User profile</h1>
        <p>Fetch and display user data with React and Redux.</p>
      </header>

      <section className="user-card" aria-labelledby="profile-heading">
        <div className="card-heading">
          <div>
            <h2 id="profile-heading">Profile details</h2>
            <p className="card-description">
              Data is loaded from the JSONPlaceholder API.
            </p>
          </div>
          <button
            className="refresh-button"
            type="button"
            onClick={() => dispatch(fetchUser())}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Refresh user'}
          </button>
        </div>

        {isLoading && (
          <p className="status-message" role="status">
            Fetching user data…
          </p>
        )}

        {status === 'failed' && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button
              className="retry-button"
              type="button"
              onClick={() => dispatch(fetchUser())}
            >
              Try again
            </button>
          </div>
        )}

        {status === 'succeeded' && user && (
          <div className="profile">
            <div className="avatar" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-heading">
              <h3>{user.name}</h3>
              <p>{user.company.name}</p>
            </div>
            <dl className="details-list">
              <div className="detail-row">
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </dd>
              </div>
              <div className="detail-row">
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${user.phone}`}>{user.phone}</a>
                </dd>
              </div>
              <div className="detail-row">
                <dt>Website</dt>
                <dd>
                  <a
                    href={`https://${user.website}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {user.website}
                  </a>
                </dd>
              </div>
              <div className="detail-row">
                <dt>Address</dt>
                <dd>
                  {user.address.suite}, {user.address.street},{' '}
                  {user.address.city} {user.address.zipcode}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {status === 'idle' && (
          <p className="status-message" role="status">
            Preparing to fetch user data…
          </p>
        )}
      </section>

      <footer className="page-footer">
        The user profile is managed in the Redux store.
      </footer>
    </main>
  );
}