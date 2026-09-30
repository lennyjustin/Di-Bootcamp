(() => {
  const form = document.querySelector('form');
  const fields = [...form.querySelectorAll('[required]')];
  const submit = document.querySelector('#submit-button');
  const message = document.querySelector('#message');
  const isRegister = form.id === 'register-form';

  function updateButton() {
    submit.disabled = !fields.every((field) => field.value.trim() !== '' && field.checkValidity());
  }

  fields.forEach((field) => field.addEventListener('input', updateButton));
  updateButton();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateButton();
    if (submit.disabled) return;
    submit.disabled = true;
    const originalText = isRegister ? 'Register' : 'Login';
    submit.textContent = isRegister ? 'Registering…' : 'Logging in…';
    message.textContent = '';
    message.className = 'message';
    try {
      const response = await fetch(isRegister ? '/register' : '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed.');
      message.className = 'message success';
      message.textContent = result.message;
      if (isRegister) {
        form.reset();
        updateButton();
      }
    } catch (error) {
      message.className = 'message error';
      message.textContent = error.message;
    } finally {
      submit.textContent = originalText;
      updateButton();
    }
  });
})();
