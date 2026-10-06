import { Component } from 'react'

class Users extends Component {
  state = {
    users: [],
    isLoading: true,
    error: '',
  }

  async componentDidMount() {
    try {
      const response = await fetch('/users')
      if (!response.ok) {
        throw new Error(`Could not load users (${response.status})`)
      }

      const users = await response.json()
      this.setState({ users, isLoading: false })
    } catch (error) {
      this.setState({ error: error.message, isLoading: false })
    }
  }

  render() {
    const { users, isLoading, error } = this.state

    return (
      <section className="data-card">
        <div className="section-heading">
          <span className="section-icon" aria-hidden="true">U</span>
          <div>
            <p className="section-label">Exercise 1</p>
            <h2>Backend users</h2>
          </div>
          {!isLoading && !error && <span className="count-pill">{users.length} users</span>}
        </div>

        {isLoading && <p className="state-message">Loading users…</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {!isLoading && !error && (
          <ul className="user-list">
            {users.map((user) => (
              <li className="user-row" key={user.id}>
                <span className="avatar">{user.username.slice(0, 1).toUpperCase()}</span>
                <span>{user.username}</span>
                <span className="id-label">ID {user.id}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="endpoint">GET /users</p>
      </section>
    )
  }
}

export default Users
