function normalizeText(value) {
  return String(value || '').trim();
}

function validateRegistration(payload) {
  const fullName = normalizeText(payload.fullName);
  const email = normalizeText(payload.email).toLowerCase();
  const password = String(payload.password || '');

  if (fullName.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres.');
  }

  if (!email.includes('@')) {
    throw new Error('El correo no es valido.');
  }

  if (password.length < 6) {
    throw new Error('La contrasena debe tener al menos 6 caracteres.');
  }

  return { fullName, email, password };
}

function validateLogin(payload) {
  const email = normalizeText(payload.email).toLowerCase();
  const password = String(payload.password || '');

  if (!email || !password) {
    throw new Error('Correo y contrasena son obligatorios.');
  }

  return { email, password };
}

function validateRoleUpdate(payload) {
  const role = normalizeText(payload.role).toUpperCase();

  if (!['ADMIN', 'USER'].includes(role)) {
    throw new Error('Rol invalido.');
  }

  return { role };
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateRoleUpdate
};

