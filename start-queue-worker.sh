#!/bin/bash

# Start Laravel queue worker
cd /usr/local/budget-buddy-nosleguma-darbs

# Kill any existing queue workers
pkill -f "artisan queue:work"

# Start queue worker in background
nohup php artisan queue:work --daemon > storage/logs/queue.log 2>&1 &

echo "Queue worker started. Check storage/logs/queue.log for logs."