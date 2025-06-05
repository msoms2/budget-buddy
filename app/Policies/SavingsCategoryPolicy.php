<?php

namespace App\Policies;

use App\Models\SavingsCategory;
use App\Models\User;

class SavingsCategoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view categories
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SavingsCategory $category): bool
    {
        // Users can view system categories and their own categories
        return $category->is_system || $category->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create categories
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SavingsCategory $category): bool
    {
        // Users can only update their own non-system categories
        return !$category->is_system && $category->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SavingsCategory $category): bool
    {
        // Users can only delete their own non-system categories
        if ($category->is_system || $category->user_id !== $user->id) {
            return false;
        }

        // Cannot delete categories with children or active savings
        return !$category->children()->exists() && !$category->savings()->exists();
    }
}
