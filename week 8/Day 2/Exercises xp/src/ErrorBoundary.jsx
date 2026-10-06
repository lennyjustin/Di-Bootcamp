import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error) {
    console.error(error)
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger my-4" role="alert">
          Something went wrong. The app caught this error using an Error Boundary.
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
