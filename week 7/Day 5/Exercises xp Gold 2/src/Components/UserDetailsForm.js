import { useState } from 'react';

const initialValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
};

function validate(values) {
  const errors = {};
  const phonePattern = /^\+?(?:\d[\s().-]*){7,15}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!values.phone.trim()) errors.phone = 'Phone is required.';
  else if (!phonePattern.test(values.phone.trim())) errors.phone = 'Enter a valid phone number.';
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!emailPattern.test(values.email.trim())) errors.email = 'Enter a valid email address.';

  return errors;
}

function UserDetailsForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (hasSubmitted) setErrors(validate(nextValues));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmittedData({ ...values });
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setSubmittedData(null);
    setHasSubmitted(false);
  };

  return submittedData ? (
    <div className="user-summary">
      <div className="summary-avatar" aria-hidden="true">
        {submittedData.firstName.charAt(0).toUpperCase()}{submittedData.lastName.charAt(0).toUpperCase()}
      </div>
      <h3>{submittedData.firstName} {submittedData.lastName}</h3>
      <dl className="summary-details">
        <div><dt>Phone</dt><dd>{submittedData.phone}</dd></div>
        <div><dt>Email</dt><dd>{submittedData.email}</dd></div>
      </dl>
      <button className="button button-secondary" onClick={resetForm} type="button">Reset form</button>
    </div>
  ) : (
    <form className="form-grid" noValidate onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="first-name">First name</label>
        <input aria-invalid={Boolean(errors.firstName)} id="first-name" name="firstName" onChange={handleChange} value={values.firstName} />
        {errors.firstName && <p className="field-error">{errors.firstName}</p>}
      </div>
      <div className="field-group">
        <label htmlFor="last-name">Last name</label>
        <input aria-invalid={Boolean(errors.lastName)} id="last-name" name="lastName" onChange={handleChange} value={values.lastName} />
        {errors.lastName && <p className="field-error">{errors.lastName}</p>}
      </div>
      <div className="field-group">
        <label htmlFor="phone">Phone</label>
        <input aria-invalid={Boolean(errors.phone)} autoComplete="tel" id="phone" name="phone" onChange={handleChange} type="tel" value={values.phone} />
        {errors.phone && <p className="field-error">{errors.phone}</p>}
      </div>
      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input aria-invalid={Boolean(errors.email)} autoComplete="email" id="email" name="email" onChange={handleChange} type="email" value={values.email} />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
      <div className="form-actions">
        <button className="button button-primary" type="submit">Submit details</button>
      </div>
    </form>
  );
}

export default UserDetailsForm;