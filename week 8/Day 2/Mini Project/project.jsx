import { Component } from 'react'
import PostsList from './src/components/PostsList.jsx'
import UsersList from './src/components/UsersList.jsx'

class Project extends Component {
  render() {
    return (
      <main className="project-page">
        <header className="page-heading">
          <p className="eyebrow">React · Mini Project</p>
          <h1>Users &amp; Posts</h1>
          <p>Live data fetched from JSONPlaceholder and rendered with React.</p>
        </header>

        <section className="panel users-panel">
          <UsersList />
        </section>

        <section className="panel posts-panel">
          <PostsList />
        </section>
      </main>
    )
  }
}

export default Project
