(() => {
  const form = document.querySelector('[data-required-form]');
  const submitButton = document.querySelector('#submit-button');
  const message = document.querySelector('#form-message');
  const fields = [...form.querySelectorAll('[required]')];

  function updateButton() {
    submitButton.disabled = !fields.every((field) => field.value.trim() && field.checkValidity());
  }

  fields.forEach((field) => field.addEventListener('input', updateButton));
  updateButton();

  document.querySelector('.show-password').addEventListener('click', (event) => {
    const password = document.querySelector('#password');
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    event.currentTarget.textContent = showing ? 'SHOW' : 'HIDE';
    event.currentTarget.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateButton();
    if (submitButton.disabled) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const isRegister = form.id === 'register-form';
    const endpoint = isRegister ? '/register' : '/login';
    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = isRegister ? 'Creating account…' : 'Signing in…';
    message.className = 'form-message';
    message.textContent = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');
      message.className = 'form-message success';
      message.textContent = result.message;
      form.reset();
      if (isRegister) {
        setTimeout(() => { window.location.href = '/login.html'; }, 1400);
      }
    } catch (error) {
      message.className = 'form-message error';
      message.textContent = error.message;
    } finally {
      submitButton.querySelector('span').textContent = isRegister ? 'Create account' : 'Sign in';
      updateButton();
    }
  });
})();
