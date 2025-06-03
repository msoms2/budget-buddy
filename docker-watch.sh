#!/bin/bash

# Docker Compose Watch Helper Script
# This script helps to run Docker Compose with watch functionality

set -e

# Default configuration
CONFIG_FILES="-f docker-compose.yml -f docker-compose.watch.yml"
COMMAND="up -d"

# Help function
show_help() {
    echo "Docker Compose Watch Helper"
    echo "Usage: ./docker-watch.sh [options] [command]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -f, --follow   Follow logs after starting containers"
    echo ""
    echo "Commands:"
    echo "  up             Start containers with watch (default)"
    echo "  down           Stop containers"
    echo "  restart        Restart containers with watch"
    echo "  logs           Show logs"
    echo ""
    echo "Examples:"
    echo "  ./docker-watch.sh            # Start containers with watch"
    echo "  ./docker-watch.sh -f         # Start containers and follow logs"
    echo "  ./docker-watch.sh down       # Stop containers"
}

# Process options
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--follow)
            FOLLOW_LOGS=true
            shift
            ;;
        up|down|restart|logs)
            if [ "$1" == "up" ]; then
                COMMAND="up -d"
            elif [ "$1" == "down" ]; then
                COMMAND="down"
            elif [ "$1" == "restart" ]; then
                COMMAND="restart"
            elif [ "$1" == "logs" ]; then
                COMMAND="logs"
                if [ "$FOLLOW_LOGS" == "true" ]; then
                    COMMAND="$COMMAND -f"
                fi
            fi
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if docker-compose.watch.yml exists
if [ ! -f "docker-compose.watch.yml" ]; then
    echo "Error: docker-compose.watch.yml not found"
    exit 1
fi

# Execute docker compose command with watch
echo "Running: docker compose $CONFIG_FILES $COMMAND"
docker compose $CONFIG_FILES $COMMAND

# Follow logs if requested
if [ "$FOLLOW_LOGS" == "true" ] && [ "$COMMAND" == "up -d" ]; then
    echo "Following logs..."
    docker compose $CONFIG_FILES logs -f
fi

# Display helpful message after starting
if [ "$COMMAND" == "up -d" ]; then
    echo ""
    echo "✅ Budget Buddy is now running with Docker Compose Watch!"
    echo "   Access the application at: http://localhost"
    echo "   Access phpMyAdmin at: http://localhost:8080"
    echo ""
    echo "📝 File changes in monitored directories will be automatically synced."
    echo "   You can view logs with: ./docker-watch.sh logs"
fi