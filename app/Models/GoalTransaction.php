<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoalTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'amount',
        'transaction_date',
        'notes',
        'user_id'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::creating(function ($transaction) {
            $transaction->user_id = $transaction->goal->user_id;
        });

        static::created(function ($transaction) {
            // Update the goal's progress when a transaction is created
            $transaction->goal->updateProgress($transaction->amount);
        });
    }
}