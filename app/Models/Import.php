<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Import extends Model
{
    use HasFactory;

    protected $fillable = [
        'completed_at',
        'file_name',
        'file_path',
        'importer',
        'processed_rows',
        'total_rows',
        'successful_rows',
        'user_id',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that initiated this import.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the failed import rows for this import.
     */
    public function failedRows(): HasMany
    {
        return $this->hasMany(FailedImportRow::class);
    }

    /**
     * Get the calculated status of the import.
     */
    public function getStatusAttribute(): string
    {
        if ($this->completed_at) {
            return 'completed';
        }
        
        if ($this->processed_rows > 0) {
            return 'pending';
        }
        
        return 'pending';
    }

    /**
     * Get the calculated progress percentage.
     */
    public function getProgressAttribute(): float
    {
        if ($this->total_rows == 0) {
            return 0;
        }
        
        return ($this->processed_rows / $this->total_rows) * 100;
    }
}