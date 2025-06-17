#!/bin/bash
set -e

echo "Starting permission fixes for Laravel storage directories..."

# Create storage directories if they don't exist
echo "Creating required directories..."
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/framework/testing
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# Touch log file to ensure it exists
touch /var/www/html/storage/logs/laravel.log || true

# Set permissions to be more permissive for Docker volume mounts
echo "Setting permissive permissions for Docker volumes..."
chmod -R 777 /var/www/html/storage || true
chmod -R 777 /var/www/html/bootstrap/cache || true
chmod 666 /var/www/html/storage/logs/laravel.log || true

# Try to set ownership but don't fail if it doesn't work
echo "Attempting to set ownership to www-data (may fail on mounted volumes)..."
chown -R www-data:www-data /var/www/html/storage || true
chown -R www-data:www-data /var/www/html/bootstrap/cache || true

echo "✓ Storage and bootstrap/cache permissions have been configured!"