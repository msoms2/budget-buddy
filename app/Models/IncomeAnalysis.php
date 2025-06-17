<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class IncomeAnalysis extends Model
{
    public function calculateDiversityScore()
    {
        // Calculate diversity score based on unique categories
        $totalEarnings = Earning::count();
        if ($totalEarnings === 0) {
            return 0;
        }

        $categoryTypeCounts = Earning::select('category_id')
            ->whereNotNull('category_id')
            ->groupBy('category_id')
            ->get()
            ->count();

        // Score is ratio of unique categories to total earnings, normalized to 0-100
        return min(($categoryTypeCounts / $totalEarnings) * 100, 100);
    }

    public function calculateStabilityScore()
    {
        // Calculate stability based on recurring income percentages
        $totalEarnings = Earning::count();
        if ($totalEarnings === 0) {
            return 0;
        }

        // Calculate percentage of recurring earnings
        $recurringCount = Earning::where('is_recurring', true)->count();
        $recurringPercentage = ($recurringCount / $totalEarnings) * 100;
        
        // Simple stability score based on recurring percentage
        $stabilityScore = $recurringPercentage * 0.7;
        
        // Add some variance based on category distribution
        $categoryDistribution = $this->calculateCategoryDistribution();
        $categoryScore = count($categoryDistribution) > 0 ? 30 : 0;
        
        return round($stabilityScore + $categoryScore, 2);
    }

    public function getIncomeDistribution()
    {
        // Get distribution of income by category
        return Earning::select('category_id', DB::raw('SUM(amount) as total_amount'))
            ->groupBy('category_id')
            ->get()
            ->mapWithKeys(function ($item) {
                $categoryName = optional(EarningCategory::find($item->category_id))->name ?? 'Uncategorized';
                return [$categoryName => $item->total_amount];
            });
    }

    public function calculateRecurringPercentage()
    {
        // Calculate percentage of income that is recurring
        $totalAmount = Earning::sum('amount');
        if ($totalAmount === 0) {
            return 0;
        }

        $recurringAmount = Earning::where('is_recurring', true)
            ->sum('amount');

        return round(($recurringAmount / $totalAmount) * 100, 2);
    }
    
    public function calculateCategoryDistribution()
    {
        // Get the distribution of earnings across different categories
        return Earning::select('category_id', DB::raw('COUNT(*) as count'))
            ->groupBy('category_id')
            ->get()
            ->mapWithKeys(function ($item) {
                $categoryName = optional(EarningCategory::find($item->category_id))->name ?? 'Uncategorized';
                return [$categoryName => $item->count];
            });
    }
}