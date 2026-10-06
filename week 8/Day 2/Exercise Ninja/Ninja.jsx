import { Component } from 'react'
import Customers from './src/components/Customers.jsx'
import Users from './src/components/Users.jsx'

class Ninja extends Component {
  render() {
    return (
      <main className="page-shell">
        <header className="page-header">
          <p className="eyebrow">React · Week 8 · Day 2</p>
          <h1>Express API Explorer</h1>
          <p>
            Fetch JSON from an Express backend and render it with React class
            components.
          </p>
        </header>

        <div className="data-grid">
          <Users />
          <Customers />
        </div>
      </main>
    )
  }
}

export default Ninja
