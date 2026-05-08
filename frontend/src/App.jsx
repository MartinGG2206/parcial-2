import { useEffect, useMemo, useState } from 'react';
import {
  Hammer,
  LogOut,
  Package,
  ClipboardList,
  Shield,
  Save,
  Trash2,
  Pencil,
  UserCog,
  RefreshCcw
} from 'lucide-react';
import { API_URLS, authApi, catalogApi, ordersApi } from './api';

const emptyAuthForm = { fullName: '', email: '', password: '' };
const emptyProductForm = {
  name: '',
  category: 'Mobiliario',
  woodType: 'Roble',
  finish: 'Mate natural',
  price: '',
  stock: '',
  description: '',
  imageUrl: ''
};
const emptyOrderForm = {
  customerName: '',
  customerEmail: '',
  productName: '',
  projectType: 'Mueble a medida',
  material: 'Roble',
  quantity: '',
  estimatedAmount: '',
  notes: ''
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('carpinteria_token') || '');
  const [user, setUser] = useState(() => {
    const rawUser = localStorage.getItem('carpinteria_user');
    return rawUser ? JSON.parse(rawUser) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('catalogo');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const summary = useMemo(
    () => ({
      productos: products.length,
      solicitudes: orders.length,
      usuarios: users.length
    }),
    [orders.length, products.length, users.length]
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    loadSession();
  }, [token]);

  async function loadSession() {
    try {
      setLoading(true);
      const profile = await authApi.me(token);
      setUser(profile);
      persistSession(token, profile);
      await Promise.all([
        loadProducts(),
        loadOrders(token),
        profile.role === 'ADMIN' ? loadUsers(token, profile.role) : Promise.resolve()
      ]);
    } catch (requestError) {
      clearSession();
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    const data = await catalogApi.list();
    setProducts(data);
  }

  async function loadOrders(activeToken = token) {
    if (!activeToken) {
      return;
    }

    const data = await ordersApi.list(activeToken);
    setOrders(data);
  }

  async function loadUsers(activeToken = token, role = user?.role) {
    if (!activeToken || role !== 'ADMIN') {
      return;
    }

    const data = await authApi.users(activeToken);
    setUsers(data);
  }

  function persistSession(activeToken, currentUser) {
    localStorage.setItem('carpinteria_token', activeToken);
    localStorage.setItem('carpinteria_user', JSON.stringify(currentUser));
  }

  function clearSession() {
    localStorage.removeItem('carpinteria_token');
    localStorage.removeItem('carpinteria_user');
    setToken('');
    setUser(null);
    setProducts([]);
    setUsers([]);
    setOrders([]);
    setNotice('');
    setActiveTab('catalogo');
  }

  function resetMessages() {
    setError('');
    setNotice('');
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    resetMessages();

    try {
      setLoading(true);
      const response =
        authMode === 'login' ? await authApi.login(authForm) : await authApi.register(authForm);

      setToken(response.token);
      setUser(response.user);
      persistSession(response.token, response.user);
      setAuthForm(emptyAuthForm);
      setNotice(authMode === 'login' ? 'Sesion iniciada.' : 'Registro completado.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    resetMessages();

    try {
      setLoading(true);
      if (editingProductId) {
        await catalogApi.update(token, editingProductId, productForm);
        setNotice('Producto actualizado.');
      } else {
        await catalogApi.create(token, productForm);
        setNotice('Producto creado.');
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOrderSubmit(event) {
    event.preventDefault();
    resetMessages();

    try {
      setLoading(true);
      if (editingOrderId) {
        await ordersApi.update(token, editingOrderId, orderForm);
        setNotice('Solicitud actualizada.');
      } else {
        await ordersApi.create(token, orderForm);
        setNotice('Solicitud creada.');
      }

      setOrderForm(emptyOrderForm);
      setEditingOrderId(null);
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Eliminar este producto?')) {
      return;
    }

    try {
      resetMessages();
      await catalogApi.remove(token, id);
      setNotice('Producto eliminado.');
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDeleteOrder(id) {
    if (!window.confirm('Eliminar esta solicitud?')) {
      return;
    }

    try {
      resetMessages();
      await ordersApi.remove(token, id);
      setNotice('Solicitud eliminada.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleRoleChange(id, role) {
    try {
      resetMessages();
      await authApi.updateRole(token, id, { role });
      setNotice('Rol actualizado.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      resetMessages();
      await ordersApi.updateStatus(token, id, { status });
      setNotice('Estado actualizado.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function beginProductEdit(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      woodType: product.woodType,
      finish: product.finish,
      price: product.price,
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl || ''
    });
  }

  function beginOrderEdit(order) {
    setEditingOrderId(order.id);
    setOrderForm({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      productName: order.productName,
      projectType: order.projectType,
      material: order.material,
      quantity: order.quantity,
      estimatedAmount: order.estimatedAmount,
      notes: order.notes || ''
    });
  }

  function resetProductEditor() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  function resetOrderEditor() {
    setEditingOrderId(null);
    setOrderForm(emptyOrderForm);
  }

  async function refreshAll() {
    resetMessages();
    try {
      setLoading(true);
      await Promise.all([loadProducts(), token ? loadOrders() : Promise.resolve(), isAdmin ? loadUsers() : Promise.resolve()]);
      setNotice('Datos actualizados.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-aside">
          <div className="brand-mark">
            <Hammer size={20} />
            <span>Carpinteria Atlas</span>
          </div>
          <h1>Operacion digital para taller, catalogo y pedidos.</h1>
          <p>
            Panel full stack con autenticacion JWT, roles y CRUD desplegable en Docker y Render.
          </p>
          <ul className="auth-feature-list">
            <li>Microservicios de autenticacion, catalogo y solicitudes.</li>
            <li>Persistencia separada en PostgreSQL y MySQL.</li>
            <li>Interfaz lista para sustentar flujo ADMIN y USER.</li>
          </ul>
        </section>

        <section className="auth-panel">
          <div className="panel-header">
            <span>{authMode === 'login' ? 'Acceso' : 'Registro'}</span>
            <div className="segment-control">
              <button
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => setAuthMode('login')}
                type="button"
              >
                Login
              </button>
              <button
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => setAuthMode('register')}
                type="button"
              >
                Registro
              </button>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <label>
                Nombre completo
                <input
                  value={authForm.fullName}
                  onChange={(event) => setAuthForm({ ...authForm, fullName: event.target.value })}
                  placeholder="Laura Mejia"
                />
              </label>
            )}

            <label>
              Correo
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                placeholder="usuario@correo.com"
              />
            </label>

            <label>
              Contrasena
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                placeholder="******"
              />
            </label>

            {error && <p className="message error">{error}</p>}
            {notice && <p className="message success">{notice}</p>}

            <button className="primary-action" disabled={loading} type="submit">
              <Shield size={18} />
              <span>{loading ? 'Procesando...' : authMode === 'login' ? 'Entrar' : 'Crear cuenta'}</span>
            </button>
          </form>

          <div className="demo-box">
            <span>Credenciales demo admin</span>
            <strong>admin@carpinteria.local / Admin123*</strong>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand-mark">
            <Hammer size={20} />
            <span>Carpinteria Atlas</span>
          </div>
          <div>
            <h1>Centro operativo del taller</h1>
            <p>
              Catalogo, solicitudes y administracion de acceso conectados a microservicios
              independientes.
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="user-chip">
            <strong>{user.fullName}</strong>
            <span>{user.role}</span>
          </div>
          <button className="icon-button" onClick={refreshAll} type="button" title="Actualizar">
            <RefreshCcw size={18} />
          </button>
          <button className="icon-button" onClick={clearSession} type="button" title="Cerrar sesion">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="summary-strip">
        <article className="summary-card">
          <span>Productos</span>
          <strong>{summary.productos}</strong>
        </article>
        <article className="summary-card">
          <span>Solicitudes</span>
          <strong>{summary.solicitudes}</strong>
        </article>
        {isAdmin && (
          <article className="summary-card">
            <span>Usuarios</span>
            <strong>{summary.usuarios}</strong>
          </article>
        )}
        <article className="summary-card api-card">
          <span>Servicios</span>
          <strong>Auth, Catalogo, Orders</strong>
          <small>{API_URLS.auth}</small>
        </article>
      </section>

      <nav className="tabs">
        <button
          className={activeTab === 'catalogo' ? 'active' : ''}
          onClick={() => setActiveTab('catalogo')}
          type="button"
        >
          <Package size={16} />
          <span>Catalogo</span>
        </button>
        <button
          className={activeTab === 'solicitudes' ? 'active' : ''}
          onClick={() => setActiveTab('solicitudes')}
          type="button"
        >
          <ClipboardList size={16} />
          <span>Solicitudes</span>
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'usuarios' ? 'active' : ''}
            onClick={() => setActiveTab('usuarios')}
            type="button"
          >
            <UserCog size={16} />
            <span>Usuarios</span>
          </button>
        )}
      </nav>

      {error && <p className="message error">{error}</p>}
      {notice && <p className="message success">{notice}</p>}

      {activeTab === 'catalogo' && (
        <section className="workspace-grid">
          {isAdmin && (
            <form className="editor-panel" onSubmit={handleProductSubmit}>
              <div className="panel-header">
                <span>{editingProductId ? 'Editar producto' : 'Nuevo producto'}</span>
                {editingProductId && (
                  <button className="ghost-button" onClick={resetProductEditor} type="button">
                    Limpiar
                  </button>
                )}
              </div>

              <div className="form-grid two-columns">
                <label>
                  Nombre
                  <input
                    value={productForm.name}
                    onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                  />
                </label>
                <label>
                  Categoria
                  <input
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm({ ...productForm, category: event.target.value })
                    }
                  />
                </label>
                <label>
                  Tipo de madera
                  <input
                    value={productForm.woodType}
                    onChange={(event) =>
                      setProductForm({ ...productForm, woodType: event.target.value })
                    }
                  />
                </label>
                <label>
                  Acabado
                  <input
                    value={productForm.finish}
                    onChange={(event) => setProductForm({ ...productForm, finish: event.target.value })}
                  />
                </label>
                <label>
                  Precio
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                  />
                </label>
                <label className="full-span">
                  Imagen
                  <input
                    value={productForm.imageUrl}
                    onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
                    placeholder="https://..."
                  />
                </label>
                <label className="full-span">
                  Descripcion
                  <textarea
                    rows="4"
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm({ ...productForm, description: event.target.value })
                    }
                  />
                </label>
              </div>

              <button className="primary-action" type="submit">
                <Save size={18} />
                <span>{editingProductId ? 'Guardar cambios' : 'Crear producto'}</span>
              </button>
            </form>
          )}

          <section className="data-panel">
            <div className="panel-header">
              <span>Catalogo de carpinteria</span>
            </div>

            <div className="catalog-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <img
                    alt={product.name}
                    src={
                      product.imageUrl ||
                      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80'
                    }
                  />
                  <div className="product-copy">
                    <div className="product-head">
                      <h3>{product.name}</h3>
                      <span>${Number(product.price).toLocaleString('es-CO')}</span>
                    </div>
                    <p>{product.description}</p>
                    <div className="meta-row">
                      <span>{product.category}</span>
                      <span>{product.woodType}</span>
                      <span>{product.finish}</span>
                      <span>Stock {product.stock}</span>
                    </div>
                    {isAdmin && (
                      <div className="row-actions">
                        <button className="icon-button" onClick={() => beginProductEdit(product)} title="Editar" type="button">
                          <Pencil size={16} />
                        </button>
                        <button className="icon-button danger" onClick={() => handleDeleteProduct(product.id)} title="Eliminar" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}

      {activeTab === 'solicitudes' && (
        <section className="workspace-grid">
          <form className="editor-panel" onSubmit={handleOrderSubmit}>
            <div className="panel-header">
              <span>{editingOrderId ? 'Editar solicitud' : 'Nueva solicitud'}</span>
              {editingOrderId && (
                <button className="ghost-button" onClick={resetOrderEditor} type="button">
                  Limpiar
                </button>
              )}
            </div>

            <div className="form-grid two-columns">
              <label>
                Cliente
                <input
                  value={orderForm.customerName}
                  onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })}
                />
              </label>
              <label>
                Correo cliente
                <input
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(event) =>
                    setOrderForm({ ...orderForm, customerEmail: event.target.value })
                  }
                />
              </label>
              <label>
                Producto o referencia
                <input
                  value={orderForm.productName}
                  onChange={(event) => setOrderForm({ ...orderForm, productName: event.target.value })}
                />
              </label>
              <label>
                Tipo de proyecto
                <input
                  value={orderForm.projectType}
                  onChange={(event) => setOrderForm({ ...orderForm, projectType: event.target.value })}
                />
              </label>
              <label>
                Material
                <input
                  value={orderForm.material}
                  onChange={(event) => setOrderForm({ ...orderForm, material: event.target.value })}
                />
              </label>
              <label>
                Cantidad
                <input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(event) => setOrderForm({ ...orderForm, quantity: event.target.value })}
                />
              </label>
              <label>
                Valor estimado
                <input
                  type="number"
                  value={orderForm.estimatedAmount}
                  onChange={(event) =>
                    setOrderForm({ ...orderForm, estimatedAmount: event.target.value })
                  }
                />
              </label>
              <label className="full-span">
                Notas
                <textarea
                  rows="4"
                  value={orderForm.notes}
                  onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })}
                />
              </label>
            </div>

            <button className="primary-action" type="submit">
              <Save size={18} />
              <span>{editingOrderId ? 'Guardar cambios' : 'Registrar solicitud'}</span>
            </button>
          </form>

          <section className="data-panel">
            <div className="panel-header">
              <span>{isAdmin ? 'Solicitudes del taller' : 'Mis solicitudes'}</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Proyecto</th>
                    <th>Cantidad</th>
                    <th>Valor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.customerName}</strong>
                        <span>{order.customerEmail}</span>
                      </td>
                      <td>{order.productName}</td>
                      <td>{order.projectType}</td>
                      <td>{order.quantity}</td>
                      <td>${Number(order.estimatedAmount).toLocaleString('es-CO')}</td>
                      <td>
                        {isAdmin ? (
                          <select
                            className="status-select"
                            onChange={(event) => handleStatusChange(order.id, event.target.value)}
                            value={order.status}
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="EN_PRODUCCION">EN_PRODUCCION</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        ) : (
                          <span className="status-badge">{order.status}</span>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          {(isAdmin || order.status === 'PENDIENTE') && (
                            <button className="icon-button" onClick={() => beginOrderEdit(order)} title="Editar" type="button">
                              <Pencil size={16} />
                            </button>
                          )}
                          {(isAdmin || order.status === 'PENDIENTE') && (
                            <button className="icon-button danger" onClick={() => handleDeleteOrder(order.id)} title="Eliminar" type="button">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      )}

      {activeTab === 'usuarios' && isAdmin && (
        <section className="data-panel users-panel">
          <div className="panel-header">
            <span>Usuarios registrados</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.fullName}</td>
                    <td>{entry.email}</td>
                    <td>
                      <select
                        className="status-select"
                        onChange={(event) => handleRoleChange(entry.id, event.target.value)}
                        value={entry.role}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td>{new Date(entry.createdAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
