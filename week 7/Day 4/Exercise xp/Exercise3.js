import React from 'react';
import './Exercise.css';

class Exercise extends React.Component {
  render() {
    const style_header = {
      color: 'white',
      backgroundColor: 'DodgerBlue',
      padding: '10px',
      fontFamily: 'Arial',
    };

    return (
      <div className="exercise-content">
        <h1 style={style_header}>This is a heading</h1>
        <p className="para">This is a paragraph styled with an external CSS file.</p>
        <a href="https://react.dev/">Learn more about React</a>

        <form className="exercise-form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" type="text" placeholder="Enter your name" />
          <button type="submit">Submit</button>
        </form>

        <img
          className="exercise-image"
          src="https://placehold.co/320x180?text=React+Exercise"
          alt="A placeholder image for the React exercise"
          width="320"
          height="180"
        />

        <ul>
          <li>JSX</li>
          <li>Components</li>
          <li>Styling</li>
        </ul>
      </div>
    );
  }
}

export default Exercise;
