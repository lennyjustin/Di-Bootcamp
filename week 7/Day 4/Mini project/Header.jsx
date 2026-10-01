import React from 'react';

function Header() {
  return (
    <header className="company-header">
      <nav className="navbar company-navbar" aria-label="Main navigation">
        <div className="container-fluid justify-content-center">
          <a className="navbar-brand" href="#top" aria-label="Company home">
            Company
          </a>
        </div>
      </nav>
      <p>We specialise in something ...</p>
    </header>
  );
}

export default Header;
