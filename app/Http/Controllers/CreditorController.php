<?php

namespace App\Http\Controllers;

use App\Models\Creditor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class CreditorController extends Controller
{
    /**
     * Display a listing of the debts.
     */
    public function index(): Response
    {
        $debts = Creditor::where('user_id', Auth::id())->get();
        return Inertia::render('Creditors/Index', [
            'debts' => $debts
        ]);
    }

    /**
     * Show the form for creating a new debt.
     */
    public function create(): Response
    {
        return Inertia::render('Creditors/Create');
    }

    /**
     * Store a newly created debt.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount_owed' => 'required|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'due_date' => 'nullable|date',
            'payment_frequency' => 'nullable|string|in:weekly,biweekly,monthly,quarterly,annually',
            'minimum_payment' => 'nullable|numeric|min:0',
            'contact_info' => 'nullable|string',
            'status' => 'required|string|in:active,paid,defaulted'
        ]);

        $validated['user_id'] = Auth::id();
        $debt = Creditor::create($validated);

        return redirect()->route('creditors.show', $debt)->with('success', 'Debt created successfully!');
    }

    /**
     * Display the specified debt.
     */
    public function show(Creditor $creditor): Response
    {
        if ($creditor->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Get all debts for the user for repayment strategy comparison
        $allDebts = Creditor::where('user_id', Auth::id())
            ->where('status', 'active')
            ->get()
            ->map(function ($debt) {
                return [
                    'id' => $debt->id,
                    'name' => $debt->name,
                    'balance' => $debt->amount_owed,
                    'interest_rate' => $debt->interest_rate,
                    'minimum_payment' => $debt->minimum_payment,
                    'due_date' => $debt->due_date
                ];
            });

        return Inertia::render('Creditors/Show', [
            'creditor' => $creditor,
            'allDebts' => $allDebts
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Creditor $creditor): Response
    {
        if ($creditor->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Creditors/Edit', [
            'creditor' => $creditor
        ]);
    }

    /**
     * Update the specified debt.
     */
    public function update(Request $request, Creditor $creditor): RedirectResponse
    {
        if ($creditor->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'amount_owed' => 'sometimes|numeric|min:0',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'due_date' => 'nullable|date',
            'payment_frequency' => 'nullable|string|in:weekly,biweekly,monthly,quarterly,annually',
            'minimum_payment' => 'nullable|numeric|min:0',
            'contact_info' => 'nullable|string',
            'status' => 'sometimes|string|in:active,paid,defaulted'
        ]);

        $creditor->update($validated);

        return redirect()->route('creditors.show', $creditor)->with('success', 'Debt updated successfully!');
    }

    /**
     * Remove the specified debt.
     */
    public function destroy(Creditor $creditor): RedirectResponse
    {
        if ($creditor->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $creditor->delete();
        return redirect()->route('creditors.index')->with('success', 'Debt deleted successfully!');
    }

    /**
     * Calculate total interest over a specified period.
     */
    public function calculateInterest(Creditor $creditor, Request $request): JsonResponse
    {
        if ($creditor->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'months' => 'required|integer|min:1',
            'payment_amount' => 'nullable|numeric|min:0'
        ]);

        $months = $validated['months'];
        $payment = $validated['payment_amount'] ?? $creditor->minimum_payment ?? 0;
        $balance = $creditor->amount_owed;
        $rate = $creditor->interest_rate / 100 / 12; // Monthly interest rate

        $totalInterest = 0;
        $remainingBalance = $balance;
        $paymentSchedule = [];

        for ($i = 1; $i <= $months; $i++) {
            $monthlyInterest = $remainingBalance * $rate;
            $totalInterest += $monthlyInterest;
            
            $principalPayment = min($payment - $monthlyInterest, $remainingBalance);
            $remainingBalance = max(0, $remainingBalance - $principalPayment);

            $paymentSchedule[] = [
                'month' => $i,
                'interest_paid' => round($monthlyInterest, 2),
                'principal_paid' => round($principalPayment, 2),
                'remaining_balance' => round($remainingBalance, 2)
            ];

            if ($remainingBalance <= 0) break;
        }

        return response()->json([
            'total_interest' => round($totalInterest, 2),
            'final_balance' => round($remainingBalance, 2),
            'payment_schedule' => $paymentSchedule
        ]);
    }

    /**
     * Compare debt repayment strategies (snowball vs avalanche).
     */
    public function compareStrategies(): JsonResponse
    {
        $debts = Creditor::where('user_id', Auth::id())
            ->where('status', 'active')
            ->get();

        if ($debts->isEmpty()) {
            return response()->json(['message' => 'No active debts found']);
        }

        // Snowball strategy (smallest balance first)
        $snowball = $debts->sortBy('amount_owed')->values();
        
        // Avalanche strategy (highest interest rate first)
        $avalanche = $debts->sortByDesc('interest_rate')->values();

        $strategies = [
            'snowball' => [
                'description' => 'Pay smallest balances first',
                'order' => $snowball->map(fn($debt) => [
                    'name' => $debt->name,
                    'amount' => $debt->amount_owed,
                    'interest_rate' => $debt->interest_rate
                ])
            ],
            'avalanche' => [
                'description' => 'Pay highest interest rates first',
                'order' => $avalanche->map(fn($debt) => [
                    'name' => $debt->name,
                    'amount' => $debt->amount_owed,
                    'interest_rate' => $debt->interest_rate
                ])
            ]
        ];

        // Calculate potential interest savings with avalanche method
        $totalInterestSnowball = $this->calculateTotalInterest($snowball);
        $totalInterestAvalanche = $this->calculateTotalInterest($avalanche);
        $interestSavings = $totalInterestSnowball - $totalInterestAvalanche;

        return response()->json([
            'strategies' => $strategies,
            'analysis' => [
                'total_interest_snowball' => round($totalInterestSnowball, 2),
                'total_interest_avalanche' => round($totalInterestAvalanche, 2),
                'potential_savings' => round($interestSavings, 2)
            ]
        ]);
    }

    /**
     * Helper method to calculate total interest for a given debt order.
     */
    private function calculateTotalInterest($debts): float
    {
        $totalInterest = 0;
        $monthlyPayment = $debts->sum('minimum_payment');
        $extraPayment = 0;

        while ($debts->where('amount_owed', '>', 0)->count() > 0) {
            foreach ($debts as $debt) {
                if ($debt->amount_owed <= 0) {
                    $extraPayment += $debt->minimum_payment;
                    continue;
                }

                $rate = $debt->interest_rate / 100 / 12;
                $interest = $debt->amount_owed * $rate;
                $totalInterest += $interest;

                $payment = $debt->minimum_payment + $extraPayment;
                $debt->amount_owed = max(0, $debt->amount_owed + $interest - $payment);
            }
        }

        return $totalInterest;
    }
}