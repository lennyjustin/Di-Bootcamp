import React, { useRef, useState } from "react";

const MAX_CHARACTERS = 240;

export default function CharacterCounter() {
  const inputRef = useRef(null);
  const [characterCount, setCharacterCount] = useState(0);

  function updateCharacterCount() {
    setCharacterCount(inputRef.current?.value.length ?? 0);
  }

  function clearInput() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    setCharacterCount(0);
    inputRef.current.focus();
  }

  return (
    <section className="exercise-card counter-card" aria-labelledby="counter-title">
      <div className="card-heading">
        <div className="exercise-icon exercise-icon--mint" aria-hidden="true">
          <span>↗</span>
        </div>
        <span className="exercise-tag">EXERCISE 02</span>
      </div>

      <h2 id="counter-title">Character counter</h2>
      <p className="card-description">
        Type a thought below and watch your character count update instantly.
      </p>

      <label className="input-label" htmlFor="message">
        Your message
      </label>
      <textarea
        ref={inputRef}
        id="message"
        className="message-input"
        placeholder="Start typing something wonderful..."
        maxLength={MAX_CHARACTERS}
        onInput={updateCharacterCount}
        aria-describedby="counter-hint character-count"
      />
      <div className="counter-footer">
        <span id="counter-hint">A little space for your thoughts.</span>
        <span
          id="character-count"
          className="character-count"
          aria-live="polite"
        >
          <strong>{characterCount}</strong> / {MAX_CHARACTERS}
        </span>
      </div>

      <button
        className="clear-button"
        type="button"
        onClick={clearInput}
        disabled={characterCount === 0}
      >
        Clear text
      </button>
    </section>
  );
}
