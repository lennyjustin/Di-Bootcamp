export default function AgeControls({ age, loading, onSubmit }) {
  return (
    <form className="age-controls" onSubmit={onSubmit}>
      <button
        className="age-button age-down"
        type="submit"
        name="action"
        value="down"
        disabled={loading || age === 0}
      >
        <span aria-hidden="true">−</span>
        Age Down
      </button>
      <button
        className="age-button age-up"
        type="submit"
        name="action"
        value="up"
        disabled={loading}
      >
        <span aria-hidden="true">+</span>
        Age Up
      </button>
    </form>
  );
}
