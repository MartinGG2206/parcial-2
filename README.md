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

## Despliegue en Google Cloud con Cloud Run

Fecha de referencia de esta guia: `2026-05-08`.

Esta app ya fue ajustada para Cloud Run:

- los 4 contenedores escuchan `PORT`,
- el frontend acepta URLs publicas por variables de entorno,
- los microservicios soportan Cloud SQL por Unix sockets con `INSTANCE_CONNECTION_NAME`.

### Arquitectura recomendada

1. `Cloud SQL for PostgreSQL` para `auth-service` y `orders-service`.
2. `Cloud SQL for MySQL` para `catalog-service`.
3. `Cloud Run` para:
   - `auth-service`
   - `catalog-service`
   - `orders-service`
   - `frontend`

### Advertencia de costo

Cloud Run tiene free tier, pero `Cloud SQL` no es gratis de forma permanente. Si no estas usando creditos promocionales, vas a tener cobro por las dos bases.

Fuentes oficiales:

- Cloud Run deploy: https://cloud.google.com/run/docs/quickstarts/deploy-container
- Deploy from source: https://cloud.google.com/run/docs/deploying-source-code
- Cloud Run container contract (`PORT`): https://cloud.google.com/run/docs/container-contract
- Cloud Run + PostgreSQL: https://cloud.google.com/sql/docs/postgres/connect-run
- Cloud Run + MySQL: https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run
- Cloud Run pricing: https://cloud.google.com/run
- Cloud SQL pricing: https://cloud.google.com/sql/pricing

### Variables que debes definir

Usa el mismo `JWT_SECRET` en los tres backends.

#### auth-service

```env
DB_NAME=carpinteria_suite
DB_USER=carpinteria
DB_PASSWORD=TU_PASSWORD_POSTGRES
DB_SCHEMA=auth_service
INSTANCE_CONNECTION_NAME=TU_PROYECTO:TU_REGION:carpinteria-postgres
JWT_SECRET=TU_SECRETO_JWT
CORS_ORIGIN=*
ADMIN_NAME=Administrador Carpinteria
ADMIN_EMAIL=admin@carpinteria.local
ADMIN_PASSWORD=Admin123*
```

#### catalog-service

```env
DB_NAME=carpinteria_catalog
DB_USER=carpinteria
DB_PASSWORD=TU_PASSWORD_MYSQL
INSTANCE_CONNECTION_NAME=TU_PROYECTO:TU_REGION:carpinteria-mysql
JWT_SECRET=TU_SECRETO_JWT
CORS_ORIGIN=*
```

#### orders-service

```env
DB_NAME=carpinteria_suite
DB_USER=carpinteria
DB_PASSWORD=TU_PASSWORD_POSTGRES
DB_SCHEMA=orders_service
INSTANCE_CONNECTION_NAME=TU_PROYECTO:TU_REGION:carpinteria-postgres
JWT_SECRET=TU_SECRETO_JWT
CORS_ORIGIN=*
```

### Orden de despliegue recomendado

1. Crear proyecto en Google Cloud.
2. Habilitar APIs:
   - Cloud Run API
   - Cloud Build API
   - Artifact Registry API
   - Cloud SQL Admin API
3. Crear una instancia `Cloud SQL PostgreSQL`.
4. Crear una instancia `Cloud SQL MySQL`.
5. Crear usuario y base en cada una.
6. Dar rol `Cloud SQL Client` a la service account de cada servicio de Cloud Run.
7. Desplegar `auth-service`.
8. Desplegar `catalog-service`.
9. Desplegar `orders-service`.
10. Desplegar `frontend` usando las URLs publicas de los 3 backends.

### Comandos base con gcloud

#### auth-service

```bash
gcloud run deploy auth-service \
  --source backend/auth-service \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances TU_PROYECTO:us-central1:carpinteria-postgres \
  --set-env-vars DB_NAME=carpinteria_suite,DB_USER=carpinteria,DB_PASSWORD=TU_PASSWORD_POSTGRES,DB_SCHEMA=auth_service,INSTANCE_CONNECTION_NAME=TU_PROYECTO:us-central1:carpinteria-postgres,JWT_SECRET=TU_SECRETO_JWT,CORS_ORIGIN=*,ADMIN_NAME=Administrador\ Carpinteria,ADMIN_EMAIL=admin@carpinteria.local,ADMIN_PASSWORD=Admin123*
```

#### catalog-service

```bash
gcloud run deploy catalog-service \
  --source backend/catalog-service \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances TU_PROYECTO:us-central1:carpinteria-mysql \
  --set-env-vars DB_NAME=carpinteria_catalog,DB_USER=carpinteria,DB_PASSWORD=TU_PASSWORD_MYSQL,INSTANCE_CONNECTION_NAME=TU_PROYECTO:us-central1:carpinteria-mysql,JWT_SECRET=TU_SECRETO_JWT,CORS_ORIGIN=*
```

#### orders-service

```bash
gcloud run deploy orders-service \
  --source backend/orders-service \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances TU_PROYECTO:us-central1:carpinteria-postgres \
  --set-env-vars DB_NAME=carpinteria_suite,DB_USER=carpinteria,DB_PASSWORD=TU_PASSWORD_POSTGRES,DB_SCHEMA=orders_service,INSTANCE_CONNECTION_NAME=TU_PROYECTO:us-central1:carpinteria-postgres,JWT_SECRET=TU_SECRETO_JWT,CORS_ORIGIN=*
```

#### frontend

Reemplaza `AUTH_URL`, `CATALOG_URL` y `ORDERS_URL` por las URLs publicas que te devuelve Cloud Run al desplegar los backends.

```bash
gcloud run deploy frontend \
  --source frontend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars AUTH_API_URL=AUTH_URL,CATALOG_API_URL=CATALOG_URL,ORDERS_API_URL=ORDERS_URL
```

### Forma mas simple

Si no quieres crear cada servicio a mano desde la UI, usa el script:

1. Abre Cloud Shell.
2. Clona el repo:

```bash
git clone https://github.com/MartinGG2206/parcial-2.git
cd parcial-2
```

3. Crea tu archivo de variables a partir de [scripts/gcp.env.example](./scripts/gcp.env.example).
4. Carga variables y ejecuta:

```bash
set -a
source scripts/gcp.env.example
set +a
bash scripts/deploy-cloud-run.sh
```

Ese script despliega en orden:

- `auth-service`
- `catalog-service`
- `orders-service`
- `frontend`

y luego imprime las URLs finales.

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
