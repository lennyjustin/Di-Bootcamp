import { useState } from 'react';

function Forms() {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState(null);
  const [errormessage, setErrormessage] = useState('');
  const [message, setMessage] = useState('Please write your message here.');
  const [selectedCar, setSelectedCar] = useState('Volvo');

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'username') {
      setUsername(value);
      return;
    }

    if (name === 'age') {
      setAge(value === '' ? null : value);
      const isNumeric = value.trim() === '' || Number.isFinite(Number(value));
      setErrormessage(isNumeric ? '' : 'Age must be a number.');
    }
  };

  const mySubmitHandler = (event) => {
    event.preventDefault();
    if (!username.trim() || age === null || errormessage) return;
    window.alert(username);
  };

  let header = null;
  if (username.trim()) {
    header = age !== null && !errormessage
      ? <h2 className="greeting">Hello, {username}! You are {age} years old.</h2>
      : <h2 className="greeting">Hello, {username}!</h2>;
  }

  return (
    <div className="content-grid">
      <section className="panel profile-panel">
        <div className="panel-heading">
          <span className="step-number">01</span>
          <div>
            <p className="panel-kicker">Controlled form</p>
            <h2>Your details</h2>
          </div>
        </div>

        {header}

        <form className="details-form" onSubmit={mySubmitHandler}>
          <label htmlFor="username">Name</label>
          <input
            autoComplete="name"
            id="username"
            name="username"
            onChange={handleChange}
            placeholder="Enter your name"
            type="text"
            value={username}
            required
          />

          <label htmlFor="age">Age</label>
          <input
            aria-describedby={errormessage ? 'age-error' : undefined}
            aria-invalid={Boolean(errormessage)}
            id="age"
            inputMode="decimal"
            name="age"
            onChange={handleChange}
            placeholder="Enter your age"
            type="text"
            value={age ?? ''}
            required
          />
          {errormessage && <p className="error-message" id="age-error" role="alert">{errormessage}</p>}

          <button className="button button-primary" type="submit">Submit</button>
        </form>
      </section>

      <div className="side-panels">
        <section className="panel">
          <div className="panel-heading">
            <span className="step-number step-number-soft">02</span>
            <div>
              <p className="panel-kicker">Controlled textarea</p>
              <h2>A note</h2>
            </div>
          </div>
          <label className="visually-hidden" htmlFor="message">Your message</label>
          <textarea
            id="message"
            onChange={(event) => setMessage(event.target.value)}
            value={message}
            rows="4"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <span className="step-number step-number-soft">03</span>
            <div>
              <p className="panel-kicker">Controlled select</p>
              <h2>Choose a car</h2>
            </div>
          </div>
          <label className="visually-hidden" htmlFor="car-brand">Car brand</label>
          <select
            id="car-brand"
            onChange={(event) => setSelectedCar(event.target.value)}
            value={selectedCar}
          >
            <option value="Volvo">Volvo</option>
            <option value="Saab">Saab</option>
            <option value="Mercedes">Mercedes</option>
            <option value="Audi">Audi</option>
          </select>
          <p className="selection-note">Selected: <strong>{selectedCar}</strong></p>
        </section>
      </div>
    </div>
  );
}

export default Forms;