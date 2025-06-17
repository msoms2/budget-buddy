<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FailedImportRow extends Model
{
    use HasFactory;

    protected $fillable = [
        'data',
        'import_id',
        'validation_error',
    ];

    protected $casts = [
        'data' => 'json',
    ];

    /**
     * Get the import that this failed row belongs to.
     */
    public function import(): BelongsTo
    {
        return $this->belongsTo(Import::class);
    }
}