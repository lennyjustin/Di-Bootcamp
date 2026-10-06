import { Component } from 'react'
import countries from './countries.js'

class AutoCompletedText extends Component {
  constructor(props) {
    super(props)
    this.state = {
      suggestions: [],
      text: '',
    }
  }

  handleChange = (event) => {
    const text = event.target.value
    const query = text.trim().toLowerCase()
    const suggestions = query
      ? countries.filter((country) => country.toLowerCase().startsWith(query))
      : []

    this.setState({ suggestions, text })
  }

  handleSelect = (country) => {
    this.setState({ text: country, suggestions: [] })
  }

  render() {
    const { suggestions, text } = this.state

    return (
      <section className="autocomplete-card" aria-label="Country autocomplete">
        <h2>Auto Completed</h2>
        <label className="visually-hidden" htmlFor="country-search">Country</label>
        <input
          id="country-search"
          type="text"
          value={text}
          onChange={this.handleChange}
          placeholder="Start typing a country..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="country-suggestions"
          aria-expanded={suggestions.length > 0}
        />

        {suggestions.length > 0 && (
          <ul className="suggestions-list" id="country-suggestions" role="listbox">
            {suggestions.map((country) => (
              <li key={country} role="option" aria-selected="false">
                <button type="button" onClick={() => this.handleSelect(country)}>
                  {country}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="suggestion-count" aria-live="polite">
          Suggestions: {suggestions.length}
        </div>
      </section>
    )
  }
}

export default AutoCompletedText
