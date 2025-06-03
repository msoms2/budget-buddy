<?php

namespace App\Http\Controllers;

use App\Models\Earning;
use App\Models\EarningReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EarningReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reports = EarningReport::where('user_id', Auth::id())->get();
        return view('earning-reports.index', compact('reports'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('earning-reports.create');
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

        // Calculate the sum of earnings within the date range
        $total = Earning::where('user_id', Auth::id())
            ->whereBetween('date', [$validated['from_date'], $validated['to_date']])
            ->sum('amount');

        $validated['user_id'] = Auth::id();
        $validated['amount'] = $total;

        $report = EarningReport::create($validated);

        return redirect()->route('earning-reports.show', $report)->with('success', 'Earning report created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(EarningReport $earningReport)
    {
        $this->authorizeUser($earningReport);
        
        // Get the earnings within the date range for the report
        $earnings = Earning::where('user_id', Auth::id())
            ->whereBetween('date', [$earningReport->from_date, $earningReport->to_date])
            ->with('category')
            ->get();
            
        // Group earnings by category
        $earningsByCategory = $earnings->groupBy('category_id')
            ->map(function ($group) {
                return [
                    'category' => $group->first()->category,
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                    'earnings' => $group
                ];
            });
            
        return view('earning-reports.show', compact('earningReport', 'earnings', 'earningsByCategory'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EarningReport $earningReport)
    {
        $this->authorizeUser($earningReport);
        
        $earningReport->delete();

        return redirect()->route('earning-reports.index')->with('success', 'Earning report deleted successfully!');
    }

    /**
     * Authorize that the current user owns the report.
     */
    private function authorizeUser(EarningReport $earningReport)
    {
        if ($earningReport->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}