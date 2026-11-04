import React from 'react';
import Icon from './Icon.jsx';

const features = [
  {
    number: '01',
    icon: 'users',
    title: 'Member management',
    description: 'Keep membership details, contact information, KYC records, and account status in one organized place.',
    tone: 'blue',
  },
  {
    number: '02',
    icon: 'wallet',
    title: 'Savings and statements',
    description: 'Review savings balances and account activity, with staff-controlled deposits and withdrawals.',
    tone: 'green',
  },
  {
    number: '03',
    icon: 'chart',
    title: 'Responsible lending',
    description: 'Receive loan applications, review requests, record decisions, and track repayments.',
    tone: 'purple',
  },
  {
    number: '04',
    icon: 'landmark',
    title: 'Shares and dividends',
    description: 'Review recorded member share holdings. Share purchases and dividend processing are not enabled.',
    tone: 'orange',
  },
  {
    number: '05',
    icon: 'file',
    title: 'Reports and analytics',
    description: 'Review savings, loan repayments, balances, and recorded account activity.',
    tone: 'teal',
  },
  {
    number: '06',
    icon: 'phone',
    title: 'M-Pesa Daraja',
    description: 'Let members request STK Push prompts for savings deposits and loan repayments.',
    tone: 'green',
  },
];

function LandingPage({ onSignIn, onSignUp }) {
  return (
    <div className="landing-site">
      <header className="landing-header">
        <a className="landing-brand" href="#home" aria-label="SaccoBanking home">
          <span className="brand-logo">S</span>
          <span className="brand-text">Sacco<span>Banking</span><small>Financial management, together</small></span>
        </a>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#platform">Features</a>
          <a href="#payments">M-Pesa</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="landing-auth-actions">
          <button type="button" className="landing-signup" onClick={onSignUp}>Become a member</button>
          <button type="button" className="landing-signin" onClick={onSignIn}>Sign in <Icon name="arrowUpRight" size={16} /></button>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero-copy">
            <div className="landing-kicker"><span /> AI-POWERED SACCO MANAGEMENT</div>
            <h1>Manage your SACCO<br />smarter, <span>faster,</span> safer.</h1>
            <p>
              A clear digital workspace for member services, savings, lending, shares, and everyday SACCO operations.
              Help your team spend less time chasing records and more time serving your community.
            </p>
            <div className="landing-hero-actions">
              <button type="button" className="landing-primary" onClick={onSignUp}>Get started <Icon name="arrowRight" size={17} /></button>
              <a className="landing-secondary" href="#platform"><span className="play-mark"><Icon name="play" size={14} /></span> Explore features</a>
            </div>
            <div className="landing-trust-note">
              <span className="trust-mark"><Icon name="shield" size={14} /></span>
              Secure staff and member access, managed by your SACCO.
            </div>
          </div>

          <div className="landing-visual" aria-label="SaccoBanking member and finance dashboard illustration">
            <div className="visual-scene-glow" />
            <div className="visual-community" aria-hidden="true">
              <div className="community-sun" />
              <div className="community-hill hill-back" />
              <div className="community-hill hill-front" />
              <div className="community-building"><i /><i /><i /></div>
              <div className="community-person person-one"><i /></div>
              <div className="community-person person-two"><i /></div>
              <div className="community-person person-three"><i /></div>
            </div>
            <div className="glass-access-card">
              <div className="glass-card-heading">
                <span className="glass-lock"><Icon name="lock" size={19} /></span>
                <span><b>Your SACCO workspace</b><small>One secure place to move forward</small></span>
              </div>
              <div className="glass-card-divider" />
              <div className="access-list">
                <span><i><Icon name="check" size={13} /></i> Member records</span>
                <span><i><Icon name="check" size={13} /></i> Savings and lending</span>
                <span><i><Icon name="check" size={13} /></i> Clear account activity</span>
              </div>
              <button type="button" className="glass-access-button" onClick={onSignIn}>Sign in to your account <Icon name="arrowRight" size={17} /></button>
              <small className="access-caption">Access provided by your SACCO administrator</small>
            </div>
            <div className="visual-float float-members"><span><Icon name="users" size={17} /></span><b>Member-first</b></div>
            <div className="visual-float float-growth"><span><Icon name="sparkles" size={17} /></span><b>Community growth</b></div>
          </div>
        </section>

        <section className="landing-proof" aria-label="Platform focus">
          <span>EVERYDAY SACCO OPERATIONS, CONNECTED</span>
          <div><b>Members</b><i /> <b>Savings</b><i /> <b>Loans</b><i /> <b>Transparency</b><i /> <b>Community</b></div>
        </section>

        <section className="landing-platform" id="platform">
          <div className="landing-section-heading">
            <div className="landing-kicker"><span /> THE PLATFORM</div>
            <h2>Everything your SACCO needs<br />to serve members well.</h2>
            <p>Bring everyday records and member services into one practical, easy-to-follow workspace.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article className="landing-feature" key={feature.number}>
                <div className="feature-topline">
                  <span className={`feature-icon ${feature.tone}`}><Icon name={feature.icon} size={20} /></span>
                  <span className="feature-number">{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-accent" />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-payments" id="payments" aria-labelledby="landing-payments-title">
          <div className="landing-payments-copy">
            <div className="landing-kicker"><span /> M-PESA · DARAJA STK PUSH</div>
            <h2 id="landing-payments-title">Simple deposits.<br />Confirmed repayments.</h2>
            <p>Members can request a secure payment prompt from their portal for savings deposits or active loan repayments.</p>
            <ol className="payment-steps">
              <li><span>1</span><div><b>Choose what to pay</b><small>Select a savings account or active loan.</small></div></li>
              <li><span>2</span><div><b>Approve on your phone</b><small>Enter your M-Pesa PIN only in the official prompt.</small></div></li>
              <li><span>3</span><div><b>Wait for confirmation</b><small>Your account updates after Daraja confirms the payment.</small></div></li>
            </ol>
            <button type="button" className="landing-primary" onClick={onSignIn}>
              Sign in to make a payment <Icon name="arrowRight" size={17} />
            </button>
            <small className="landing-payment-note">Requires Daraja credentials and a public HTTPS callback configured by your SACCO.</small>
          </div>
          <div className="payment-phone-scene" aria-label="Illustration of a pending M-Pesa payment request">
            <div className="payment-phone">
              <div className="payment-phone-top"><span>‹</span><b>Payment request</b><span>•••</span></div>
              <div className="payment-phone-brand"><span className="payment-mpesa-mark">M</span><b>M-PESA</b></div>
              <small className="payment-phone-label">AMOUNT TO PAY</small>
              <strong className="payment-phone-amount">KES 2,000</strong>
              <div className="payment-phone-divider" />
              <div className="payment-phone-detail"><span>Payment for</span><b>Savings deposit</b></div>
              <div className="payment-phone-detail"><span>Account</span><b>•••• 4021</b></div>
              <div className="payment-phone-pending"><i /> Awaiting phone approval</div>
              <div className="payment-phone-caption">Account updates after payment confirmation</div>
            </div>
            <div className="payment-orbit payment-orbit-one" />
            <div className="payment-orbit payment-orbit-two" />
            <div className="payment-float payment-float-secure"><span><Icon name="shield" size={15} /></span> Callback verified</div>
            <div className="payment-float payment-float-ledger"><span><Icon name="chart" size={15} /></span> Ledger reconciled</div>
          </div>
        </section>

        <section className="landing-flow" id="how-it-works">
          <div className="flow-copy">
            <div className="landing-kicker"><span /> A SIMPLE, SHARED WORKFLOW</div>
            <h2>From member onboarding<br />to a clearer next step.</h2>
            <p>Give staff the tools to manage records and members a dedicated place to follow their own activity.</p>
            <button type="button" className="landing-primary" onClick={onSignIn}>
              Continue to sign in <Icon name="arrowRight" size={17} />
            </button>
          </div>
          <div className="flow-steps">
            <article><span className="flow-step-number">01</span><div><b>Build the member record</b><p>Register a member and connect their savings account.</p></div><span className="flow-step-icon"><Icon name="users" size={20} /></span></article>
            <article><span className="flow-step-number">02</span><div><b>Record and review activity</b><p>Keep transactions, savings, and loan requests organized.</p></div><span className="flow-step-icon"><Icon name="arrows" size={20} /></span></article>
            <article><span className="flow-step-number">03</span><div><b>Keep members informed</b><p>Provide personal account visibility through the member portal.</p></div><span className="flow-step-icon"><Icon name="sparkles" size={20} /></span></article>
          </div>
        </section>

        <section className="landing-about" id="about">
          <div className="about-mark">“</div>
          <div>
            <div className="landing-kicker"><span /> BUILT AROUND COOPERATION</div>
            <h2>Finance works better<br />when everyone can see their part.</h2>
            <p>SaccoBanking brings the essential building blocks of SACCO management into a clear digital experience—while keeping financial decisions and account actions under staff control.</p>
          </div>
          <button type="button" className="about-signin" onClick={onSignIn}>Enter the workspace <Icon name="arrowUpRight" size={16} /></button>
        </section>

        <section className="landing-disclaimer">
          <span className="disclaimer-icon"><Icon name="info" size={18} /></span>
          <p>
            <b>A development and portfolio project.</b> This website is not a licensed bank or production-ready financial service.
            M-Pesa STK Push is available only after a SACCO administrator configures Daraja credentials and a public HTTPS callback.
            Payments are posted to accounts only after provider confirmation. Use fictional data until security, operational, and regulatory controls are independently reviewed.
          </p>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home">
          <span className="brand-logo">S</span>
          <span className="brand-text">Sacco<span>Banking</span><small>Together we grow</small></span>
        </a>
        <span>Built for cooperative progress.</span>
        <button type="button" className="footer-signin" onClick={onSignIn}>Member & staff sign in <Icon name="arrowRight" size={17} /></button>
      </footer>
    </div>
  );
}

export default LandingPage;
