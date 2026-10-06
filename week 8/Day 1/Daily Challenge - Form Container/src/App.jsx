import { Component } from 'react';
import './App.css';

const initialFormData = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  destination: '',
  nutsFree: false,
  lactoseFree: false,
  vegan: false,
};

function getInitialFormData() {
  const searchParams = new URLSearchParams(window.location.search);

  return {
    firstName: searchParams.get('firstName') ?? initialFormData.firstName,
    lastName: searchParams.get('lastName') ?? initialFormData.lastName,
    age: searchParams.get('age') ?? initialFormData.age,
    gender: searchParams.get('gender') ?? initialFormData.gender,
    destination: searchParams.get('destination') ?? initialFormData.destination,
    nutsFree: searchParams.has('nutsFree'),
    lactoseFree: searchParams.has('lactoseFree'),
    vegan: searchParams.has('vegan'),
  };
}

const destinations = ['Japan', 'Australia', 'Brazil', 'Canada', 'France'];

function displayValue(value) {
  return value || '—';
}

function FormComponent({ formData, handleChange }) {
  return (
    <form className="traveler-form" method="get">
      <div className="field-row">
        <label className="field">
          <span>First name</span>
          <input
            autoComplete="given-name"
            name="firstName"
            onChange={handleChange}
            placeholder="e.g. John"
            required
            value={formData.firstName}
          />
        </label>
        <label className="field">
          <span>Last name</span>
          <input
            autoComplete="family-name"
            name="lastName"
            onChange={handleChange}
            placeholder="e.g. Doe"
            required
            value={formData.lastName}
          />
        </label>
      </div>

      <label className="field">
        <span>Age</span>
        <input
          max="120"
          min="1"
          name="age"
          onChange={handleChange}
          placeholder="Your age"
          required
          type="number"
          value={formData.age}
        />
      </label>

      <fieldset className="option-group">
        <legend>Gender</legend>
        <div className="inline-options">
          {['male', 'female', 'other'].map((gender) => (
            <label className="choice" key={gender}>
              <input
                checked={formData.gender === gender}
                name="gender"
                onChange={handleChange}
                required
                type="radio"
                value={gender}
              />
              <span>{gender[0].toUpperCase() + gender.slice(1)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Destination</span>
        <select
          name="destination"
          onChange={handleChange}
          required
          value={formData.destination}
        >
          <option disabled value="">Choose a destination</option>
          {destinations.map((destination) => (
            <option key={destination} value={destination}>
              {destination}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="option-group dietary-group">
        <legend>Dietary restrictions</legend>
        <label className="choice">
          <input
            checked={formData.nutsFree}
            name="nutsFree"
            onChange={handleChange}
            type="checkbox"
          />
          <span>Nuts free</span>
        </label>
        <label className="choice">
          <input
            checked={formData.lactoseFree}
            name="lactoseFree"
            onChange={handleChange}
            type="checkbox"
          />
          <span>Lactose free</span>
        </label>
        <label className="choice">
          <input
            checked={formData.vegan}
            name="vegan"
            onChange={handleChange}
            type="checkbox"
          />
          <span>Vegan meal</span>
        </label>
      </fieldset>

      <button className="submit-button" type="submit">
        Submit traveler details <span aria-hidden="true">→</span>
      </button>
      <p className="form-footnote">Submitting adds your answers to the page URL.</p>
    </form>
  );
}

class App extends Component {
  state = { formData: getInitialFormData() };

  handleChange = (event) => {
    const { name, type, value, checked } = event.target;

    this.setState(({ formData }) => ({
      formData: {
        ...formData,
        [name]: type === 'checkbox' ? (checked ? true : false) : value,
      },
    }));
  };

  render() {
    const { formData } = this.state;

    return (
      <main className="page-shell">
        <header className="page-header">
          <span className="eyebrow">DAILY CHALLENGE · WEEK 8</span>
          <h1>Form Container</h1>
          <p>Tell us a little about the traveler and see the details take shape.</p>
        </header>

        <div className="content-grid">
          <section aria-labelledby="form-heading" className="form-card">
            <div className="card-heading">
              <span className="step-number">01</span>
              <div>
                <h2 id="form-heading">Traveler details</h2>
                <p>All fields update your summary instantly.</p>
              </div>
            </div>
            <FormComponent formData={formData} handleChange={this.handleChange} />
          </section>

          <aside aria-labelledby="summary-heading" className="summary-card">
            <div className="summary-topline">
              <span className="summary-icon" aria-hidden="true">✦</span>
              <span>LIVE PREVIEW</span>
            </div>
            <h2 id="summary-heading">Entered information:</h2>
            <div className="summary-details" aria-live="polite">
              <p>Your name: <strong>{displayValue(`${formData.firstName} ${formData.lastName}`.trim())}</strong></p>
              <p>Your age: <strong>{displayValue(formData.age)}</strong></p>
              <p>Your gender: <strong>{displayValue(formData.gender)}</strong></p>
              <p>Your destination: <strong>{displayValue(formData.destination)}</strong></p>
              <div className="dietary-summary">
                <p>Your dietary restrictions:</p>
                <ul>
                  <li>Nuts free: <strong>{formData.nutsFree ? 'Yes' : 'No'}</strong></li>
                  <li>Lactose free: <strong>{formData.lactoseFree ? 'Yes' : 'No'}</strong></li>
                  <li>Vegan meal: <strong>{formData.vegan ? 'Yes' : 'No'}</strong></li>
                </ul>
              </div>
            </div>
            <div className="summary-decoration" aria-hidden="true" />
          </aside>
        </div>

        <footer className="page-footer">Your next trip starts with the details.</footer>
      </main>
    );
  }
}

export default App;
