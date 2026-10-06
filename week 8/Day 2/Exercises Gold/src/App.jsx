import GoldAxiosPostForm from './GoldAxiosPostForm.jsx'
import GoldFetchPostForm from './GoldFetchPostForm.jsx'

function App() {
  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">React · Week 8 · Day 2</p>
        <h1>POST JSON Data</h1>
        <p className="intro">
          Practice controlled class-component forms with Fetch and Axios.
          Open the browser console after submitting to see each API response.
        </p>
      </header>

      <div className="exercise-grid">
        <GoldFetchPostForm />
        <GoldAxiosPostForm />
      </div>
    </main>
  )
}

export default App
