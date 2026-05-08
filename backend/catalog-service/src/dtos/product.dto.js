function normalizeText(value) {
  return String(value || '').trim();
}

function validateProduct(payload) {
  const normalized = {
    name: normalizeText(payload.name),
    category: normalizeText(payload.category),
    woodType: normalizeText(payload.woodType),
    finish: normalizeText(payload.finish),
    description: normalizeText(payload.description),
    imageUrl: normalizeText(payload.imageUrl) || null,
    price: Number(payload.price),
    stock: Number(payload.stock)
  };

  if (!normalized.name || !normalized.category || !normalized.woodType || !normalized.finish) {
    throw new Error('Nombre, categoria, tipo de madera y acabado son obligatorios.');
  }

  if (!normalized.description) {
    throw new Error('La descripcion es obligatoria.');
  }

  if (Number.isNaN(normalized.price) || normalized.price <= 0) {
    throw new Error('El precio debe ser un numero mayor que cero.');
  }

  if (Number.isNaN(normalized.stock) || normalized.stock < 0) {
    throw new Error('El stock no puede ser negativo.');
  }

  return normalized;
}

module.exports = {
  validateProduct
};

