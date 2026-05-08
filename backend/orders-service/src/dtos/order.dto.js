function normalizeText(value) {
  return String(value || '').trim();
}

function validateOrder(payload) {
  const normalized = {
    customerName: normalizeText(payload.customerName),
    customerEmail: normalizeText(payload.customerEmail).toLowerCase(),
    productName: normalizeText(payload.productName),
    projectType: normalizeText(payload.projectType),
    material: normalizeText(payload.material),
    quantity: Number(payload.quantity),
    estimatedAmount: Number(payload.estimatedAmount),
    notes: normalizeText(payload.notes) || null
  };

  if (
    !normalized.customerName ||
    !normalized.customerEmail ||
    !normalized.productName ||
    !normalized.projectType ||
    !normalized.material
  ) {
    throw new Error('Todos los campos principales de la solicitud son obligatorios.');
  }

  if (!normalized.customerEmail.includes('@')) {
    throw new Error('El correo del cliente no es valido.');
  }

  if (Number.isNaN(normalized.quantity) || normalized.quantity <= 0) {
    throw new Error('La cantidad debe ser mayor que cero.');
  }

  if (Number.isNaN(normalized.estimatedAmount) || normalized.estimatedAmount <= 0) {
    throw new Error('El valor estimado debe ser mayor que cero.');
  }

  return normalized;
}

function validateStatus(payload) {
  const status = normalizeText(payload.status).toUpperCase();
  const allowed = ['PENDIENTE', 'EN_PRODUCCION', 'ENTREGADO', 'CANCELADO'];

  if (!allowed.includes(status)) {
    throw new Error('Estado invalido.');
  }

  return { status };
}

module.exports = {
  validateOrder,
  validateStatus
};

