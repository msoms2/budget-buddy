<?php

namespace App\Http\Controllers;

use App\Models\Investment;
use App\Models\InvestmentTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvestmentTransactionController extends Controller
{
    /**
     * List transactions for an investment.
     */
    public function index(Investment $investment): JsonResponse
    {
        $this->authorize('view', $investment);

        $transactions = $investment->transactions()
            ->orderByDesc('date')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->transaction_type,
                    'date' => $transaction->date->format('Y-m-d'),
                    'quantity' => $transaction->quantity,
                    'price_per_unit' => $transaction->price_per_unit,
                    'total_amount' => $transaction->total_amount,
                    'fees' => $transaction->fees,
                    'total_cost' => $transaction->getTotalCost(),
                    'cost_per_unit' => $transaction->getCostPerUnit(),
                    'notes' => $transaction->notes,
                ];
            });

        return response()->json($transactions);
    }

    /**
     * Store a new transaction.
     */
    public function store(Request $request, Investment $investment): JsonResponse
    {
        $this->authorize('update', $investment);

        $validated = $request->validate([
            'transaction_type' => ['required', 'string', Rule::in(['buy', 'sell'])],
            'date' => 'required|date',
            'quantity' => 'required|numeric|min:0',
            'price_per_unit' => 'required|numeric|min:0',
            'fees' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Calculate total amount
        $validated['total_amount'] = $validated['quantity'] * $validated['price_per_unit'];
        $validated['fees'] = $validated['fees'] ?? 0;

        // For sell transactions, verify sufficient quantity exists
        if ($validated['transaction_type'] === 'sell') {
            $totalBought = $investment->transactions()
                ->where('transaction_type', 'buy')
                ->sum('quantity');
                
            $totalSold = $investment->transactions()
                ->where('transaction_type', 'sell')
                ->sum('quantity');

            $availableQuantity = $totalBought - $totalSold;

            if ($validated['quantity'] > $availableQuantity) {
                return response()->json([
                    'message' => 'Insufficient quantity available for sale',
                    'available_quantity' => $availableQuantity
                ], 422);
            }
        }

        $transaction = $investment->transactions()->create($validated);

        return response()->json($transaction, 201);
    }

    /**
     * Update a transaction.
     */
    public function update(Request $request, Investment $investment, InvestmentTransaction $transaction): JsonResponse
    {
        $this->authorize('update', $investment);

        if ($transaction->investment_id !== $investment->id) {
            return response()->json(['message' => 'Transaction does not belong to this investment'], 403);
        }

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'quantity' => 'sometimes|numeric|min:0',
            'price_per_unit' => 'sometimes|numeric|min:0',
            'fees' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['quantity']) || isset($validated['price_per_unit'])) {
            $validated['total_amount'] = 
                ($validated['quantity'] ?? $transaction->quantity) * 
                ($validated['price_per_unit'] ?? $transaction->price_per_unit);
        }

        $transaction->update($validated);

        return response()->json($transaction);
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Investment $investment, InvestmentTransaction $transaction): JsonResponse
    {
        $this->authorize('update', $investment);

        if ($transaction->investment_id !== $investment->id) {
            return response()->json(['message' => 'Transaction does not belong to this investment'], 403);
        }

        $transaction->delete();

        return response()->json(null, 204);
    }
}