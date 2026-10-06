import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import ErrorBoundary from './ErrorBoundary'
import GoldPostForm from './GoldPostForm'
import GoldAxiosPostForm from './GoldAxiosPostForm'
import posts from './data/posts.json'
import profileData from './data/data.json'
import './App.css'

function HomeScreen() {
  return <h1 className="screen-title">Home</h1>
}

function ProfileScreen() {
  return <h1 className="screen-title">Profile</h1>
}

function ShopScreen() {
  const items = [
    { name: 'Laptop', price: '$999' },
    { name: 'Mouse', price: '$29' },
    { name: 'Keyboard', price: '$79' },
  ]

  return (
    <div>
      <h1 className="screen-title">Shop</h1>
      <div className="row g-3">
        {items.map((item) => (
          <div className="col-md-4" key={item.name}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Great quality product for everyday use.</p>
                <span className="badge bg-primary">{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

function Example1() {
  return (
    <section className="exercise-box">
      <h2>Example 1 - Social Medias</h2>
      <ul className="list-group">
        {profileData.socialMedias.map((item, index) => (
          <li className="list-group-item" key={`${item}-${index}`}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Example2() {
  return (
    <section className="exercise-box">
      <h2>Example 2 - Skills</h2>
      <ul className="list-group">
        {profileData.skills.map((skill, index) => (
          <li className="list-group-item" key={`${skill}-${index}`}>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Example3() {
  return (
    <section className="exercise-box">
      <h2>Example 3 - Experiences</h2>
      <div className="experience-stack">
        {profileData.experiences.map((experience, index) => (
          <div className="experience-card" key={`${experience.company}-${index}`}>
            <h3>{experience.role}</h3>
            <p>
              <strong>{experience.company}</strong>
            </p>
            <p>{experience.location}</p>
            <p>{experience.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function JsonPoster() {
  const [response, setResponse] = useState('')
  const [url, setUrl] = useState('https://webhook.site/your-unique-url')

  const sendData = async () => {
    const payload = {
      key1: 'myusername',
      email: 'mymail@gmail.com',
      name: 'Isaac',
      lastname: 'Doe',
      age: 27,
    }

    try {
      const result = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const text = await result.text()
      setResponse(text)
      console.log('POST response:', text)
    } catch (error) {
      console.error('POST failed:', error)
      setResponse(error.message)
    }
  }

  return (
    <section className="exercise-box">
      <h2>Exercise 4: Post JSON Data</h2>
      <div className="form-group mb-3">
        <label htmlFor="webhook-url">Webhook URL</label>
        <input
          id="webhook-url"
          className="form-control"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://webhook.site/your-unique-url"
        />
      </div>
      <button className="btn btn-primary" onClick={sendData}>
        Send JSON
      </button>
      <div className="mt-3 response-box">
        <strong>Response:</strong>
        <pre>{response || 'Click the button to see the API response.'}</pre>
      </div>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <NavLink to="/" className="navbar-brand">
              React XP
            </NavLink>
            <div className="navbar-nav d-flex flex-row gap-3">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Profile
              </NavLink>
              <NavLink
                to="/shop"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Shop
              </NavLink>
            </div>
          </div>
        </nav>

        <main className="content container py-4">
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <HomeScreen />
                </ErrorBoundary>
              }
            />
            <Route
              path="/profile"
              element={
                <ErrorBoundary>
                  <ProfileScreen />
                </ErrorBoundary>
              }
            />
            <Route
              path="/shop"
              element={
                <ErrorBoundary>
                  <ShopScreen />
                </ErrorBoundary>
              }
            />
          </Routes>

          <PostList />
          <Example1 />
          <Example2 />
          <Example3 />
          <JsonPoster />
          <GoldPostForm />
          <GoldAxiosPostForm />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
