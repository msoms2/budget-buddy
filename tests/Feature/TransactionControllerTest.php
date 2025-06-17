<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_create_an_expense_transaction()
    {
        $category = ExpenseCategory::factory()->create(['user_id' => $this->user->id]);

        $response = $this->post(route('expenses.store'), [
            'name' => 'Test Expense',
            'amount' => 100.50,
            'date' => now()->format('Y-m-d'),
            'category_id' => $category->id,
            'currency_id' => $this->user->currency_id,
            'description' => 'Test description',
            'is_recurring' => false,
        ]);

        $response->assertRedirect(route('expense-category.show', $category->id));
        $this->assertDatabaseHas('expenses', [
            'name' => 'Test Expense',
            'amount' => 100.50,
            'user_id' => $this->user->id,
            'category_id' => $category->id,
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_create_an_income_transaction()
    {
        $category = EarningCategory::factory()->create(['user_id' => $this->user->id]);

        $response = $this->post(route('earnings.store'), [
            'name' => 'Test Income',
            'amount' => 200.75,
            'date' => now()->format('Y-m-d'),
            'category_id' => $category->id,
            'currency_id' => $this->user->currency_id,
            'description' => 'Test description',
            'is_recurring' => false,
        ]);

        $response->assertRedirect(route('income-category.show', $category->id));
        $this->assertDatabaseHas('earnings', [
            'name' => 'Test Income',
            'amount' => 200.75,
            'user_id' => $this->user->id,
            'category_id' => $category->id,
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_validates_required_fields_for_expense()
    {
        $response = $this->post(route('expenses.store'), []);

        $response->assertSessionHasErrors(['name', 'amount', 'category_id', 'currency_id']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_validates_required_fields_for_income()
    {
        $response = $this->post(route('earnings.store'), []);

        $response->assertSessionHasErrors(['name', 'amount', 'category_id', 'currency_id']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_validates_amount_is_numeric()
    {
        $category = ExpenseCategory::factory()->create(['user_id' => $this->user->id]);

        $response = $this->post(route('expenses.store'), [
            'name' => 'Test Expense',
            'amount' => 'not-a-number',
            'date' => now()->format('Y-m-d'),
            'category_id' => $category->id,
            'currency_id' => $this->user->currency_id,
        ]);

        $response->assertSessionHasErrors('amount');
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_validates_amount_is_positive()
    {
        $category = ExpenseCategory::factory()->create(['user_id' => $this->user->id]);

        $response = $this->post(route('expenses.store'), [
            'name' => 'Test Expense',
            'amount' => -100,
            'date' => now()->format('Y-m-d'),
            'category_id' => $category->id,
            'currency_id' => $this->user->currency_id,
        ]);

        $response->assertSessionHasErrors('amount');
    }
} 