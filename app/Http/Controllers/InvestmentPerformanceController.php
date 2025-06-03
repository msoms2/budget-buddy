<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Models\InvestmentPerformanceLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvestmentPerformanceController extends Controller
{
    /**
     * Get investment performance metrics.
     */
    public function show(Investment $investment): JsonResponse
    {
        $this->authorize('view', $investment);

        $latestPerformance = $investment->getLatestPerformance();
        $totalInvested = $investment->getTotalInvestedAmount();

        $metrics = [
            'current_value' => $investment->getCurrentValue(),
            'total_invested' => $totalInvested,
            'total_return' => $investment->calculateTotalReturn(),
            'unrealized_gain' => $latestPerformance?->unrealized_gain ?? 0,
            'realized_gain' => $latestPerformance?->realized_gain ?? 0,
            'total_gain' => $latestPerformance ? $latestPerformance->getTotalGain() : 0,
        ];

        return response()->json($metrics);
    }

    /**
     * Log current value and calculate performance metrics.
     */
    public function store(Request $request, Investment $investment): JsonResponse
    {
        $this->authorize('update', $investment);

        $validated = $request->validate([
            'current_value' => 'required|numeric|min:0',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $totalInvested = $investment->getTotalInvestedAmount();
        $unrealizedGain = $validated['current_value'] - $totalInvested;
        
        // Get total realized gains from sell transactions
        $realizedGain = $investment->transactions()
            ->where('transaction_type', 'sell')
            ->sum('total_amount') - 
            $investment->transactions()
            ->where('transaction_type', 'sell')
            ->sum(\DB::raw('quantity * price_per_unit'));

        // Calculate total return percentage
        $totalReturnPercentage = $totalInvested > 0 
            ? (($validated['current_value'] - $totalInvested) / $totalInvested) * 100 
            : 0;

        $performanceLog = $investment->performanceLogs()->create([
            'date' => $validated['date'],
            'current_value' => $validated['current_value'],
            'unrealized_gain' => $unrealizedGain,
            'realized_gain' => $realizedGain,
            'total_return_percentage' => $totalReturnPercentage,
        ]);

        return response()->json($performanceLog, 201);
    }

    /**
     * Get historical performance data.
     */
    public function history(Request $request, Investment $investment): JsonResponse
    {
        $this->authorize('view', $investment);

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $performanceLogs = $investment->performanceLogs()
            ->inDateRange($validated['start_date'], $validated['end_date'])
            ->orderBy('date')
            ->get()
            ->map(function ($log) {
                return [
                    'date' => $log->date->format('Y-m-d'),
                    'current_value' => $log->current_value,
                    'unrealized_gain' => $log->unrealized_gain,
                    'realized_gain' => $log->realized_gain,
                    'total_return_percentage' => $log->total_return_percentage,
                    'value_change' => $log->getValueChangeSinceLastLog(),
                ];
            });

        return response()->json($performanceLogs);
    }
}