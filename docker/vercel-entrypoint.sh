#!/bin/sh
set -e

mkdir -p /app/storage/app/private \
         /app/storage/app/public \
         /app/storage/fonts \
         /app/storage/framework/cache/data \
         /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/logs \
         /app/bootstrap/cache 2>/dev/null || true

if [ -n "${DB_URL:-}" ] || [ -n "${DATABASE_URL:-}" ] || [ -n "${POSTGRES_URL:-}" ]; then
    export DB_CONNECTION="${DB_CONNECTION:-pgsql}"
    if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
        echo "Running database migrations and ensuring core reference data..."
        php /app/artisan migrate --force --no-interaction || echo "Warning: database migration check failed, continuing startup..."
        php /app/artisan db:seed --class='Database\Seeders\ProductionSeeder' --force --no-interaction || echo "Warning: ProductionSeeder check failed, continuing startup..."
    fi
elif [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    export DB_CONNECTION=sqlite
    export DB_DATABASE="${DB_DATABASE:-/tmp/database.sqlite}"
    if [ ! -f "$DB_DATABASE" ]; then
        if [ -f /app/storage/demo.sqlite ]; then
            cp /app/storage/demo.sqlite "$DB_DATABASE"
        else
            touch "$DB_DATABASE"
            php /app/artisan migrate --force --no-interaction || true
            php /app/artisan db:seed --class='Database\Seeders\ProductionSeeder' --force --no-interaction || true
        fi
        chmod 664 "$DB_DATABASE" 2>/dev/null || true
    fi
fi

exec "$@"
