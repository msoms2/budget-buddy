<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Currency;
use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Http;

class CurrencyManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create();
        
        // Create default currency
        Currency::create([
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'exchange_rate' => 1.0000,
            'format' => '{symbol}{amount}',
            'decimal_places' => 2,
            'is_default' => true,
        ]);
    }

    public function test_can_view_currencies_list()
    {
        $response = $this->actingAs($this->user)
                        ->getJson('/api/currencies');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'currencies',
                    'default_currency',
                    'user_currency',
                    'displayed_currencies'
                ]);
    }

    public function test_can_create_new_currency()
    {
        $currencyData = [
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false
        ];

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies', $currencyData);

        $response->assertStatus(201)
                ->assertJson([
                    'message' => 'Currency created successfully',
                    'currency' => [
                        'code' => 'EUR',
                        'name' => 'Euro',
                        'symbol' => '€'
                    ]
                ]);

        $this->assertDatabaseHas('currencies', [
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€'
        ]);
    }

    public function test_cannot_create_duplicate_currency()
    {
        Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        $currencyData = [
            'code' => 'EUR',
            'name' => 'Euro Duplicate',
            'symbol' => '€€',
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false
        ];

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies', $currencyData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['code']);
    }

    public function test_can_set_default_currency()
    {
        $euroCurrency = Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/set-default', [
                            'currency_id' => $euroCurrency->id
                        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Default currency updated successfully'
                ]);

        $this->assertDatabaseHas('currencies', [
            'id' => $euroCurrency->id,
            'is_default' => true
        ]);

        // Check that USD is no longer default
        $this->assertDatabaseHas('currencies', [
            'code' => 'USD',
            'is_default' => false
        ]);
    }

    public function test_can_set_user_base_currency()
    {
        $euroCurrency = Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/set-base', [
                            'currency_id' => $euroCurrency->id
                        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'User base currency updated successfully'
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'currency_id' => $euroCurrency->id
        ]);
    }

    public function test_can_update_displayed_currencies()
    {
        $euroCurrency = Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        $gbpCurrency = Currency::create([
            'code' => 'GBP',
            'name' => 'British Pound',
            'symbol' => '£',
            'exchange_rate' => 0.79,
            'format' => '{symbol}{amount}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        $displayedCurrencies = [$euroCurrency->id, $gbpCurrency->id];

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/display-settings', [
                            'displayed_currencies' => $displayedCurrencies
                        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Currency display settings updated successfully'
                ]);

        $this->user->refresh();
        $this->assertEquals($displayedCurrencies, $this->user->displayed_currencies);
    }

    public function test_cannot_delete_default_currency()
    {
        $defaultCurrency = Currency::where('is_default', true)->first();

        $response = $this->actingAs($this->user)
                        ->deleteJson("/api/currencies/{$defaultCurrency->id}");

        $response->assertStatus(422)
                ->assertJson([
                    'message' => 'Cannot delete the default currency'
                ]);
    }

    public function test_can_delete_non_default_currency()
    {
        $euroCurrency = Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        $response = $this->actingAs($this->user)
                        ->deleteJson("/api/currencies/{$euroCurrency->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Currency deleted successfully'
                ]);

        $this->assertDatabaseMissing('currencies', [
            'id' => $euroCurrency->id
        ]);
    }

    public function test_can_convert_currency()
    {
        Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        // Mock the external API response
        Http::fake([
            '*/currencies/usd.json' => Http::response([
                'usd' => [
                    'eur' => 0.92
                ]
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/convert', [
                            'amount' => 100,
                            'from' => 'USD',
                            'to' => 'EUR'
                        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'original_amount',
                    'from_currency',
                    'to_currency',
                    'converted_amount',
                    'timestamp'
                ]);
    }

    public function test_can_get_available_currencies()
    {
        // Mock the external API response
        Http::fake([
            '*/currencies.json' => Http::response([
                'eur' => 'Euro',
                'gbp' => 'British Pound Sterling',
                'jpy' => 'Japanese Yen'
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
                        ->getJson('/api/currencies/available');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'all_currencies',
                    'available_for_add',
                    'existing_currencies'
                ]);
    }

    public function test_can_update_exchange_rates()
    {
        Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.92,
            'format' => '{amount} {symbol}',
            'decimal_places' => 2,
            'is_default' => false,
        ]);

        // Mock the external API response
        Http::fake([
            '*/currencies/usd.json' => Http::response([
                'usd' => [
                    'eur' => 0.95
                ]
            ], 200)
        ]);

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/update-rates');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'result' => [
                        'updated',
                        'failed',
                        'timestamp'
                    ]
                ]);
    }

    public function test_currency_validation_rules()
    {
        // Test invalid currency code
        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies', [
                            'code' => 'INVALID',
                            'name' => 'Invalid Currency',
                            'symbol' => '?'
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['code']);

        // Test missing required fields
        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['code', 'name', 'symbol']);
    }

    public function test_currency_format_validation()
    {
        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/convert', [
                            'amount' => 'invalid',
                            'from' => 'USD',
                            'to' => 'EUR'
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['amount']);

        $response = $this->actingAs($this->user)
                        ->postJson('/api/currencies/convert', [
                            'amount' => 100,
                            'from' => 'US',
                            'to' => 'EUR'
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['from']);
    }
}