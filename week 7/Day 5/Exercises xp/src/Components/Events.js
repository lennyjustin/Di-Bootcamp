import { useState } from 'react';

function Events() {
  const [isToggleOn, setIsToggleOn] = useState(true);

  const clickMe = () => {
    window.alert('I was clicked');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      window.alert(event.currentTarget.value);
    }
  };

  const toggle = () => {
    setIsToggleOn((currentValue) => !currentValue);
  };

  return (
    <div className="demo-content">
      <button className="button button-primary" onClick={clickMe} type="button">
        Click me
      </button>

      <label className="field-label" htmlFor="enter-message">Type a message and press Enter</label>
      <input
        className="text-input"
        id="enter-message"
        onKeyDown={handleKeyDown}
        placeholder="Your message"
        type="text"
      />

      <button
        aria-pressed={isToggleOn}
        className={`button ${isToggleOn ? 'button-on' : 'button-off'}`}
        onClick={toggle}
        type="button"
      >
        {isToggleOn ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

export default Events;