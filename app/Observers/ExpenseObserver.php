<?php

namespace App\Observers;

use App\Models\Expense;
use App\Models\Budget;
use Illuminate\Support\Facades\Log;

class ExpenseObserver
{
    /**
     * Handle the Expense "created" event.
     */
    public function created(Expense $expense): void
    {
        $this->updateRelatedBudgets($expense);
    }

    /**
     * Handle the Expense "updated" event.
     */
    public function updated(Expense $expense): void
    {
        $this->updateRelatedBudgets($expense);
        
        // If category or date changed, also update budgets for the old values
        if ($expense->isDirty('category_id') || $expense->isDirty('date')) {
            $this->updateRelatedBudgetsForOldValues($expense);
        }
    }

    /**
     * Handle the Expense "deleted" event.
     */
    public function deleted(Expense $expense): void
    {
        $this->updateRelatedBudgets($expense);
    }

    /**
     * Update budgets that are related to this expense
     */
    private function updateRelatedBudgets(Expense $expense): void
    {
        try {
            // Find all active budgets for this user and category
            $budgets = Budget::where('user_id', $expense->user_id)
                ->where('category_id', $expense->category_id)
                ->where('start_date', '<=', $expense->date)
                ->where('end_date', '>=', $expense->date)
                ->get();

            foreach ($budgets as $budget) {
                // Force refresh the budget's calculated attributes
                $budget->refresh();
                
                // Log the budget update for debugging
                Log::info('Budget progress updated automatically', [
                    'budget_id' => $budget->id,
                    'budget_name' => $budget->name,
                    'expense_id' => $expense->id,
                    'expense_amount' => $expense->amount,
                    'new_spent_amount' => $budget->getSpentAttribute(),
                    'utilization' => $budget->calculateUtilization()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to update related budgets for expense', [
                'expense_id' => $expense->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update budgets for old category/date values when expense is updated
     */
    private function updateRelatedBudgetsForOldValues(Expense $expense): void
    {
        try {
            $oldCategoryId = $expense->getOriginal('category_id');
            $oldDate = $expense->getOriginal('date');

            if ($oldCategoryId && $oldDate) {
                // Find budgets that were affected by the old values
                $oldBudgets = Budget::where('user_id', $expense->user_id)
                    ->where('category_id', $oldCategoryId)
                    ->where('start_date', '<=', $oldDate)
                    ->where('end_date', '>=', $oldDate)
                    ->get();

                foreach ($oldBudgets as $budget) {
                    // Force refresh the budget's calculated attributes
                    $budget->refresh();
                    
                    Log::info('Budget progress updated for old values', [
                        'budget_id' => $budget->id,
                        'budget_name' => $budget->name,
                        'expense_id' => $expense->id,
                        'old_category_id' => $oldCategoryId,
                        'old_date' => $oldDate
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to update budgets for old expense values', [
                'expense_id' => $expense->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}