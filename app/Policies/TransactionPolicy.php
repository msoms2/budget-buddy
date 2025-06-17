<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Expense;
use App\Models\Earning;

class TransactionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view their transactions
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, $transaction): bool
    {
        // Check based on transaction type
        if (str_starts_with($transaction->id, 'expense-')) {
            $id = substr($transaction->id, 8);
            $expense = Expense::find($id);
            return $expense && $user->id === $expense->user_id;
        } elseif (str_starts_with($transaction->id, 'income-')) {
            $id = substr($transaction->id, 7);
            $earning = Earning::find($id);
            return $earning && $user->id === $earning->user_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create transactions
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, $transaction): bool
    {
        // Check based on transaction type
        if (str_starts_with($transaction->id, 'expense-')) {
            $id = substr($transaction->id, 8);
            $expense = Expense::find($id);
            return $expense && $user->id === $expense->user_id;
        } elseif (str_starts_with($transaction->id, 'income-')) {
            $id = substr($transaction->id, 7);
            $earning = Earning::find($id);
            return $earning && $user->id === $earning->user_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, $transaction): bool
    {
        // Check based on transaction type
        if (str_starts_with($transaction->id, 'expense-')) {
            $id = substr($transaction->id, 8);
            $expense = Expense::find($id);
            return $expense && $user->id === $expense->user_id;
        } elseif (str_starts_with($transaction->id, 'income-')) {
            $id = substr($transaction->id, 7);
            $earning = Earning::find($id);
            return $earning && $user->id === $earning->user_id;
        }
        
        return false;
    }
}