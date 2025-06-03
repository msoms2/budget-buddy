<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncomeAnalysisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $incomeAnalysisService = app(\App\Services\IncomeAnalysisService::class);
        $forecast = $incomeAnalysisService->generateIncomeForecast();
        
        return [
            'diversityScore' => (float)($this['diversityScore'] ?? 0),
            'stabilityScore' => (float)($this['stabilityScore'] ?? 0),
            'recurringPercentage' => (float)($this['recurringPercentage'] ?? 0) / 100, // Convert to decimal for frontend
            'trend' => $this['trend'] ?? 'stable',
            'sources' => $this['sources'] ?? [],
            'monthlyData' => $this['monthlyData'] ?? [],
            'primarySource' => $this['primarySource'] ?? null,
            'secondarySource' => $this['secondarySource'] ?? null,
            'forecast' => $forecast['forecast'] ?? [],
            'totalForecast' => (float)($forecast['totalForecast'] ?? 0),
            'averageMonthly' => (float)($forecast['averageMonthly'] ?? 0),
            'forecastConfidence' => (float)($forecast['forecastConfidence'] ?? 0),
        ];
    }
}
