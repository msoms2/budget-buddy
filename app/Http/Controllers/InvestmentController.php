<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Models\InvestmentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class InvestmentController extends Controller
{
    use AuthorizesRequests;
    
    /**
     * Display a listing of the investments.
     */
    public function index(): Response
    {
        $investments = Auth::user()->investments()
            ->with(['category', 'performanceLogs' => function ($query) {
                $query->latest('date')->limit(1);
            }])
            ->get()
            ->map(function ($investment) {
                return [
                    'id' => $investment->id,
                    'name' => $investment->name,
                    'symbol' => $investment->symbol,
                    'category' => $investment->category ? $investment->category->name : 'Uncategorized',
                    'investment_category_id' => $investment->investment_category_id,
                    'current_value' => $investment->getCurrentValue(),
                    'initial_value' => $investment->initial_amount, // Map initial_amount to initial_value for frontend
                    'total_return' => $investment->calculateTotalReturn(),
                    'status' => $investment->status,
                    'current_amount' => $investment->current_amount,
                    'initial_amount' => $investment->initial_amount,
                    'purchase_date' => $investment->purchase_date,
                    'currency_id' => $investment->currency_id,
                    'description' => $investment->description
                ];
            });

        $categories = InvestmentCategory::all();

        // Fix portfolio metrics calculation
        $totalValue = $investments->sum('current_value');
        $totalInvested = $investments->sum('initial_amount');
        $totalGainLoss = $totalValue - $totalInvested;
        $portfolioReturnPercentage = $totalInvested > 0 ? (($totalGainLoss / $totalInvested) * 100) : 0;

        $metrics = [
            'total_value' => $totalValue,
            'total_invested' => $totalInvested,
            'total_return' => $portfolioReturnPercentage, // Fix: use portfolio-level return percentage
            'total_gain_loss' => $totalGainLoss,
            'total_investments' => $investments->count(),
            'average_return' => $investments->count() > 0 ? $investments->avg('total_return') : 0,
        ];

        // Calculate portfolio performance over time
        $performance_data = collect();
        $performanceLogs = \App\Models\InvestmentPerformanceLog::whereHas('investment', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->orderBy('date')
            ->get()
            ->groupBy('date');

        foreach ($performanceLogs as $date => $logs) {
            $totalValue = $logs->sum('current_value');
            $performance_data->push([
                'date' => $date,
                'value' => $totalValue,
            ]);
        }

        // Calculate asset allocation by category
        $asset_allocation = Auth::user()->investments()
            ->with('category')
            ->where('status', 'active')
            ->get()
            ->groupBy(function ($investment) {
                return $investment->category ? $investment->category->name : 'Uncategorized';
            })
            ->map(function ($investments, $category) {
                $totalValue = $investments->sum(function ($investment) {
                    return $investment->getCurrentValue();
                });
                return [
                    'category' => $category,
                    'value' => $totalValue,
                    'count' => $investments->count()
                ];
            })
            ->values();

        $totalPortfolioValue = $asset_allocation->sum('value');
        $asset_allocation = $asset_allocation->map(function ($allocation) use ($totalPortfolioValue) {
            $allocation['percentage'] = $totalPortfolioValue > 0 ? 
                round(($allocation['value'] / $totalPortfolioValue) * 100, 2) : 0;
            return $allocation;
        });

        return Inertia::render('Investments/Index', [
            'investments' => $investments,
            'categories' => $categories,
            'metrics' => $metrics,
            'performance_data' => $performance_data,
            'asset_allocation' => $asset_allocation
        ]);
    }

    /**
     * Store a newly created investment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'investment_category_id' => 'required|exists:investment_categories,id',
            'currency_id' => 'required|exists:currencies,id',
            'name' => 'required|string|max:255',
            'symbol' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'initial_amount' => 'required|numeric|min:0',
            'current_amount' => 'required|numeric|min:0',
            'status' => 'required|string|in:pending,active,inactive,closed',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $investment = Auth::user()->investments()->create($validated);

        return redirect()->route('investments.index');
    }

    /**
     * Display the specified investment.
     */
    public function show(Investment $investment): JsonResponse
    {
        // Check if the investment belongs to the authenticated user
        if ($investment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $investment->load(['category', 'transactions' => function ($query) {
            $query->orderByDesc('date');
        }, 'performanceLogs' => function ($query) {
            $query->latest('date')->limit(1);
        }]);

        $data = [
            'investment' => $investment,
            'metrics' => [
                'current_value' => $investment->getCurrentValue(),
                'total_invested' => $investment->getTotalInvestedAmount(),
                'total_return' => $investment->calculateTotalReturn(),
                'latest_performance' => $investment->getLatestPerformance(),
            ],
        ];

        return response()->json($data);
    }

    /**
     * Update the specified investment.
     */
    public function update(Request $request, Investment $investment)
    {
        // Check if the investment belongs to the authenticated user
        if ($investment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'investment_category_id' => 'sometimes|exists:investment_categories,id',
            'currency_id' => 'sometimes|exists:currencies,id',
            'name' => 'sometimes|string|max:255',
            'symbol' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'initial_amount' => 'sometimes|numeric|min:0',
            'current_amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:pending,active,inactive,closed',
            'purchase_date' => 'sometimes|date',
            'notes' => 'nullable|string'
        ]);

        $investment->update($validated);

        return redirect()->route('investments.index');
    }

    /**
     * Remove the specified investment.
     */
    public function destroy(Investment $investment)
    {
        // Check if the investment belongs to the authenticated user
        if ($investment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $investment->delete();

        return redirect()->route('investments.index');
    }

    /**
     * Get list of investment categories.
     */
    public function categories(): JsonResponse
    {
        $categories = InvestmentCategory::all();
        return response()->json($categories);
    }
}
