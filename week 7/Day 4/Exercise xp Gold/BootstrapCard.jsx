import React from 'react';

function BootstrapCard({ title, imageUrl, buttonLabel, buttonUrl, description }) {
  return (
    <div className="card m-3" style={{ width: '30rem', maxWidth: '100%' }}>
      <img className="card-img-top" src={imageUrl} alt={`${title} portrait`} />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <a className="btn btn-primary" href={buttonUrl} target="_blank" rel="noreferrer">
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}

export default BootstrapCard;