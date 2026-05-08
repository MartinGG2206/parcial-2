# Carpinteria Atlas

Aplicacion full stack dockerizada para gestion de un taller de carpinteria. Cumple con:

- API REST en microservicios.
- JWT con registro, login y roles `ADMIN` / `USER`.
- Dos servicios funcionales del tema: catalogo y solicitudes.
- Persistencia en `PostgreSQL` y `MySQL`.
- Frontend React con CRUD visible por rol.
- `docker-compose.yml` para levantar todo localmente.
- `render.yaml` para desplegar en Render.

## Arquitectura

- `backend/auth-service`: autenticacion, usuarios y roles sobre PostgreSQL.
- `backend/catalog-service`: CRUD de productos de carpinteria sobre MySQL.
- `backend/orders-service`: CRUD de solicitudes/cotizaciones sobre PostgreSQL.
- `frontend`: React + Vite servido por Nginx.
- `infra/mysql`: imagen de MySQL para Compose y Render.

## Levantar localmente

```bash
docker compose up --build
```

URLs locales:

- Frontend: `http://localhost:8080`
- Auth API: `http://localhost:4001`
- Catalog API: `http://localhost:4002`
- Orders API: `http://localhost:4003`

Credenciales demo:

- Admin: `admin@carpinteria.local`
- Password: `Admin123*`

## Despliegue en Render

El repo ya incluye [`render.yaml`](./render.yaml).

Puntos importantes:

1. Crear el Blueprint desde el repositorio.
2. Render te pedira los secretos marcados con `sync: false`.
3. `carpinteria-mysql` se despliega como `private service`, por lo que en Render necesita plan `starter` o superior.
4. El frontend toma las URLs publicas de `auth-service`, `catalog-service` y `orders-service` desde el mismo Blueprint.

## Validacion realizada

Se verifico localmente con Docker:

- build de todos los contenedores,
- respuesta `200` del frontend,
- healthcheck de los 3 microservicios,
- registro de usuario,
- login admin,
- creacion de producto,
- creacion de solicitud,
- cambio de estado de solicitud por admin.
