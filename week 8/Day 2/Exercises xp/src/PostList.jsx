import posts from './data/posts.json'

function PostList() {
  return (
    <section className="exercise-box">
      <h2>Exercise 2: Display JSON Data</h2>
      <div className="post-list">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PostList
