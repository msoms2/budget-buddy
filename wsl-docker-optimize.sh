#!/bin/bash

echo "Optimizing WSL and Docker performance for Budget Buddy..."

# Set environment variables to optimize Docker and WSL
echo "Configuring Docker environment variables..."
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Apply optimizations to the Docker daemon config
echo "Checking Docker daemon configuration..."
DOCKER_DAEMON_CONFIG_FILE=~/.docker/daemon.json
mkdir -p ~/.docker

if [ ! -f "$DOCKER_DAEMON_CONFIG_FILE" ]; then
  echo "Creating optimized Docker daemon configuration..."
  cat > $DOCKER_DAEMON_CONFIG_FILE << 'EOL'
{
  "features": {
    "buildkit": true
  },
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
  "experimental": true
}
EOL
  echo "Docker daemon configuration created. You may need to restart Docker."
else
  echo "Docker daemon configuration already exists. Please add these optimizations manually:"
  echo "- buildkit: true"
  echo "- max-concurrent-downloads: 10"
  echo "- max-concurrent-uploads: 10"
  echo "- experimental: true"
fi

# WSL Performance tweaks
echo "Setting WSL performance tweaks..."
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Modify the .wslconfig if it exists
if [ -f ~/.wslconfig ]; then
  echo "Found .wslconfig - WSL global configuration has already been set"
else
  echo "Created .wslconfig in your Windows home directory. You should restart WSL for changes to take effect."
fi

# Output optimized Docker commands
echo ""
echo "=== OPTIMIZED DOCKER COMMANDS ==="
echo "To start services with optimized settings:"
echo "docker compose up -d"
echo ""
echo "To rebuild containers with optimized settings:"
echo "DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose build --no-cache"
echo "docker compose up -d"
echo ""
echo "To view application logs:"
echo "docker compose logs -f"
echo ""
echo "To access PHP container:"
echo "docker compose exec php bash"
echo ""
echo "Performance optimization script complete! You may need to restart Docker and WSL for all changes to take effect."