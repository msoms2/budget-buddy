#!/bin/bash

# Install mkcert
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Install local CA
mkcert -install

# Generate certificates for localhost
mkcert localhost 127.0.0.1

# Create certs directory and move certificates
mkdir -p certs
mv localhost+1-key.pem certs/key.pem
mv localhost+1.pem certs/cert.pem

# Update serve.sh
cat > serve.sh << 'EOF'
#!/bin/bash

# Start Vite dev server
npm run dev &

# Start Laravel with SSL
php artisan serve --host=localhost --port=8443 --no-reload \
    --config="variables_order=EGPCS" \
    --config="openssl.cafile=$(pwd)/certs/cert.pem" \
    --config="openssl.capath=/etc/ssl/certs"
EOF

chmod +x serve.sh
