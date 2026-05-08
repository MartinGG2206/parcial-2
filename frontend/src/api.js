const runtimeConfig = window.RUNTIME_CONFIG || {};

export const API_URLS = {
  auth: runtimeConfig.AUTH_API_URL || 'http://localhost:4001',
  catalog: runtimeConfig.CATALOG_API_URL || 'http://localhost:4002',
  orders: runtimeConfig.ORDERS_API_URL || 'http://localhost:4003'
};

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.');
  }

  return data;
}

export const authApi = {
  login: (body) => request(API_URLS.auth, '/api/auth/login', { method: 'POST', body }),
  register: (body) => request(API_URLS.auth, '/api/auth/register', { method: 'POST', body }),
  me: (token) => request(API_URLS.auth, '/api/auth/me', { token }),
  users: (token) => request(API_URLS.auth, '/api/auth/users', { token }),
  updateRole: (token, id, body) =>
    request(API_URLS.auth, `/api/auth/users/${id}/role`, { method: 'PATCH', body, token })
};

export const catalogApi = {
  list: () => request(API_URLS.catalog, '/api/products'),
  create: (token, body) => request(API_URLS.catalog, '/api/products', { method: 'POST', body, token }),
  update: (token, id, body) =>
    request(API_URLS.catalog, `/api/products/${id}`, { method: 'PUT', body, token }),
  remove: (token, id) =>
    request(API_URLS.catalog, `/api/products/${id}`, { method: 'DELETE', token })
};

export const ordersApi = {
  list: (token) => request(API_URLS.orders, '/api/orders', { token }),
  create: (token, body) => request(API_URLS.orders, '/api/orders', { method: 'POST', body, token }),
  update: (token, id, body) =>
    request(API_URLS.orders, `/api/orders/${id}`, { method: 'PUT', body, token }),
  updateStatus: (token, id, body) =>
    request(API_URLS.orders, `/api/orders/${id}/status`, { method: 'PATCH', body, token }),
  remove: (token, id) =>
    request(API_URLS.orders, `/api/orders/${id}`, { method: 'DELETE', token })
};

