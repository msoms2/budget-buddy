<?php

namespace Tests\Feature;

use App\Models\Currency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DefaultCurrencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test currencies
        Currency::create([
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'exchange_rate' => 1.0000,
            'format' => '$#,##0.00',
            'decimal_places' => 2,
            'is_default' => true
        ]);
        
        Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.8500,
            'format' => '€#,##0.00',
            'decimal_places' => 2,
            'is_default' => false
        ]);
        
        Currency::create([
            'code' => 'GBP',
            'name' => 'British Pound',
            'symbol' => '£',
            'exchange_rate' => 0.7500,
            'format' => '£#,##0.00',
            'decimal_places' => 2,
            'is_default' => false
        ]);
    }

    public function test_user_can_set_default_currency_from_displayed_currencies()
    {
        $user = User::factory()->create([
            'displayed_currencies' => ['USD', 'EUR']
        ]);
        
        $eurCurrency = Currency::where('code', 'EUR')->first();
        
        $response = $this->actingAs($user)
            ->withoutMiddleware()
            ->postJson('/api/currencies/set-default', [
                'currency_id' => $eurCurrency->id
            ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Default currency updated successfully'
            ]);
        
        $this->assertEquals($eurCurrency->id, $user->fresh()->currency_id);
    }

    public function test_user_cannot_set_default_currency_not_in_displayed_currencies()
    {
        $user = User::factory()->create([
            'displayed_currencies' => ['USD']  // Only USD is displayed
        ]);
        
        $initialCurrencyId = $user->currency_id;
        $eurCurrency = Currency::where('code', 'EUR')->first();
        
        $response = $this->actingAs($user)
            ->withoutMiddleware()
            ->postJson('/api/currencies/set-default', [
                'currency_id' => $eurCurrency->id
            ]);
        
        $response->assertStatus(400)
            ->assertJson([
                'error' => 'Selected currency must be in your displayed currencies list'
            ]);
        
        // Currency should remain unchanged
        $this->assertEquals($initialCurrencyId, $user->fresh()->currency_id);
    }

    public function test_validation_fails_for_invalid_currency_id()
    {
        $user = User::factory()->create([
            'displayed_currencies' => ['USD', 'EUR']
        ]);
        
        $response = $this->actingAs($user)
            ->withoutMiddleware()
            ->postJson('/api/currencies/set-default', [
                'currency_id' => 999  // Non-existent currency
            ]);
        
        $response->assertStatus(422);
    }

    public function test_validation_fails_for_missing_currency_id()
    {
        $user = User::factory()->create([
            'displayed_currencies' => ['USD', 'EUR']
        ]);
        
        $response = $this->actingAs($user)
            ->withoutMiddleware()
            ->postJson('/api/currencies/set-default', []);
        
        $response->assertStatus(422);
    }
}