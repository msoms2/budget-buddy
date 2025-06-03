# Integration Testing Guidelines

## Overview

Integration testing verifies that different parts of the application work together correctly. This document outlines the approach for testing interactions between components, services, and external dependencies.

## Key Integration Test Areas

### 1. Database Integration
- Test complete database operations
- Verify data persistence across operations
- Test database transactions and rollbacks
- Validate model relationships

```php
public function test_expense_category_relationship(): void
{
    $category = ExpenseCategory::factory()
        ->has(Expense::factory()->count(3))
        ->create();

    $this->assertCount(3, $category->expenses);
    $this->assertDatabaseHas('expenses', [
        'category_id' => $category->id
    ]);
}
```

### 2. API Integration
- Test complete API endpoints
- Validate request/response cycles
- Test middleware chains
- Verify API authentication

```php
public function test_api_authentication_flow(): void
{
    $response = $this->postJson('/api/login', [
        'email' => 'user@example.com',
        'password' => 'password'
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['token']);
}
```

### 3. Service Integration
- Test service layer interactions
- Verify dependency injection
- Test service-to-service communication

### 4. Frontend Integration
- Test React component interactions
- Verify state management
- Test API client integration
- Validate form submissions

## Testing Patterns

### 1. Repository Pattern Testing
```php
public function test_repository_operations(): void
{
    $repository = app(TransactionRepository::class);
    
    $transaction = $repository->create([
        'amount' => 100,
        'type' => 'expense'
    ]);
    
    $this->assertDatabaseHas('transactions', [
        'id' => $transaction->id
    ]);
}
```

### 2. Service Layer Testing
```php
public function test_budget_calculation_service(): void
{
    $service = app(BudgetCalculationService::class);
    
    $result = $service->calculateMonthlySpending(
        $this->user,
        Carbon::now()
    );
    
    $this->assertIsArray($result);
    $this->assertArrayHasKey('total', $result);
}
```

### 3. Event Testing
```php
public function test_transaction_events(): void
{
    Event::fake();
    
    // Perform transaction
    $transaction = Transaction::factory()->create();
    
    Event::assertDispatched(TransactionCreated::class);
}
```

## Best Practices

### 1. Test Data Setup
- Use database factories
- Create realistic test scenarios
- Clean up test data after tests
- Use database transactions

### 2. Mocking External Services
```php
public function test_external_api_integration(): void
{
    Http::fake([
        'api.external.com/*' => Http::response(['data' => 'response'], 200)
    ]);
    
    // Test external service integration
}
```

### 3. Authentication & Authorization
- Test different user roles
- Verify permission checks
- Test authentication flows

### 4. Error Handling
- Test error responses
- Verify exception handling
- Test validation failures

## Test Environment Setup

1. **Database Configuration**
```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class IntegrationTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        // Additional setup
    }
}
```

2. **Service Configuration**
- Use test service providers
- Configure test environment
- Set up test credentials

## Common Integration Scenarios

### 1. User Registration Flow
```php
public function test_complete_registration_flow(): void
{
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password'
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticated();
}
```

### 2. Transaction Processing
```php
public function test_transaction_processing_flow(): void
{
    $user = User::factory()->create();
    $category = ExpenseCategory::factory()->create();
    
    $response = $this->actingAs($user)->post('/transactions', [
        'amount' => 100,
        'category_id' => $category->id,
        'description' => 'Test transaction'
    ]);
    
    $response->assertStatus(201);
    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'amount' => 100
    ]);
}
```

## Continuous Integration

- Run integration tests in CI pipeline
- Maintain test database
- Monitor test performance
- Track test coverage

## Troubleshooting

1. Common Issues
   - Database connection errors
   - Authentication failures
   - Timing issues
   - Race conditions

2. Resolution Steps
   - Check database configuration
   - Verify test environment
   - Review test isolation
   - Check for side effects