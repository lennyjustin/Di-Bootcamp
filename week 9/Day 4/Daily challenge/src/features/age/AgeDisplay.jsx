export default function AgeDisplay({ age, loading }) {
  return (
    <div className="age-display" aria-live="polite" aria-busy={loading}>
      <span className="age-label">CURRENT AGE</span>
      <div className="age-value">
        <span>{age}</span>
        {loading && (
          <span className="spinner" role="status" aria-label="Updating age" />
        )}
      </div>
      <p className="age-caption">
        {loading ? 'Updating your age…' : age === 1 ? 'year old' : 'years old'}
      </p>
    </div>
  );
}
