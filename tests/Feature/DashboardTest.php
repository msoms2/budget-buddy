<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_renders_expense_pie_chart_by_default(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertStatus(200)
            ->assertInertia(function ($page) {
                return $page->has('expenseCategoryBreakdown');
            });
    }

    public function test_dashboard_renders_income_pie_chart_when_category_type_is_income(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard?categoryType=income')
            ->assertStatus(200)
            ->assertInertia(function ($page) {
                return $page->has('incomeCategoryBreakdown');
            });
    }

    public function test_dashboard_persists_category_type_across_sessions(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard?categoryType=income')
            ->assertStatus(200);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertStatus(200)
            ->assertInertia(function ($page) {
                return $page->has('categoryBreakdown');
            });
    }
}