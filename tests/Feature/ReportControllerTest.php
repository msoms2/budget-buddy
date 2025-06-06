<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Expense;
use App\Models\Earning;
use App\Models\Budget;
use App\Models\ExpenseCategory;
use App\Models\Tag;
use App\Models\PaymentMethod;
use Carbon\Carbon;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function dashboard_displays_correct_monthly_data()
    {
        // Create test data
        $this->actingAs($this->user);
        
        $currentMonth = Carbon::now()->startOfMonth();
        $expense = Expense::factory()->create([
            'user_id' => $this->user->id,
            'amount' => 100,
            'date' => $currentMonth
        ]);
        
        $earning = Earning::factory()->create([
            'user_id' => $this->user->id,
            'amount' => 500,
            'date' => $currentMonth
        ]);

        // Test dashboard endpoint
        $response = $this->get(route('reports.dashboard'));
        
        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Reports/Dashboard')
                ->where('monthlyIncome', 500)
                ->where('monthlyExpenses', 100)
                ->where('monthlySavings', 400)
                ->where('savingsRate', 80)
            );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function comparison_report_returns_correct_data()
    {
        $this->actingAs($this->user);
        
        $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');

        // Create test data spanning the date range
        Expense::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'date' => $startDate
        ]);

        // Test comparison endpoint with date range
        $response = $this->get(route('reports.comparison', [
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate
            ]
        ]));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Reports/ComparisonReport')
                ->has('dateRange')
                ->has('expenseData')
                ->has('incomeData')
                ->has('categoryBreakdown')
            );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function forecast_returns_correct_projection_data()
    {
        $this->actingAs($this->user);

        // Create historical data for projections
        Expense::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'date' => Carbon::now()->subMonth()
        ]);

        Earning::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'date' => Carbon::now()->subMonth()
        ]);

        // Test forecast endpoint
        $response = $this->get(route('reports.forecast', ['months' => 6]));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Reports/ForecastReport')
                ->has('projections')
                ->has('historicalTrends')
                ->has('savingsPredictions')
            );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function unauthorized_users_cannot_access_reports()
    {
        $response = $this->get(route('reports.dashboard'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('reports.comparison'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('reports.forecast'));
        $response->assertRedirect(route('login'));
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function dashboard_shows_correct_budget_progress()
    {
        $this->actingAs($this->user);

        // Create an active budget
        $budget = Budget::factory()->create([
            'user_id' => $this->user->id,
            'amount' => 1000,
            'start_date' => Carbon::now()->subMonth(),
            'end_date' => Carbon::now()->addMonth()
        ]);

        // Create some expenses for this budget
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'amount' => 250,
            'category_id' => $budget->category_id,
            'date' => Carbon::now()
        ]);

        $response = $this->get(route('reports.dashboard'));

        $response->assertStatus(200)
            ->assertInertia(fn ($assert) => $assert
                ->component('Reports/Dashboard')
                ->has('budgets', 1)
                ->where('budgets.0.percent_used', 25)
            );
    }
}