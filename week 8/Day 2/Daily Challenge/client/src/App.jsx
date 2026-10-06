import { Component } from 'react'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      helloMessage: '',
      inputValue: '',
      responseMessage: '',
      errorMessage: '',
      isSubmitting: false,
    }
  }

  async componentDidMount() {
    try {
      const response = await fetch('/api/hello')
      if (!response.ok) {
        throw new Error(`Could not load greeting (${response.status})`)
      }

      const data = await response.json()
      this.setState({ helloMessage: data.message })
    } catch (error) {
      this.setState({ errorMessage: error.message })
    }
  }

  handleChange = (event) => {
    this.setState({
      inputValue: event.target.value,
      responseMessage: '',
      errorMessage: '',
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { inputValue } = this.state
    this.setState({ isSubmitting: true, errorMessage: '', responseMessage: '' })

    try {
      const response = await fetch('/api/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Request failed (${response.status})`)
      }

      this.setState({ responseMessage: data.message })
    } catch (error) {
      this.setState({ errorMessage: error.message })
    } finally {
      this.setState({ isSubmitting: false })
    }
  }

  render() {
    const {
      helloMessage,
      inputValue,
      responseMessage,
      errorMessage,
      isSubmitting,
    } = this.state

    return (
      <main className="page">
        <header className="hero">
          <p className="eyebrow">React + Express</p>
          <h1>Data and Server</h1>
          <p className="intro">
            Send a message from this form and receive it back from the Express
            server.
          </p>
        </header>

        <section className="message-card">
          <span className="card-label">PART I · GET REQUEST</span>
          <h2>{helloMessage || 'Connecting to Express…'}</h2>
          {errorMessage && !helloMessage && (
            <p className="error-message" role="alert">{errorMessage}</p>
          )}
        </section>

        <section className="message-card form-card">
          <span className="card-label">PART II · POST REQUEST</span>
          <h2>Send a message</h2>
          <form onSubmit={this.handleSubmit}>
            <label htmlFor="message">Your message</label>
            <div className="input-row">
              <input
                id="message"
                type="text"
                value={inputValue}
                onChange={this.handleChange}
                placeholder="Type something to send..."
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send to server'}
              </button>
            </div>
          </form>

          {responseMessage && (
            <p className="response-message" role="status">{responseMessage}</p>
          )}
          {errorMessage && helloMessage && (
            <p className="error-message" role="alert">{errorMessage}</p>
          )}
        </section>
      </main>
    )
  }
}

export default App
