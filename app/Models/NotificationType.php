<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotificationType extends Model
{
    use HasFactory;
    protected $fillable = [
        'slug',
        'name',
        'description'
    ];

    /**
     * Get the notifications for this type.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get the notification settings for this type.
     */
    public function notificationSettings(): HasMany
    {
        return $this->hasMany(NotificationSetting::class);
    }
}