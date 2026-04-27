# Multi-stage Dockerfile for Budget Buddy

# 1) Install Composer dependencies
FROM php:8.2-cli AS composer
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# 2) Build frontend assets
FROM node:20-alpine AS node-builder
WORKDIR /var/www/html
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 3) Runtime image
FROM php:8.2-fpm AS runtime
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql zip exif pcntl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd
RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer /var/www/html/vendor ./vendor
COPY --from=composer /var/www/html/composer.lock ./composer.lock
COPY --from=composer /var/www/html/composer.json ./composer.json
COPY --from=node-builder /var/www/html/public/build ./public/build

COPY . .
COPY docker/php/custom-php.ini /usr/local/etc/php/conf.d/custom-php.ini
COPY docker/php/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/framework/testing storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache || true \
    && chown -R www-data:www-data storage bootstrap/cache || true

EXPOSE 8080
ENTRYPOINT ["docker-entrypoint"]
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port ${PORT:-8080}"]
