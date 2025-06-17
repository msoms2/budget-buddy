#!/bin/sh
set -e

# Create storage directories if they don't exist
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/testing
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# Try to set permissions but don't fail if it doesn't work
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache || true
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

# Touch the log file to ensure it exists and is writable
touch /var/www/html/storage/logs/laravel.log || true
chmod 666 /var/www/html/storage/logs/laravel.log || true

# First arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
    set -- php-fpm "$@"
fi

exec "$@"