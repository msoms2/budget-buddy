<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpensesReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpensesReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reports = ExpensesReport::where('user_id', Auth::id())->get();
        return view('expenses-reports.index', compact('reports'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('expenses-reports.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_date' => ['required', 'date'],
            'to_date' => ['required', 'date', 'after_or_equal:from_date'],
        ]);

        // Calculate the sum of expenses within the date range
        $total = Expense::where('user_id', Auth::id())
            ->whereBetween('date', [$validated['from_date'], $validated['to_date']])
            ->sum('amount');

        $validated['user_id'] = Auth::id();
        $validated['amount'] = $total;

        $report = ExpensesReport::create($validated);

        return redirect()->route('expenses-reports.show', $report)->with('success', 'Expense report created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ExpensesReport $expensesReport)
    {
        $this->authorizeUser($expensesReport);
        
        // Get the expenses within the date range for the report
        $expenses = Expense::where('user_id', Auth::id())
            ->whereBetween('date', [$expensesReport->from_date, $expensesReport->to_date])
            ->with('category')
            ->get();
            
        // Group expenses by category
        $expensesByCategory = $expenses->groupBy('category_id')
            ->map(function ($group) {
                return [
                    'category' => $group->first()->category,
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                    'expenses' => $group
                ];
            });
            
        return view('expenses-reports.show', compact('expensesReport', 'expenses', 'expensesByCategory'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExpensesReport $expensesReport)
    {
        $this->authorizeUser($expensesReport);
        
        $expensesReport->delete();

        return redirect()->route('expenses-reports.index')->with('success', 'Expense report deleted successfully!');
    }

    /**
     * Authorize that the current user owns the report.
     */
    private function authorizeUser(ExpensesReport $expensesReport)
    {
        if ($expensesReport->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}