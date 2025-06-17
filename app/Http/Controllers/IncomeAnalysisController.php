<?php

namespace App\Http\Controllers;

use App\Http\Resources\IncomeAnalysisResource;
use App\Services\IncomeAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncomeAnalysisController extends Controller
{
    protected $incomeAnalysisService;

    public function __construct(IncomeAnalysisService $incomeAnalysisService)
    {
        $this->incomeAnalysisService = $incomeAnalysisService;
    }

    public function index(Request $request)
    {
        $analysis = $this->incomeAnalysisService->getOverview();
        $forecast = $this->incomeAnalysisService->generateIncomeForecast();
        $analysis = array_merge($analysis, $forecast);
        
        if ($request->wantsJson()) {
            return response()->json(new IncomeAnalysisResource($analysis));
        }
        
        return Inertia::render('IncomeAnalysis/Index', [
            'incomeAnalysis' => new IncomeAnalysisResource($analysis)
        ]);
    }

    public function getDiversityAnalysis(): JsonResponse
    {
        $diversity = $this->incomeAnalysisService->analyzeIncomeDiversity();
        return response()->json($diversity);
    }

    public function getStabilityAnalysis(): JsonResponse
    {
        $stability = $this->incomeAnalysisService->analyzeIncomeStability();
        return response()->json($stability);
    }

    public function getFrequencyAnalysis(): JsonResponse
    {
        $frequency = $this->incomeAnalysisService->analyzeIncomeFrequency();
        return response()->json($frequency);
    }

    public function getForecast(): JsonResponse
    {
        $forecast = $this->incomeAnalysisService->generateIncomeForecast();
        return response()->json($forecast);
    }
}