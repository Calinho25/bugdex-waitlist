document.documentElement.classList.add('js-enabled');

const messages = {
  success: "You’re on the list. We’ll let you know when Bugdex is ready to explore.",
  duplicate: "You’re already on the waitlist. We’ll be in touch when early access opens.",
  invalid: "Enter a valid email address to join the waitlist.",
  error: "Something went wrong while joining the waitlist. Please try again in a moment."
};

const waitlistForms = document.querySelectorAll('[data-waitlist-form]');

function setFormState(form, state, message = '') {
  const button = form.querySelector('button[type="submit"]');
  const emailInput = form.querySelector('input[type="email"]');
  const messageElement = form.querySelector('[data-form-message]');

  form.classList.toggle('is-loading', state === 'loading');
  button.disabled = state === 'loading';
  emailInput.disabled = state === 'loading';

  messageElement.textContent = message;
  messageElement.className = 'form-message';

  if (message) {
    messageElement.classList.add('is-visible', state === 'error' ? 'is-error' : 'is-success');
  }
}

function replaceWithConfirmation(form, message) {
  const confirmation = document.createElement('div');
  confirmation.className = 'form-confirmation';
  confirmation.setAttribute('role', 'status');
  confirmation.textContent = message;
  form.replaceWith(confirmation);
}

waitlistForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const honeypot = form.querySelector('input[name="website"]');
    const email = emailInput.value.trim();

    emailInput.setAttribute('aria-invalid', 'false');

    if (!emailInput.checkValidity()) {
      emailInput.setAttribute('aria-invalid', 'true');
      setFormState(form, 'error', messages.invalid);
      emailInput.focus();
      return;
    }

    setFormState(form, 'loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website: honeypot.value,
          source: 'landing-page'
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.status === 'joined') {
        replaceWithConfirmation(form, messages.success);
        return;
      }

      if (response.ok && data.status === 'already_joined') {
        replaceWithConfirmation(form, messages.duplicate);
        return;
      }

      if (response.status === 400 && data.error === 'invalid_email') {
        emailInput.setAttribute('aria-invalid', 'true');
        setFormState(form, 'error', messages.invalid);
        emailInput.focus();
        return;
      }

      throw new Error(data.error || 'waitlist_request_failed');
    } catch (error) {
      console.error(error);
      setFormState(form, 'error', messages.error);
    }
  });
});

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    )
  : null;

document.querySelectorAll('.fade-in').forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add('is-visible');
});

const privacyDialog = document.querySelector('[data-privacy-dialog]');
document.querySelector('[data-open-privacy]')?.addEventListener('click', () => privacyDialog?.showModal());
document.querySelector('[data-close-privacy]')?.addEventListener('click', () => privacyDialog?.close());
privacyDialog?.addEventListener('click', (event) => {
  if (event.target === privacyDialog) privacyDialog.close();
});

document.querySelector('[data-instagram-placeholder]')?.addEventListener('click', (event) => {
  if (event.currentTarget.getAttribute('href') === '#') event.preventDefault();
});
