<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationSetting extends Model
{
    protected $fillable = [
        'user_id',
        'notification_type_id',
        'is_enabled',
        'frequency',
        'channels'
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'channels' => 'array'
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['notification_type'];

    /**
     * Get the notification type as notification_type (snake_case).
     */
    public function getNotificationTypeAttribute()
    {
        return $this->relationLoaded('notificationType') ? $this->notificationType : null;
    }

    /**
     * Boot function from the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Ensure channels is an array and not empty
            if (empty($model->channels) || !is_array($model->channels)) {
                $model->channels = ['email', 'in_app'];
            }
        });
    }

    /**
     * Get the user that owns the notification setting.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the notification type that owns the notification setting.
     */
    public function notificationType(): BelongsTo
    {
        return $this->belongsTo(NotificationType::class);
    }

    /**
     * Check if a specific channel is enabled for this notification setting.
     */
    public function isChannelEnabled(string $channel): bool
    {
        return in_array($channel, $this->channels);
    }

    /**
     * Get the available frequency options.
     */
    public static function getFrequencyOptions(): array
    {
        return [
            'immediate' => 'Immediate',
            'daily' => 'Daily Digest',
            'weekly' => 'Weekly Digest'
        ];
    }

    /**
     * Get the available channel options.
     */
    public static function getChannelOptions(): array
    {
        return [
            'email' => 'Email',
            'in_app' => 'In-App Notification',
            'sms' => 'SMS'
        ];
    }
}