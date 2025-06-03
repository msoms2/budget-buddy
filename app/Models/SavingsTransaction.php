<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'savings_id',
        'user_id',
        'amount',
        'description',
        'transaction_date',
        'type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function savings()
    {
        return $this->belongsTo(Savings::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}