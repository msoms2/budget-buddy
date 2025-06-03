# Queue Management Guide

## Current Status
✅ **FIXED**: Data exporting was stuck in pending state due to missing queue worker and relationship issues.

## What was fixed:
1. **Missing PaymentMethod Relationship**: The `Earning` model was missing the `paymentMethod` relationship which caused exports to fail
2. **Incorrect Fillable Field**: Changed `payment_method` to `payment_method_id` in the Earning model
3. **No Queue Worker Running**: Started a queue worker daemon to process export jobs

## Queue Worker Management

### Check if queue worker is running:
```bash
ps aux | grep "queue:work"
```

### Start queue worker manually:
```bash
cd /usr/local/budget-buddy-nosleguma-darbs
nohup php artisan queue:work --daemon --sleep=3 --tries=3 --max-time=3600 > storage/logs/queue.log 2>&1 &
```

### Stop queue worker:
```bash
pkill -f "queue:work"
```

### Check queue status:
```bash
php artisan queue:work --once  # Process one job
php artisan queue:failed       # Show failed jobs
php artisan queue:flush        # Clear all failed jobs
```

### Monitor queue logs:
```bash
tail -f storage/logs/queue.log
tail -f storage/logs/laravel.log
```

## Queue Monitor Script
A monitoring script has been created at `/usr/local/budget-buddy-nosleguma-darbs/queue-monitor.sh` that will automatically restart the queue worker if it stops.

To run it:
```bash
./queue-monitor.sh &
```

## Export Status Check
```bash
php artisan tinker --execute="
echo 'Pending: ' . App\Models\Export::where('status', 'pending')->count() . PHP_EOL;
echo 'Completed: ' . App\Models\Export::where('status', 'completed')->count() . PHP_EOL;
echo 'Failed: ' . App\Models\Export::where('status', 'failed')->count() . PHP_EOL;
"
```

## Troubleshooting

### If exports are still failing:
1. Check the Laravel log: `tail -50 storage/logs/laravel.log`
2. Check the queue log: `tail -20 storage/logs/queue.log`
3. Verify relationships in models are correct
4. Ensure queue worker is running
5. Try processing one job manually: `php artisan queue:work --once`

### Common Issues:
- **RelationNotFoundException**: Missing relationship definitions in models
- **Queue worker not running**: Start with the command above
- **Database connection issues**: Check .env file database settings
- **Permission issues**: Ensure storage directory is writable
