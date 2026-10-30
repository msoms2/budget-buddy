# Multi-stage FrankenPHP Dockerfile for Vercel Container Runtime & Docker hosts
FROM dunglas/frankenphp:1-php8.3-bookworm AS base

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && printf "upload_max_filesize=20M\npost_max_size=25M\nmemory_limit=512M\n" > "$PHP_INI_DIR/conf.d/99-budgetbuddy.ini" \
    && install-php-extensions gd zip intl pdo_pgsql pdo_mysql bcmath exif pcntl

WORKDIR /app

# 1) Install Composer dependencies & build pre-seeded fallback demo SQLite DB
FROM base AS dependencies

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --prefer-dist

COPY . .

RUN mkdir -p \
        storage/app/private \
        storage/app/public \
        storage/fonts \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && APP_ENV=local \
       APP_KEY=base64:dGhpc2lzYWJ1aWxkdGltZXRlbXBvcmFyeWtleTEyMzQ= \
       DB_CONNECTION=sqlite \
       DB_DATABASE=/app/storage/demo.sqlite \
       CACHE_STORE=array \
       SESSION_DRIVER=array \
       composer dump-autoload --optimize \
    && rm -f storage/demo.sqlite \
    && touch storage/demo.sqlite \
    && APP_ENV=local \
       APP_KEY=base64:dGhpc2lzYWJ1aWxkdGltZXRlbXBvcmFyeWtleTEyMzQ= \
       DB_CONNECTION=sqlite \
       DB_DATABASE=/app/storage/demo.sqlite \
       CACHE_STORE=array \
       SESSION_DRIVER=array \
       php artisan migrate --force --no-interaction \
    && APP_ENV=local \
       APP_KEY=base64:dGhpc2lzYWJ1aWxkdGltZXRlbXBvcmFyeWtleTEyMzQ= \
       DB_CONNECTION=sqlite \
       DB_DATABASE=/app/storage/demo.sqlite \
       CACHE_STORE=array \
       SESSION_DRIVER=array \
       php artisan db:seed --force --no-interaction \
    && composer install \
       --no-dev \
       --no-interaction \
       --no-progress \
       --no-scripts \
       --optimize-autoloader \
       --prefer-dist \
    && APP_ENV=production \
       APP_KEY=base64:dGhpc2lzYWJ1aWxkdGltZXRlbXBvcmFyeWtleTEyMzQ= \
       DB_CONNECTION=sqlite \
       DB_DATABASE=/app/storage/demo.sqlite \
       CACHE_STORE=array \
       SESSION_DRIVER=array \
       composer dump-autoload --no-dev --optimize

# 2) Build Vite + React + Inertia frontend assets
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY --from=dependencies /app/vendor/laravel /app/vendor/laravel
COPY resources ./resources
COPY public ./public
COPY vite.config.js tailwind.config.js postcss.config.js babel.config.js jsconfig.json components.json ./

RUN npm run build

# 3) Final lean production runtime image
FROM base AS runtime

COPY --from=dependencies --chown=www-data:www-data /app /app
COPY --from=frontend --chown=www-data:www-data /app/public/build /app/public/build
COPY --chown=www-data:www-data Caddyfile /etc/frankenphp/Caddyfile
COPY --chown=www-data:www-data docker/vercel-entrypoint.sh /usr/local/bin/vercel-entrypoint

RUN chmod +x /usr/local/bin/vercel-entrypoint \
    && APP_ENV=production \
       APP_KEY=base64:dGhpc2lzYWJ1aWxkdGltZXRlbXBvcmFyeWtleTEyMzQ= \
       DB_CONNECTION=sqlite \
       DB_DATABASE=/app/storage/demo.sqlite \
       CACHE_STORE=array \
       SESSION_DRIVER=array \
       php artisan view:cache \
    && (APP_ENV=production APP_KEY=base64:dGhpc2lzYWJ1aWxkdGltZXRlbXBvcmFyeWtleTEyMzQ= php artisan storage:link || true) \
    && setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/frankenphp \
    && chown -R www-data:www-data /config/caddy /data/caddy /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

ENV PORT=80 \
    APP_NAME="Budget Buddy" \
    APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    CACHE_STORE=array \
    QUEUE_CONNECTION=sync \
    SESSION_DRIVER=cookie \
    SESSION_SECURE_COOKIE=true

EXPOSE 80

USER www-data

ENTRYPOINT ["/usr/local/bin/vercel-entrypoint"]
CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]
