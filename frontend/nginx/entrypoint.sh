#!/bin/sh
set -eu

RUNTIME_CONFIG_FILE="/usr/share/nginx/html/runtime-config.js"
NGINX_CONFIG_FILE="/etc/nginx/conf.d/default.conf"
PORT_VALUE="${PORT:-80}"

sed -i "s|__AUTH_API_URL__|${AUTH_API_URL}|g" "$RUNTIME_CONFIG_FILE"
sed -i "s|__CATALOG_API_URL__|${CATALOG_API_URL}|g" "$RUNTIME_CONFIG_FILE"
sed -i "s|__ORDERS_API_URL__|${ORDERS_API_URL}|g" "$RUNTIME_CONFIG_FILE"
sed -i "s|__PORT__|${PORT_VALUE}|g" "$NGINX_CONFIG_FILE"

exec "$@"
