import { Component } from 'react'

class Customers extends Component {
  state = {
    customers: [],
    isLoading: true,
    error: '',
  }

  async componentDidMount() {
    try {
      const response = await fetch('/api/customers/')
      if (!response.ok) {
        throw new Error(`Could not load customers (${response.status})`)
      }

      const customers = await response.json()
      this.setState({ customers, isLoading: false })
    } catch (error) {
      this.setState({ error: error.message, isLoading: false })
    }
  }

  render() {
    const { customers, isLoading, error } = this.state

    return (
      <section className="data-card">
        <div className="section-heading">
          <span className="section-icon customers-icon" aria-hidden="true">C</span>
          <div>
            <p className="section-label">Exercise 2</p>
            <h2>Customers</h2>
          </div>
          {!isLoading && !error && (
            <span className="count-pill">{customers.length} customers</span>
          )}
        </div>

        {isLoading && <p className="state-message">Loading customers…</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {!isLoading && !error && (
          <ul className="customer-list">
            {customers.map((customer) => (
              <li className="customer-row" key={customer.id}>
                <span className="customer-avatar">
                  {customer.firstName.slice(0, 1)}{customer.lastName.slice(0, 1)}
                </span>
                <span className="customer-name">
                  {customer.firstName} {customer.lastName}
                </span>
                <span className="id-label">#{customer.id}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="endpoint">GET /api/customers/</p>
      </section>
    )
  }
}

export default Customers
