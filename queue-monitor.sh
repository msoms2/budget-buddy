#!/bin/bash
# Budget Buddy Queue Worker Monitor Script

LOG_FILE="/usr/local/budget-buddy-nosleguma-darbs/storage/logs/queue-monitor.log"
QUEUE_LOG="/usr/local/budget-buddy-nosleguma-darbs/storage/logs/queue.log"
PROJECT_DIR="/usr/local/budget-buddy-nosleguma-darbs"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to start queue worker
start_queue_worker() {
    cd "$PROJECT_DIR"
    nohup php artisan queue:work --daemon --sleep=3 --tries=3 --max-time=3600 > "$QUEUE_LOG" 2>&1 &
    QUEUE_PID=$!
    log_message "Started queue worker with PID: $QUEUE_PID"
}

# Function to check if queue worker is running
is_queue_running() {
    pgrep -f "queue:work" > /dev/null
    return $?
}

# Main monitoring loop
log_message "Queue monitor started"

while true; do
    if ! is_queue_running; then
        log_message "Queue worker not running, starting new instance..."
        start_queue_worker
    fi
    
    # Wait 30 seconds before checking again
    sleep 30
done
