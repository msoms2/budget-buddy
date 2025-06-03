<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Creditor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'amount_owed',
        'interest_rate',
        'due_date',
        'user_id',
        'payment_frequency',
        'minimum_payment',
        'contact_info',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_owed' => 'decimal:2',
            'interest_rate' => 'decimal:2',
            'minimum_payment' => 'decimal:2',
            'due_date' => 'date',
        ];
    }

    /**
     * Get the user that owns this creditor.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
