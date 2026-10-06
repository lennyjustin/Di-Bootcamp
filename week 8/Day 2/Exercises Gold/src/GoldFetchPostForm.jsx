import { Component } from 'react'

class GoldFetchPostForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: '',
      email: '',
      isSubmitting: false,
      error: '',
      result: null,
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ isSubmitting: true, error: '', result: null })

    const { user, email } = this.state

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user, email }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log('Fetch POST response:', data)
      this.setState({ result: data })
    } catch (error) {
      console.error('Fetch POST failed:', error)
      this.setState({ error: error.message })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }

  render() {
    const { user, email, isSubmitting, error, result } = this.state

    return (
      <section className="exercise-card">
        <div className="card-heading">
          <span className="exercise-number">01</span>
          <div>
            <p className="card-kicker">Using Fetch</p>
            <h2>POST user data</h2>
          </div>
        </div>

        <form onSubmit={this.handleSubmit} className="exercise-form">
          <label htmlFor="fetch-user">User</label>
          <input
            id="fetch-user"
            type="text"
            name="user"
            placeholder="e.g. Isaac"
            value={user}
            onChange={this.handleChange}
            required
          />

          <label htmlFor="fetch-email">Email</label>
          <input
            id="fetch-email"
            type="email"
            name="email"
            placeholder="e.g. isaac@example.com"
            value={email}
            onChange={this.handleChange}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Submit'}
          </button>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
        {result && (
          <div className="result-message" role="status">
            <strong>User posted successfully</strong>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
        <p className="api-note">POSTs to jsonplaceholder.typicode.com/users/</p>
      </section>
    )
  }
}

export default GoldFetchPostForm
