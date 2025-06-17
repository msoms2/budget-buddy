<?php

namespace App\Observers;

use App\Models\Earning;
use App\Models\Goal;

class EarningObserver
{
    /**
     * Handle the Earning "created" event.
     */
    public function created(Earning $earning): void
    {
        $this->updateRelatedGoals($earning);
    }

    /**
     * Handle the Earning "updated" event.
     */
    public function updated(Earning $earning): void
    {
        $this->updateRelatedGoals($earning);
        
        // If the subcategory changed, update goals for the old category too
        if ($earning->isDirty('subcategory_id')) {
            $originalSubcategoryId = $earning->getOriginal('subcategory_id');
            if ($originalSubcategoryId) {
                $this->updateGoalsForCategory($earning->user_id, $originalSubcategoryId);
            }
        }
    }

    /**
     * Handle the Earning "deleted" event.
     */
    public function deleted(Earning $earning): void
    {
        $this->updateRelatedGoals($earning);
    }

    /**
     * Update goals related to this earning.
     */
    private function updateRelatedGoals(Earning $earning): void
    {
        if ($earning->subcategory_id) {
            $this->updateGoalsForCategory($earning->user_id, $earning->subcategory_id);
        }
    }

    /**
     * Update all goals for a specific category and user.
     */
    private function updateGoalsForCategory(int $userId, int $categoryId): void
    {
        $goals = Goal::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('status', 'active')
            ->get();

        foreach ($goals as $goal) {
            $this->updateGoalStatus($goal);
        }
    }

    /**
     * Update goal status based on current progress.
     */
    private function updateGoalStatus(Goal $goal): void
    {
        $totalAmount = $goal->total_amount;
        
        if ($totalAmount >= $goal->target_amount && $goal->status === 'active') {
            $goal->update(['status' => 'completed']);
        } elseif ($totalAmount < $goal->target_amount && $goal->status === 'completed') {
            // If the goal was completed but now has less than target amount, mark as active again
            $goal->update(['status' => 'active']);
        }
    }
}