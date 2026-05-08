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

## Despliegue en Railway

Railway no ofrece MySQL administrado como Render Postgres, pero si permite:

- `PostgreSQL` como template de base de datos.
- `MySQL` como template de base de datos.
- servicios Docker desde este monorepo.

Para este proyecto, el camino recomendado es crear 5 servicios dentro del mismo proyecto:

1. `postgres` usando el template PostgreSQL de Railway.
2. `mysql` usando el template MySQL de Railway.
3. `auth-service` conectado al repo, con `Root Directory` = `/backend/auth-service`.
4. `catalog-service` conectado al repo, con `Root Directory` = `/backend/catalog-service`.
5. `orders-service` conectado al repo, con `Root Directory` = `/backend/orders-service`.
6. `frontend` conectado al repo, con `Root Directory` = `/frontend`.

Notas importantes:

- El frontend ya fue ajustado para escuchar el `PORT` que Railway inyecta.
- Los 3 backends deben tener dominio publico habilitado si el frontend va a consumirlos directamente desde el navegador.
- Alternativamente se podria poner un proxy en el frontend y dejar privados los backends, pero ese flujo no es el que esta implementado hoy.

Variables sugeridas en Railway:

### auth-service

- `PORT=${{PORT}}`
- `DB_HOST=${{Postgres.PGHOST}}`
- `DB_PORT=${{Postgres.PGPORT}}`
- `DB_NAME=${{Postgres.PGDATABASE}}`
- `DB_USER=${{Postgres.PGUSER}}`
- `DB_PASSWORD=${{Postgres.PGPASSWORD}}`
- `DB_SCHEMA=auth_service`
- `DB_SSL=true`
- `JWT_SECRET=...`
- `CORS_ORIGIN=*`
- `ADMIN_NAME=Administrador Carpinteria`
- `ADMIN_EMAIL=admin@carpinteria.local`
- `ADMIN_PASSWORD=Admin123*`

### catalog-service

- `PORT=${{PORT}}`
- `DB_HOST=${{mysql.MYSQLHOST}}`
- `DB_PORT=${{mysql.MYSQLPORT}}`
- `DB_NAME=${{mysql.MYSQLDATABASE}}`
- `DB_USER=${{mysql.MYSQLUSER}}`
- `DB_PASSWORD=${{mysql.MYSQLPASSWORD}}`
- `JWT_SECRET=${{auth-service.JWT_SECRET}}`
- `CORS_ORIGIN=*`

### orders-service

- `PORT=${{PORT}}`
- `DB_HOST=${{Postgres.PGHOST}}`
- `DB_PORT=${{Postgres.PGPORT}}`
- `DB_NAME=${{Postgres.PGDATABASE}}`
- `DB_USER=${{Postgres.PGUSER}}`
- `DB_PASSWORD=${{Postgres.PGPASSWORD}}`
- `DB_SCHEMA=orders_service`
- `DB_SSL=true`
- `JWT_SECRET=${{auth-service.JWT_SECRET}}`
- `CORS_ORIGIN=*`

### frontend

- `PORT=${{PORT}}`
- `AUTH_API_URL=https://${{auth-service.RAILWAY_PUBLIC_DOMAIN}}`
- `CATALOG_API_URL=https://${{catalog-service.RAILWAY_PUBLIC_DOMAIN}}`
- `ORDERS_API_URL=https://${{orders-service.RAILWAY_PUBLIC_DOMAIN}}`

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
