#!/usr/bin/env bash
set -euo pipefail

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Falta la variable obligatoria: $name" >&2
    exit 1
  fi
}

require_command() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "No se encontro el comando requerido: $name" >&2
    exit 1
  fi
}

require_command gcloud

require_var PROJECT_ID
require_var REGION
require_var POSTGRES_CONNECTION_NAME
require_var MYSQL_CONNECTION_NAME
require_var POSTGRES_PASSWORD
require_var MYSQL_PASSWORD
require_var JWT_SECRET

AUTH_SERVICE_NAME="${AUTH_SERVICE_NAME:-auth-service}"
CATALOG_SERVICE_NAME="${CATALOG_SERVICE_NAME:-catalog-service}"
ORDERS_SERVICE_NAME="${ORDERS_SERVICE_NAME:-orders-service}"
FRONTEND_SERVICE_NAME="${FRONTEND_SERVICE_NAME:-frontend}"
ADMIN_NAME="${ADMIN_NAME:-Administrador Carpinteria}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@carpinteria.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123*}"

echo "Proyecto: $PROJECT_ID"
echo "Region: $REGION"

gcloud config set project "$PROJECT_ID" >/dev/null

echo "Desplegando $AUTH_SERVICE_NAME..."
gcloud run deploy "$AUTH_SERVICE_NAME" \
  --source backend/auth-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances "$POSTGRES_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=carpinteria_suite,DB_USER=carpinteria,DB_PASSWORD=$POSTGRES_PASSWORD,DB_SCHEMA=auth_service,INSTANCE_CONNECTION_NAME=$POSTGRES_CONNECTION_NAME,JWT_SECRET=$JWT_SECRET,CORS_ORIGIN=*,ADMIN_NAME=$ADMIN_NAME,ADMIN_EMAIL=$ADMIN_EMAIL,ADMIN_PASSWORD=$ADMIN_PASSWORD"

echo "Desplegando $CATALOG_SERVICE_NAME..."
gcloud run deploy "$CATALOG_SERVICE_NAME" \
  --source backend/catalog-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances "$MYSQL_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=carpinteria_catalog,DB_USER=carpinteria,DB_PASSWORD=$MYSQL_PASSWORD,INSTANCE_CONNECTION_NAME=$MYSQL_CONNECTION_NAME,JWT_SECRET=$JWT_SECRET,CORS_ORIGIN=*"

echo "Desplegando $ORDERS_SERVICE_NAME..."
gcloud run deploy "$ORDERS_SERVICE_NAME" \
  --source backend/orders-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances "$POSTGRES_CONNECTION_NAME" \
  --set-env-vars "DB_NAME=carpinteria_suite,DB_USER=carpinteria,DB_PASSWORD=$POSTGRES_PASSWORD,DB_SCHEMA=orders_service,INSTANCE_CONNECTION_NAME=$POSTGRES_CONNECTION_NAME,JWT_SECRET=$JWT_SECRET,CORS_ORIGIN=*"

AUTH_URL="$(gcloud run services describe "$AUTH_SERVICE_NAME" --region "$REGION" --format='value(status.url)')"
CATALOG_URL="$(gcloud run services describe "$CATALOG_SERVICE_NAME" --region "$REGION" --format='value(status.url)')"
ORDERS_URL="$(gcloud run services describe "$ORDERS_SERVICE_NAME" --region "$REGION" --format='value(status.url)')"

echo "Desplegando $FRONTEND_SERVICE_NAME..."
gcloud run deploy "$FRONTEND_SERVICE_NAME" \
  --source frontend \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "AUTH_API_URL=$AUTH_URL,CATALOG_API_URL=$CATALOG_URL,ORDERS_API_URL=$ORDERS_URL"

FRONTEND_URL="$(gcloud run services describe "$FRONTEND_SERVICE_NAME" --region "$REGION" --format='value(status.url)')"

echo
echo "Despliegue completado."
echo "Frontend: $FRONTEND_URL"
echo "Auth API: $AUTH_URL"
echo "Catalog API: $CATALOG_URL"
echo "Orders API: $ORDERS_URL"

