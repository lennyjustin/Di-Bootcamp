import { useState } from 'react';
import Input from './Input.js';

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
  if (!values.phone.trim()) {
    errors.phone = 'Phone is required.';
  } else if (!phonePattern.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}

function Form() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedValues, setSubmittedValues] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setSubmittedValues(null);
    if (hasSubmitted) setErrors(validate(nextValues));
  };

  const handleBlur = () => {
    if (hasSubmitted) setErrors(validate(values));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setHasSubmitted(true);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmittedValues(values);
  };

  return (
    <section className="form-panel">
      <div className="panel-heading">
        <span className="step-number">01</span>
        <div>
          <p className="panel-kicker">Custom validation</p>
          <h2>Contact details</h2>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input label="First Name" name="firstName" value={values.firstName} error={errors.firstName} onChange={handleChange} onBlur={handleBlur} />
          <Input label="Last Name" name="lastName" value={values.lastName} error={errors.lastName} onChange={handleChange} onBlur={handleBlur} />
          <Input label="Phone" name="phone" value={values.phone} error={errors.phone} onChange={handleChange} onBlur={handleBlur} />
          <Input label="Email" name="email" value={values.email} error={errors.email} onChange={handleChange} onBlur={handleBlur} />
        </div>

        <button className="button button-primary" type="submit">Submit</button>
      </form>

      {submittedValues && (
        <p className="success-message" role="status">
          Thanks, {submittedValues.firstName}! Your details are valid.
        </p>
      )}
    </section>
  );
}

export default Form;