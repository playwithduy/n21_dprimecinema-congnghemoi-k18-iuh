FROM php:8.2-apache

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache rewrite and proxy modules
RUN a2enmod rewrite proxy proxy_http proxy_wstunnel

# Fix AH10160: attempt to make remote request from mod_rewrite without proxy enabled
RUN printf "<Proxy *>\n\
    Require all granted\n\
</Proxy>\n" > /etc/apache2/conf-available/proxy-fix.conf && \
    a2enconf proxy-fix

# Set working directory
WORKDIR /var/www/html

# Copy project files to the container
COPY ./public/ .

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
