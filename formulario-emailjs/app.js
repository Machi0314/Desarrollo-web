/* Configura estos tres valores desde EmailJS: Account > Email Services, Email Templates y Account > General. */
const EMAILJS_CONFIG = {
  publicKey: 'Y2DP_DTKcSg4rHa1r',
  serviceId: 'service_7yan55d',
  templateId: 'template_whgh6sb'
};

const form = document.querySelector('#contact-form');
const button = document.querySelector('#submit-button');
const statusBox = document.querySelector('#form-status');
const messageField = document.querySelector('#message');
document.querySelector('#year').textContent = new Date().getFullYear();

if (window.emailjs && isConfigured()) emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

function isConfigured() {
  return Object.values(EMAILJS_CONFIG).every(value => value && !value.startsWith('TU_'));
}

const validators = {
  from_name: value => value.trim().length >= 2 ? '' : 'Escribe tu nombre (al menos 2 caracteres).',
  reply_to: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? '' : 'Ingresa un correo electrónico válido.',
  subject: value => value.trim().length >= 3 ? '' : 'El asunto debe tener al menos 3 caracteres.',
  message: value => value.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres.'
};

function setError(name, message) {
  const input = form.elements[name];
  const error = document.querySelector(`#${name === 'from_name' ? 'name' : name === 'reply_to' ? 'email' : name}-error`);
  input.setAttribute('aria-invalid', String(Boolean(message)));
  error.textContent = message;
}

function validate() {
  let valid = true;
  for (const [name, validator] of Object.entries(validators)) {
    const error = validator(form.elements[name].value);
    setError(name, error);
    if (error) valid = false;
  }
  const consentError = form.elements.consent.checked ? '' : 'Debes aceptar el uso de tus datos para continuar.';
  document.querySelector('#consent-error').textContent = consentError;
  if (consentError) valid = false;
  return valid;
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
  statusBox.hidden = false;
}

for (const name of Object.keys(validators)) {
  form.elements[name].addEventListener('input', () => {
    setError(name, validators[name](form.elements[name].value));
  });
}
form.elements.consent.addEventListener('change', () => {
  document.querySelector('#consent-error').textContent = form.elements.consent.checked ? '' : 'Debes aceptar el uso de tus datos para continuar.';
});
messageField.addEventListener('input', () => {
  document.querySelector('#char-count').textContent = `${messageField.value.length} / 3000`;
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  statusBox.hidden = true;
  if (!validate()) {
    showStatus('Revisa los campos señalados antes de enviar.', 'error');
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  if (!isConfigured()) {
    showStatus('El formulario está listo, pero falta configurar EmailJS. Añade la clave pública, el ID del servicio y el ID de la plantilla en app.js.', 'error');
    return;
  }
  if (!window.emailjs) {
    showStatus('No se pudo cargar EmailJS. Comprueba tu conexión e inténtalo de nuevo.', 'error');
    return;
  }

  button.disabled = true;
  button.querySelector('.button-label').textContent = 'Enviando…';
  try {
    await emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, form);
    showStatus('¡Mensaje enviado! Se ha enviado una confirmación a tu correo electrónico.', 'success');
    form.reset();
    document.querySelector('#char-count').textContent = '0 / 3000';
    for (const name of Object.keys(validators)) setError(name, '');
    document.querySelector('#consent-error').textContent = '';
  } catch (error) {
    console.error('EmailJS error:', error);
    showStatus('No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos o verifica la configuración de EmailJS.', 'error');
  } finally {
    button.disabled = false;
    button.querySelector('.button-label').textContent = 'Enviar mensaje';
  }
});
