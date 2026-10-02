import { useState } from 'react';

function App() {
  const [languages, setLanguages] = useState([
    { name: 'Php', votes: 0 },
    { name: 'Python', votes: 0 },
    { name: 'JavaSript', votes: 0 },
    { name: 'Java', votes: 0 },
  ]);

  const totalVotes = languages.reduce((total, language) => total + language.votes, 0);

  const voteForLanguage = (languageName) => {
    setLanguages((currentLanguages) =>
      currentLanguages.map((language) =>
        language.name === languageName
          ? { ...language, votes: language.votes + 1 }
          : language,
      ),
    );
  };

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">The community poll</p>
        <h1>Vote Your Language!</h1>
        <p className="intro">Which programming language gets your vote? Cast one below.</p>
      </header>

      <section aria-label="Programming language voting" className="vote-panel">
        <div className="poll-summary">
          <div>
            <p className="panel-kicker">Your voice counts</p>
            <h2>Choose your favorite</h2>
          </div>
          <p className="total-votes"><strong>{totalVotes}</strong> {totalVotes === 1 ? 'vote' : 'votes'}</p>
        </div>

        <div className="language-list">
          {languages.map((language, index) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((language.votes / totalVotes) * 100);

            return (
              <article className="language-card" key={language.name}>
                <span aria-hidden="true" className={`language-icon language-icon-${index}`}>
                  {language.name.slice(0, 1)}
                </span>
                <div className="language-info">
                  <div className="language-title-row">
                    <h3>{language.name}</h3>
                    <span className="vote-count" aria-live="polite">{language.votes}</span>
                  </div>
                  <div
                    aria-label={`${percentage}% of votes`}
                    className="vote-track"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={percentage}
                  >
                    <span className={`vote-fill vote-fill-${index}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                <button
                  aria-label={`Vote for ${language.name}`}
                  className="button vote-button"
                  onClick={() => voteForLanguage(language.name)}
                  type="button"
                >
                  Click Here
                </button>
              </article>
            );
          })}
        </div>
        <p className="poll-footer">Votes update instantly. Thanks for participating!</p>
      </section>
    </main>
  );
}

export default App;