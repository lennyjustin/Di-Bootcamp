import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Card({ title, children, icon, shaded = false }) {
  return (
    <section className={`company-row${shaded ? ' company-row-shaded' : ''}`}>
      <div className="company-row-inner">
        <div className="company-icon" aria-hidden="true">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="company-copy">
          <h2>{title}</h2>
          <p>{children}</p>
        </div>
      </div>
    </section>
  );
}

export default Card;
