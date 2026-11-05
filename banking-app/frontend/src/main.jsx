import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ManagementPage from './ManagementPage.jsx';
import MemberPortal from './MemberPortal.jsx';
import { ChangePassword } from './MemberPortal.jsx';
import LandingPage from './LandingPage.jsx';
import MembershipApplications from './MembershipApplications.jsx';
import MobilePayments from './MobilePayments.jsx';
import CreditPortfolio from './CreditPortfolio.jsx';
import StaffAccess from './StaffAccess.jsx';
import AuditTrail from './AuditTrail.jsx';
import BoardOverview from './BoardOverview.jsx';
import Icon from './Icon.jsx';
import { apiRequest, currency, dateTime } from './api.js';
import './index.css';

const navItems = ['Dashboard', 'Board overview', 'Members', 'Savings', 'Loans', 'Shares & dividends', 'Transactions', 'Portfolio insights', 'Reports', 'Membership applications', 'Mobile payments', 'Credit portfolio', 'Staff access', 'Activity report'];
const pagePermissions = {
  Dashboard: 'dashboard.read',
  'Board overview': 'portfolio.summary',
  Members: 'members.read',
  Savings: 'savings.read',
  Loans: 'loans.read',
  'Shares & dividends': 'shares.report',
  Transactions: 'transactions.read',
  'Portfolio insights': 'dashboard.read',
  Reports: 'reports.read',
  'Membership applications': 'applications.manage',
  'Mobile payments': 'payments.read',
  'Credit portfolio': 'loans.analytics',
  'Staff access': 'staff.read',
  'Activity report': 'audit.read',
};

function hasPermission(user, permission) {
  return user?.role === 'super_admin'
    || user?.permissions?.includes('*')
    || user?.permissions?.includes(permission);
}

function homePageForUser(user) {
  return Object.entries(pagePermissions).find(([, permission]) => hasPermission(user, permission))?.[0] || 'Dashboard';
}

function Login({ onLogin, onBack, onSignUp, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, accountType }),
      });
      onLogin(result.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <button type="button" className="login-back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> Back to SaccoBanking</button>
        <div className="auth-brand">
          <div className="brand-logo">S</div>
          <div className="brand-text">Sacco<span>Banking</span><small>Secure account sign in</small></div>
        </div>
        <h1>Welcome back</h1>
        <p>Staff use the account provided by the SACCO. Members can use the email and password from an approved membership application, or the portal credentials provided by staff.</p>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        <label className="form-field">
          Account type
          <select value={accountType} onChange={(event) => setAccountType(event.target.value)} required>
            <option value="staff">Staff</option>
            <option value="admin">Administrator</option>
            <option value="super_admin">Super administrator</option>
            <option value="member">Member</option>
          </select>
        </label>
        <label className="form-field">
          Email address
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
          />
        </label>
        <label className="form-field">
          Password
          <span className="password-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={128}
            />
            <button type="button" className="password-visibility" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </span>
        </label>
        <button type="button" className="forgot-password-link" onClick={onForgotPassword}>Forgot password?</button>
        <button className="primary-button sign-in-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <small className="auth-footnote">Administrator accounts are created using the backend setup command.</small>
        <button type="button" className="auth-switch-button" onClick={onSignUp}>New member? Create an account</button>
      </form>
    </main>
  );
}

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <button type="button" className="login-back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> Back to sign in</button>
        <h1>Reset your password</h1>
        <p>Enter the email address linked to your account. If it is active, we’ll email a reset link.</p>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        {message && <div className="alert signup-notice" role="status">{message}</div>}
        <label className="form-field">Email address
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
        </label>
        <button className="primary-button sign-in-button" type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </main>
  );
}

