import { Component } from 'react'

class UsersList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      isLoaded: false,
      errorMsg: '',
    }
  }

  async componentDidMount() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users')
      if (!response.ok) {
        throw new Error(`Could not load users (${response.status})`)
      }

      const users = await response.json()
      this.setState({ users, isLoaded: true })
    } catch (error) {
      this.setState({ errorMsg: error.message, isLoaded: true })
    }
  }

  render() {
    const { users, isLoaded, errorMsg } = this.state

    if (!isLoaded) {
      return <p className="loading-message">Loading users…</p>
    }

    if (errorMsg) {
      return <p className="error-message" role="alert">{errorMsg}</p>
    }

    return (
      <section aria-labelledby="users-heading">
        <div className="list-heading">
          <div>
            <p className="section-kicker">People directory</p>
            <h2 id="users-heading">List of users</h2>
          </div>
          <span className="total-count">{users.length} users</span>
        </div>

        <ul className="users-grid">
          {users.map((user) => (
            <li className="user-card" key={user.id}>
              <div className="user-avatar" aria-hidden="true">
                {user.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-id">USER {String(user.id).padStart(2, '0')}</span>
                <h3>{user.name}</h3>
                <p className="username">@{user.username}</p>
                <a href={`mailto:${user.email}`}>{user.email}</a>
                <p className="user-city">{user.address.city}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }
}

export default UsersList
