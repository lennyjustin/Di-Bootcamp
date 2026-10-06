import { Component } from 'react'

class GoldPostForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: '',
      email: '',
      response: null,
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    const { user, email } = this.state

    const response = await fetch('https://jsonplaceholder.typicode.com/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: user, email }),
    })

    const data = await response.json()
    this.setState({ response: data })
    console.log('Posted user data:', data)
  }

  render() {
    const { user, email } = this.state

    return (
      <section className="exercise-box gold-form-box">
        <h2>Gold Exercise 1: POST JSON Data</h2>
        <form onSubmit={this.handleSubmit} className="gold-form">
          <input
            type="text"
            name="user"
            value={user}
            placeholder="User"
            onChange={this.handleChange}
          />
          <input
            type="email"
            name="email"
            value={email}
            placeholder="Email"
            onChange={this.handleChange}
          />
          <button type="submit">Submit</button>
        </form>
      </section>
    )
  }
}

export default GoldPostForm
