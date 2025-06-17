<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'icon_color',
        'bg_color',
        'user_id',
        'is_default',
        'is_active',
        'is_credit', // Whether this is a credit payment method
        'last_four', // For storing last 4 digits of card number if applicable
        'expiry_date', // For storing expiry date if applicable
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'is_credit' => 'boolean',
        'expiry_date' => 'date',
    ];

    /**
     * Get the user that owns the payment method.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the expenses for this payment method.
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}