function ResetPassword({ token, onComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const password = fields.get('password');
    if (password !== fields.get('confirmPassword')) {
      setError('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      form.reset();
      onComplete();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <h1>Choose a new password</h1>
        <p>Use at least 12 characters. Reset links expire after 30 minutes.</p>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        <label className="form-field">New password
          <span className="password-input-wrap">
            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={72} required />
            <button type="button" className="password-visibility" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </span>
        </label>
        <label className="form-field">Confirm new password
          <input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={72} required />
        </label>
        <button className="primary-button sign-in-button" type="submit" disabled={submitting}>
          {submitting ? 'Updating…' : 'Reset password'}
        </button>
      </form>
    </main>
  );
}

function MemberSignUp({ onSignIn, onBack, staffMode = false }) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [membershipType, setMembershipType] = useState('open');
  const [employmentStatus, setEmploymentStatus] = useState('employed');
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const latestAdultBirthDate = new Date();
  latestAdultBirthDate.setFullYear(latestAdultBirthDate.getFullYear() - 18);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const password = fields.get('password');
    if (password !== fields.get('confirmPassword')) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      fields.delete('confirmPassword');
      const result = await apiRequest('/membership-applications', {
        method: 'POST',
        body: fields,
      });
      form.reset();
      setSubmittedApplication(result.application);
    } catch (requestError) {
      const validationDetails = requestError.errors?.map(({ field, message }) => `${field}: ${message}`).join(' ');
      setError(validationDetails ? `${requestError.message} ${validationDetails}` : requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedApplication) {
    return (
      <main className="auth-screen">
        <section className="auth-card signup-card">
          <div className="auth-brand">
            <div className="brand-logo">S</div>
            <div className="brand-text">Sacco<span>Banking</span><small>Application submitted</small></div>
          </div>
          <h1>Application received</h1>
          <p>
            Your membership application is waiting for SACCO administrator review. No member or savings account is active until it is approved.
            {' '}{staffMode
              ? 'After approval, the applicant can sign in using the email and password entered on the form.'
              : 'After approval, sign in using the email and password entered on this form.'}
          </p>
          <div className="alert signup-notice" role="status">
            Reference: <strong>{submittedApplication.id}</strong><br />
            No membership, savings account, or portal access is active yet. No financial contribution is being collected with this application.
          </div>
          <button type="button" className="primary-button sign-in-button" onClick={onBack}>{staffMode ? 'Return to management' : 'Return to SaccoBanking'}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <form className="auth-card signup-card" onSubmit={handleSubmit}>
        <button type="button" className="login-back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> {staffMode ? 'Back to management' : 'Back to SaccoBanking'}</button>
        <div className="auth-brand">
          <div className="brand-logo">S</div>
          <div className="brand-text">Sacco<span>Banking</span><small>Membership application</small></div>
        </div>
        <h1>Apply to become a member</h1>
        <p>Complete each section and upload the required documents. Applications are reviewed before membership is activated. Already a member? Sign in to your existing account instead of applying again.</p>
        <div className="application-section">
          <h2>1. Member registration</h2>
          <div className="application-grid">
            <label className="form-field">Full legal name
              <input name="fullName" autoComplete="name" minLength={2} maxLength={120} required />
            </label>
            <label className="form-field">Date of birth (18 or older)
              <input name="dateOfBirth" type="date" max={latestAdultBirthDate.toISOString().slice(0, 10)} required />
            </label>
            <label className="form-field">Email address
              <input name="email" type="email" autoComplete="email" maxLength={254} required />
            </label>
            <label className="form-field">Phone number
              <input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={20} required />
            </label>
            <label className="form-field">Citizenship
              <select name="citizenship" defaultValue="Kenyan" required>
                <option value="Kenyan">Kenyan citizen</option>
              </select>
            </label>
            <label className="form-field">Identification type
              <select name="identificationType" defaultValue="national_id" required>
                <option value="national_id">Kenyan national ID</option>
                <option value="passport">Kenyan passport</option>
              </select>
            </label>
            <label className="form-field">Identification number
              <input name="identificationNumber" autoComplete="off" minLength={4} maxLength={32} required />
            </label>
            <label className="form-field application-field-wide">Residential address
              <input name="address" autoComplete="street-address" minLength={5} maxLength={300} required />
            </label>
          </div>
        </div>

        <div className="application-section">
          <h2>2. Required documents</h2>
          <p className="application-help">PDF, JPEG, or PNG files up to 5 MB each. Passport photograph must be JPEG or PNG. Files are private and available only to SACCO administrators for review.</p>
          <div className="application-grid">
            <label className="form-field">Passport-size photograph
              <input name="passport" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" required />
            </label>
            <label className="form-field">KRA PIN
              <input name="kraPin" autoComplete="off" minLength={5} maxLength={20} required />
            </label>
            <label className="form-field">KRA PIN certificate/document
              <input name="kraPinDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required />
            </label>
            <label className="form-field">Citizenship identification document
              <input name="identificationDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required />
            </label>
          </div>
        </div>

        <div className="application-section">
          <h2>3. Membership type and eligibility</h2>
          <p className="application-help">Applicants must be at least 18 years old and provide Kenyan citizenship and valid identification.</p>
          <label className="form-field">Membership category
            <select name="membershipType" value={membershipType} onChange={(event) => setMembershipType(event.target.value)} required>
              <option value="open">Open membership</option>
              <option value="common_bond">Common bond membership</option>
            </select>
          </label>
          {membershipType === 'common_bond' && (
            <label className="form-field">Describe your common bond with the SACCO
              <input name="commonBondDetails" minLength={3} maxLength={300} required />
            </label>
          )}
        </div>

        <div className="application-section">
          <h2>4. Next of kin</h2>
          <div className="application-grid">
            <label className="form-field">Full name
              <input name="nextOfKinName" autoComplete="off" minLength={2} maxLength={120} required />
            </label>
            <label className="form-field">Relationship
              <input name="nextOfKinRelationship" minLength={2} maxLength={60} required />
            </label>
            <label className="form-field">Phone number
              <input name="nextOfKinPhone" type="tel" autoComplete="off" minLength={7} maxLength={20} required />
            </label>
          </div>
        </div>

        <div className="application-section">
          <h2>5. Income details</h2>
          <div className="application-grid">
            <label className="form-field">Employment status
              <select name="employmentStatus" value={employmentStatus} onChange={(event) => setEmploymentStatus(event.target.value)} required>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </label>
            <label className="form-field">Occupation or source of income
              <input name="occupation" minLength={2} maxLength={120} required />
            </label>
            {employmentStatus === 'employed' && (
              <label className="form-field">Employer
                <input name="employerName" maxLength={120} required />
              </label>
            )}
            <label className="form-field">Monthly income (KES)
              <input name="monthlyIncome" type="number" min="0" max="999999999999999" step="1" required />
            </label>
          </div>
        </div>

        <div className="application-section">
          <h2>6. Membership application</h2>
          <label className="form-field">Why would you like to join this SACCO?
            <textarea name="applicationStatement" rows="4" minLength={20} maxLength={1000} required />
          </label>
          <div className="application-obligations">
            <strong>Financial obligations (amounts to be confirmed by the SACCO)</strong>
            <ul>
              <li>Entrance/registration fee: To be confirmed</li>
              <li>Share capital: Amount and payment terms to be confirmed</li>
              <li>Monthly contribution: Amount and schedule to be confirmed</li>
            </ul>
            No fee or contribution is charged or collected through this application.
          </div>
          <label className="application-consent">
            <input name="obligationsAcknowledged" type="checkbox" value="yes" required />
            <span>I understand that these financial terms are awaiting confirmation and that submitting this application does not charge me.</span>
          </label>
          <label className="application-consent">
            <input name="documentConsent" type="checkbox" value="yes" required />
            <span>I consent to the SACCO using and securely storing these details and documents for membership application review.</span>
          </label>
        </div>

        <div className="application-section">
          <h2>7. Create a password</h2>
          <p className="application-help">This password will be available for portal sign-in only after your application is approved.</p>
          <label className="form-field">Password
            <span className="password-input-wrap">
              <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={72} required />
              <button type="button" className="password-visibility" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </span>
            <small className="field-hint">Use at least 12 characters.</small>
          </label>
          <label className="form-field">Confirm password
            <span className="password-input-wrap">
              <input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={72} required />
              <button type="button" className="password-visibility" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </span>
          </label>
        </div>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        <button className="primary-button sign-in-button" type="submit" disabled={submitting}>
          {submitting ? 'Submitting application…' : 'Submit membership application'}
        </button>
        {!staffMode && <button type="button" className="auth-switch-button" onClick={onSignIn}>Already registered? Sign in</button>}
      </form>
    </main>
  );
}

function trendPoints(months, key) {
  const highest = Math.max(1, ...months.map((month) => month[key]));
  return months.map((month, index) => {
    const x = months.length < 2 ? 20 : 20 + (index * 380) / (months.length - 1);
    const y = 155 - (month[key] / highest) * 120;
    return `${x},${y}`;
  }).join(' ');
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState('Dashboard');
  const [search, setSearch] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest('/auth/session')
      .then(({ user: currentUser }) => {
        if (active) {
          setUser(currentUser);
          if (currentUser) setPage(homePageForUser(currentUser));
        }
      })
      .catch((requestError) => {
        if (active && requestError.status !== 401) setError(requestError.message);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setError('');
    try {
      const data = await apiRequest('/dashboard');
      setDashboard(data);
    } catch (requestError) {
      if (requestError.status === 401) setUser(null);
      setError(requestError.message);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasPermission(user, 'dashboard.read')) loadDashboard();
    else setDashboard(null);
  }, [user, loadDashboard]);

  useEffect(() => {
    if (user && !hasPermission(user, pagePermissions[page])) setPage(homePageForUser(user));
  }, [page, user]);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener('sacco:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('sacco:unauthorized', handleUnauthorized);
  }, []);

  async function signOut() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (authLoading) {
    return <main className="loading-screen"><div className="loading-indicator" />Checking secure session…</main>;
  }
  const resetToken = new URLSearchParams(window.location.search).get('resetToken');
  if (!user && resetToken) {
    return (
      <ResetPassword
        token={resetToken}
        onComplete={() => {
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
          setShowLogin(true);
        }}
      />
    );
  }
  if (!user && showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }
  if (showSignUp) {
    return (
      <MemberSignUp
        staffMode={Boolean(user)}
        onBack={() => setShowSignUp(false)}
        onSignIn={() => {
          setShowSignUp(false);
          if (!user) setShowLogin(true);
        }}
      />
    );
  }
  if (!user && !showLogin && !showSignUp) {
    return (
      <LandingPage
        onSignIn={() => { setShowSignUp(false); setShowLogin(true); }}
        onSignUp={() => { setShowLogin(false); setShowSignUp(true); }}
      />
    );
  }
  if (!user) {
    return (
      <Login
        onBack={() => setShowLogin(false)}
        onForgotPassword={() => setShowForgotPassword(true)}
        onSignUp={() => { setShowLogin(false); setShowSignUp(true); }}
        onLogin={(authenticatedUser) => {
          setError('');
          setShowLogin(false);
          setUser(authenticatedUser);
        }}
      />
    );
  }
  if (user.role === 'member') {
    return (
      <MemberPortal
        user={user}
        onSignOut={signOut}
        onPasswordChanged={() => setUser((currentUser) => ({ ...currentUser, passwordChangeRequired: false }))}
      />
    );
  }
  if (user.passwordChangeRequired) {
    return <ChangePassword onChanged={() => setUser((currentUser) => ({ ...currentUser, passwordChangeRequired: false }))} />;
  }

  const summary = dashboard?.summary || {};
  const portfolio = dashboard?.loanPortfolio || { active: 0, pending: 0, overdue: 0 };
  const totalLoans = portfolio.active + portfolio.pending + portfolio.overdue;
  const loanPercent = (value) => totalLoans ? Math.round((value / totalLoans) * 100) : 0;
  const trend = dashboard?.monthlyTrend || [];
  const stats = [
    { label: 'Total Members', value: summary.members || 0, delta: 'Active member accounts', tone: 'blue', icon: 'users' },
    { label: 'Total Savings', value: currency(summary.savings), delta: 'Across active accounts', tone: 'green', icon: 'wallet' },
    { label: 'Total Loans', value: currency(totalLoans), delta: `${summary.activeLoans || 0} active loans`, tone: 'blue', icon: 'chart' },
    { label: 'Total Shares', value: currency(summary.shares), delta: 'Member share value', tone: 'blue', icon: 'landmark' },
  ];
  const insightList = [
    {
      icon: 'alert',
      title: portfolio.overdue ? 'Loans need attention' : 'No overdue loans recorded',
      desc: portfolio.overdue ? `${currency(portfolio.overdue)} marked overdue or defaulted` : 'Portfolio has no loans marked overdue.',
      tone: portfolio.overdue ? 'amber' : 'green',
    },
    {
      icon: 'info',
      title: 'Loan portfolio',
      desc: `${loanPercent(portfolio.active)}% of recorded loan value is active.`,
      tone: 'blue',
    },
    {
      icon: 'trendingUp',
      title: 'Savings balance',
      desc: `${currency(summary.savings)} currently held in active accounts.`,
      tone: 'green',
    },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="brand-wrap brand-button" onClick={() => { setPage(homePageForUser(user)); setSearch(''); }} aria-label="SaccoBanking dashboard">
          <div className="brand-logo">S</div>
          <div className="brand-text">Sacco<span>Banking</span><small>Together We Grow</small></div>
        </button>
        <nav className="top-nav" aria-label="Primary navigation">
          {['Dashboard', 'Members', 'Savings', 'Loans'].filter((item) => hasPermission(user, pagePermissions[item])).map((item) => (
            <button key={item} type="button" className={`top-nav-item ${page === item ? 'active' : ''}`} onClick={() => { setPage(item); setSearch(''); }}>
              {item}
            </button>
          ))}
        </nav>
        <div className="topbar-tools">
          {hasPermission(user, 'members.read') && <div className="search-box">
            <Icon name="search" size={18} />
            <input
              type="search"
              placeholder="Search current list..."
              aria-label="Search current list"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                if (event.target.value) setPage((currentPage) => currentPage === 'Dashboard' ? 'Members' : currentPage);
              }}
            />
          </div>}
          <div className="header-actions">
            <div className="profile-pill">
              <div className="profile-avatar">{user.fullName?.charAt(0)?.toUpperCase() || 'A'}</div>
              <div><strong>{user.fullName}</strong><small>{user.role.replaceAll('_', ' ')}</small></div>
            </div>
            <button type="button" className="logout-button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <nav className="nav-list" aria-label="Sidebar navigation">
          {navItems.filter((item) => hasPermission(user, pagePermissions[item])).map((item) => (
            <button key={item} type="button" className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => { setPage(item); setSearch(''); }}>
              <span className="nav-icon"><Icon name={['grid', 'landmark', 'users', 'wallet', 'chart', 'landmark', 'arrows', 'sparkles', 'file', 'users', 'phone', 'chart', 'users', 'file'][navItems.indexOf(item)]} size={18} /></span>
              <span className="nav-label">{item}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <b>Secure workspace</b>
          <div>Financial data is stored in your configured SACCO database.</div>
        </div>
      </aside>

      <main className="main-panel">
        <div className="content-wrap">
          {page === 'Dashboard' ? (
            <>
          <section className="dashboard-hero">
            <div className="hero-copy">
              <div className="eyebrow">Your community. Your future.</div>
              <h1>Grow together.<br />Plan with confidence.</h1>
              <p>See your SACCO at a glance, support your members, and build a stronger financial future together.</p>
              <button type="button" className="hero-button" onClick={() => { setPage('Members'); setSearch(''); }}>
                Explore members <Icon name="arrowRight" size={17} />
              </button>
              <div className="hero-caption">A clearer view of your community's progress.</div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="hero-sun" />
              <div className="hero-hill hero-hill-back" />
              <div className="hero-hill hero-hill-front" />
              <div className="hero-growth-card">
                <span className="growth-icon"><Icon name="chart" size={17} /></span>
                <span>Community growth</span>
                <strong>{summary.members || 0} members</strong>
                <svg viewBox="0 0 210 62" preserveAspectRatio="none">
                  <path d="M0 52 C28 45 33 48 55 37 S88 44 108 28 S141 32 162 16 S189 20 210 5" />
                </svg>
              </div>
              <div className="hero-art-label">MICROSACCO · EST. TOGETHER</div>
            </div>
            <div className="hero-date">{new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(new Date())}</div>
          </section>

          {error && (
            <div className="alert error-alert dashboard-error" role="alert">
              <span>{error}</span>
              <button type="button" className="link-button" onClick={loadDashboard}>Retry</button>
            </div>
          )}
          {dashboardLoading && !dashboard && <div className="empty-state">Loading dashboard data…</div>}

          <section className="stats-grid" aria-label="SACCO overview">
            {stats.map((card) => (
              <article key={card.label} className={`stat-card ${card.tone}`}>
                <div className="stat-icon"><Icon name={card.icon} size={21} /></div>
                <label>{card.label}</label>
                <div className="stat-value">{card.value}</div>
                <div className="stat-delta">{card.delta}</div>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <article className="chart-panel panel">
              <div className="panel-head">
                <h2>Deposits vs Loan Disbursements</h2>
                <div className="legend">
                  <span><i className="legend-dot savings-dot" />Deposits</span>
                  <span><i className="legend-dot loans-dot" />Disbursements</span>
                </div>
              </div>
              <div className="chart-wrap">
                {trend.length ? (
                  <svg viewBox="0 0 420 180" role="img" aria-label="Monthly deposit and loan disbursement totals">
                    <g className="gridlines">
                      {[0, 1, 2, 3, 4].map((line) => <line key={line} x1="0" x2="420" y1={line * 36 + 14} y2={line * 36 + 14} />)}
                    </g>
                    <polyline points={trendPoints(trend, 'savings')} className="savings-line" />
                    <polyline points={trendPoints(trend, 'loans')} className="loans-line" />
                    {trend.map((month, index) => (
                      <text key={`${month.year}-${month.month}`} x={index * (380 / Math.max(trend.length - 1, 1)) + 20} y="174" className="axis-text">
                        {month.month}
                      </text>
                    ))}
                  </svg>
                ) : <div className="empty-state">No transactions recorded yet.</div>}
              </div>
            </article>

            <article className="donut-panel panel">
              <div className="panel-head"><h2>Loan Portfolio Status</h2></div>
              <div className="donut-layout">
                <div
                  className="donut-chart"
                  style={{
                    '--active-share': `${loanPercent(portfolio.active)}%`,
                    '--pending-share': `${loanPercent(portfolio.pending)}%`,
                  }}
                >
                  <div className="donut-center">
                    <div className="donut-total">{currency(totalLoans)}</div>
                    <div className="donut-label">Loan value</div>
                  </div>
                </div>
                <ul className="risk-list">
                  {[
                    { label: 'Active', amount: portfolio.active, color: 'green' },
                    { label: 'Pending', amount: portfolio.pending, color: 'orange' },
                    { label: 'Overdue', amount: portfolio.overdue, color: 'red' },
                  ].map((item) => (
                    <li key={item.label}>
                      <span className={`risk-swatch ${item.color}`} />
                      <div><strong>{item.label}</strong><small>{currency(item.amount)}</small></div>
                      <b>{loanPercent(item.amount)}%</b>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel transaction-panel">
              <div className="panel-head row-head"><h2>Recent Transactions</h2></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Member</th><th>Type</th><th>Amount</th><th>Balance</th></tr></thead>
                  <tbody>
                    {(dashboard?.recentTransactions || []).map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{dateTime(transaction.createdAt)}</td>
                        <td className="member-name">{transaction.member}</td>
                        <td>{transaction.type.replaceAll('_', ' ')}</td>
                        <td>{currency(transaction.amount)}</td>
                        <td>{transaction.balanceAfter === null ? '—' : currency(transaction.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!dashboardLoading && dashboard?.recentTransactions?.length === 0 && <div className="empty-state">No transactions yet.</div>}
              </div>
            </article>

            <aside className="stack-panel">
              <article className="panel insights-panel">
                <div className="panel-head row-head"><h2>Portfolio Insights</h2><span className="read-only-pill">Rule-based</span></div>
                <div className="insight-list">
                  {insightList.map((item) => (
                    <div key={item.title} className="insight-item">
                      <div className={`insight-bubble ${item.tone}`}><Icon name={item.icon} size={17} /></div>
                      <div><b>{item.title}</b><p>{item.desc}</p></div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="panel lower-panel">
                <div className="panel-head row-head"><h2>Loan Summary</h2></div>
                <div className="loan-summary">
                  {[
                    ['Active loans', currency(portfolio.active)],
                    ['Pending applications', currency(portfolio.pending)],
                    ['Overdue loans', currency(portfolio.overdue)],
                    ['Members with active loans', summary.activeLoans || 0],
                  ].map(([label, value]) => (
                    <div key={label} className="summary-row"><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
              </article>
            </aside>
          </section>

          <section className="footer-grid">
            <article className="panel quick-member-panel">
              <div className="panel-head row-head"><h2>Recent Members</h2></div>
              <div className="table-wrap compact-table">
                <table>
                  <thead><tr><th>Member No.</th><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
                  <tbody>
                    {(dashboard?.recentMembers || []).map((member) => (
                      <tr key={member.memberNo}>
                        <td>{member.memberNo}</td><td>{member.fullName}</td><td>{member.phone}</td>
                        <td><span className={`status-badge status-${member.status}`}>{member.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!dashboardLoading && dashboard?.recentMembers?.length === 0 && <div className="empty-state">No members registered yet.</div>}
              </div>
            </article>

            <article className="panel mpesa-panel">
              <div className="panel-head row-head">
                <h2>M-Pesa Integration</h2>
                <span className={`connection-pill ${dashboard?.darajaEnabled ? 'connected' : 'disconnected'}`}>{dashboard?.darajaEnabled ? 'Configured' : 'Not configured'}</span>
              </div>
              <div className="mpesa-card">
                <div className="mpesa-icon">MP</div>
                <div><strong>Daraja payments</strong><p>{dashboard?.darajaEnabled ? 'Members can initiate STK Push payments in their portal.' : 'Configure sandbox credentials and a public HTTPS callback to enable member STK Push.'}</p></div>
              </div>
              <div className="mpesa-amounts">
                {dashboard?.latestMpesa
                  ? <div><small>Last recorded payment</small><strong>{currency(dashboard.latestMpesa.amount)}</strong><em>{dashboard.latestMpesa.phoneNumber || ''} · {dateTime(dashboard.latestMpesa.createdAt)}</em></div>
                  : <div><small>No M-Pesa payments recorded</small><strong>—</strong></div>}
                <button type="button" className="primary-button" disabled title="Members initiate payments from the member portal after Daraja setup">Member-initiated STK</button>
              </div>
              <div className="mpesa-exceptions">
                <strong>Payments requiring reconciliation</strong>
                {(dashboard?.mpesaExceptions || []).length ? dashboard.mpesaExceptions.map((item) => (
                  <div className="mpesa-exception" key={item.id}>
                    <span>{item.member?.memberNo || 'Member'} · {item.purpose.replaceAll('_', ' ')} · {item.status}</span>
                    <b>{currency(item.amount)}</b>
                    <small>{item.resultDescription || 'Manual reconciliation required'} · {item.phoneNumber || 'phone unavailable'}</small>
                  </div>
                )) : <small>No payment exceptions.</small>}
              </div>
            </article>
          </section>
            </>
          ) : page === 'Board overview' ? <BoardOverview />
            : page === 'Staff access' ? <StaffAccess user={user} />
              : page === 'Activity report' ? <AuditTrail />
                : page === 'Membership applications' ? <MembershipApplications />
                  : page === 'Mobile payments' ? <MobilePayments />
                    : page === 'Credit portfolio' ? <CreditPortfolio />
                      : <ManagementPage page={page} search={search} onChanged={loadDashboard} onAddMember={() => setShowSignUp(true)} user={user} />
          }
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
