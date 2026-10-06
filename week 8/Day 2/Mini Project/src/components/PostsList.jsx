import { Component } from 'react'

class PostsList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      errorMsg: '',
      isLoading: true,
    }
  }

  async componentDidMount() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts')
      if (!response.ok) {
        throw new Error(`Could not load posts (${response.status})`)
      }

      const posts = await response.json()
      this.setState({ posts, isLoading: false })
    } catch (error) {
      this.setState({ errorMsg: error.message, isLoading: false })
    }
  }

  render() {
    const { posts, errorMsg, isLoading } = this.state

    return (
      <section aria-labelledby="posts-heading">
        <div className="list-heading">
          <div>
            <p className="section-kicker">The latest from the API</p>
            <h2 id="posts-heading">List of posts</h2>
          </div>
          {!isLoading && !errorMsg && <span className="total-count">{posts.length} posts</span>}
        </div>

        {isLoading && <p className="loading-message">Loading posts…</p>}
        {errorMsg && <p className="error-message" role="alert">{errorMsg}</p>}
        {!isLoading && !errorMsg && (
          <div className="posts-grid">
            {posts.map((post) => (
              <article className="post-card" key={post.id}>
                <span className="post-number">POST {String(post.id).padStart(2, '0')}</span>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    )
  }
}

export default PostsList
