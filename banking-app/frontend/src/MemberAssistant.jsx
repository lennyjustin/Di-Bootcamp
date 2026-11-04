import React, { useState } from 'react';
import { apiRequest } from './api.js';

export default function MemberAssistant() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submitQuestion(event) {
    event.preventDefault();
    const question = message.trim();
    if (!question || !consent || busy) return;

    setBusy(true);
    setError('');
    setMessage('');
    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: question }]);
    try {
      const result = await apiRequest('/member-portal/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: question, history }),
      });
      setMessages((current) => [...current, { role: 'assistant', content: result.answer }]);
    } catch (requestError) {
      setMessages((current) => current.slice(0, -1));
      setMessage(question);
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel member-assistant" aria-labelledby="member-assistant-title">
      <div className="panel-head">
        <div>
          <h2 id="member-assistant-title">AI member assistant</h2>
          <p className="muted">Ask about your savings, loan status, or recent account activity.</p>
        </div>
      </div>

      <div className="assistant-privacy-note">
        This assistant uses Azure OpenAI. If you agree, your question and limited account details (balances,
        loan status, and recent transaction types, amounts, and dates) are sent to Azure to prepare an answer.
        Your name, contact details, account identifiers, and transaction references are not sent. Messages
        are not saved by this app. Never enter a password, PIN, or one-time code.
      </div>

      <label className="assistant-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={busy}
        />
        <span>I agree to share this limited account information with Azure OpenAI for my answers.</span>
      </label>

      <div className="assistant-messages" aria-live="polite">
        {!messages.length && <p className="assistant-empty">Your conversation will appear here. Answers are informational; contact your SACCO for official decisions or account changes.</p>}
        {messages.map((item, index) => (
          <div className={`assistant-message assistant-message-${item.role}`} key={`${index}-${item.role}`}>
            <strong>{item.role === 'user' ? 'You' : 'Assistant'}</strong>
            <p>{item.content}</p>
          </div>
        ))}
        {busy && <div className="assistant-empty" role="status">Preparing an answer…</div>}
      </div>

      {error && <div className="alert error-alert" role="alert">{error}</div>}
      <form className="assistant-form" onSubmit={submitQuestion}>
        <label className="form-field" htmlFor="assistant-question">Your question</label>
        <textarea
          id="assistant-question"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="For example: What is my current outstanding loan balance?"
          disabled={!consent || busy}
          required
        />
        <div className="assistant-form-footer">
          <small>{message.length}/1000</small>
          <button className="primary-button" type="submit" disabled={!consent || !message.trim() || busy}>
            {busy ? 'Sending…' : 'Ask assistant'}
          </button>
        </div>
      </form>
    </section>
  );
}
