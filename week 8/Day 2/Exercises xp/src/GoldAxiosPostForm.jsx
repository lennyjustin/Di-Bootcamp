import { Component } from 'react'
import axios from 'axios'

class GoldAxiosPostForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: '',
      title: '',
      body: '',
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    const { userId, title, body } = this.state

    const payload = {
      userId: Number(userId),
      title,
      body,
    }

    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', payload)
    console.log('Posted axios data:', response.data)
  }

  render() {
    const { userId, title, body } = this.state

    return (
      <section className="exercise-box gold-form-box">
        <h2>Gold Exercise 2: POST JSON Data with Axios</h2>
        <form onSubmit={this.handleSubmit} className="gold-form">
          <input
            type="number"
            name="userId"
            value={userId}
            placeholder="UserId"
            onChange={this.handleChange}
          />
          <input
            type="text"
            name="title"
            value={title}
            placeholder="Title"
            onChange={this.handleChange}
          />
          <textarea
            name="body"
            value={body}
            placeholder="Body"
            onChange={this.handleChange}
          />
          <button type="submit">Submit</button>
        </form>
      </section>
    )
  }
}

export default GoldAxiosPostForm
