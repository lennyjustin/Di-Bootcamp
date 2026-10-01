import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLocationDot, faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';

function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="contact-panel" aria-labelledby="contact-heading">
      <h2 id="contact-heading">Contact us</h2>
      <div className="contact-layout">
        <div className="contact-details">
          <p className="contact-intro">Contact us and we will get back to you within 24 hours.</p>
          <address>
            <span><FontAwesomeIcon icon={faLocationDot} aria-hidden="true" /> Company Name</span>
            <a href="tel:+256778800900"><FontAwesomeIcon icon={faMobileScreenButton} aria-hidden="true" /> +256 778 800 900</a>
            <a href="mailto:company.gmail.com"><FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /> company.gmail.com</a>
          </address>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-email">Contact</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="email address"
            autoComplete="email"
            required
          />
          <textarea
            name="comment"
            aria-label="Comment"
            placeholder="comment"
            rows="6"
            required
          />
          <button className="btn contact-submit" type="submit">Send</button>
          {sent && <p className="contact-success" role="status">Thanks! Your message is ready to send.</p>}
        </form>
      </div>
    </section>
  );
}

export default Contact;
