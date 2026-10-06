import { Component } from 'react'
import axios from 'axios'

class GoldAxiosPostForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: '',
      title: '',
      body: '',
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

    const { userId, title, body } = this.state

    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        userId: Number(userId),
        title,
        body,
      })

      console.log('Axios POST response:', response.data)
      this.setState({ result: response.data })
    } catch (error) {
      console.error('Axios POST failed:', error)
      this.setState({ error: error.message })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }

  render() {
    const { userId, title, body, isSubmitting, error, result } = this.state

    return (
      <section className="exercise-card">
        <div className="card-heading">
          <span className="exercise-number">02</span>
          <div>
            <p className="card-kicker">Using Axios</p>
            <h2>POST a new post</h2>
          </div>
        </div>

        <form onSubmit={this.handleSubmit} className="exercise-form">
          <label htmlFor="post-user-id">User ID</label>
          <input
            id="post-user-id"
            type="number"
            name="userId"
            placeholder="e.g. 1"
            value={userId}
            onChange={this.handleChange}
            min="1"
            required
          />

          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            type="text"
            name="title"
            placeholder="Post title"
            value={title}
            onChange={this.handleChange}
            required
          />

          <label htmlFor="post-body">Body</label>
          <textarea
            id="post-body"
            name="body"
            placeholder="Write the post content..."
            value={body}
            onChange={this.handleChange}
            rows="4"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Submit'}
          </button>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
        {result && (
          <div className="result-message" role="status">
            <strong>Post created successfully</strong>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
        <p className="api-note">POSTs to jsonplaceholder.typicode.com/posts</p>
      </section>
    )
  }
}

export default GoldAxiosPostForm
