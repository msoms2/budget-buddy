# End-to-End Testing Procedures

## Overview

End-to-end (E2E) testing verifies the application works correctly from a user's perspective by testing complete user journeys and workflows. These tests simulate real user interactions with the application.

## Test Environment Setup

### 1. Prerequisites
- Laravel Dusk installed
- Chrome/Firefox WebDriver configured
- Test database configured
- Test mail server setup

### 2. Environment Configuration
```php
// .env.dusk
APP_ENV=testing
DB_CONNECTION=mysql
DB_DATABASE=budget_buddy_testing
MAIL_MAILER=log
```

## Core User Journeys

### 1. User Registration & Onboarding
```php
public function test_complete_user_onboarding(): void
{
    $browser->visit('/register')
        ->type('name', 'Test User')
        ->type('email', 'test@example.com')
        ->type('password', 'password')
        ->type('password_confirmation', 'password')
        ->press('Register')
        ->waitForLocation('/dashboard')
        ->assertPathIs('/dashboard');
}
```

### 2. Budget Management Flow
```php
public function test_budget_creation_and_tracking(): void
{
    $browser->loginAs($user)
        ->visit('/budgets/create')
        ->type('name', 'Monthly Budget')
        ->type('amount', '1000')
        ->select('category', 'Groceries')
        ->press('Create Budget')
        ->waitForText('Budget created successfully')
        ->assertSee('Monthly Budget');
}
```

### 3. Transaction Recording
```php
public function test_expense_recording_flow(): void
{
    $browser->loginAs($user)
        ->visit('/dashboard')
        ->click('@add-expense-button')
        ->waitFor('#expense-modal')
        ->type('amount', '50.00')
        ->select('category', 'Groceries')
        ->type('description', 'Weekly groceries')
        ->press('Save')
        ->waitForText('Expense recorded successfully');
}
```

## Test Scenarios

### 1. Authentication Flows
- User registration
- Login/logout
- Password reset
- Email verification
- Remember me functionality

### 2. Financial Management
- Budget creation and editing
- Expense tracking
- Income recording
- Financial report generation
- Category management

### 3. Data Visualization
- Dashboard loading
- Chart interactions
- Report filtering
- Data export

## Browser Testing Setup

### 1. Laravel Dusk Configuration
```php
// DuskTestCase.php
protected function driver()
{
    $options = (new ChromeOptions())->addArguments([
        '--disable-gpu',
        '--headless',
        '--window-size=1920,1080',
    ]);

    return RemoteWebDriver::create(
        'http://localhost:9515',
        DesiredCapabilities::chrome()->setCapability(
            ChromeOptions::CAPABILITY,
            $options
        )
    );
}
```

### 2. Custom Test Helpers
```php
// Browser.php
public function createBudget($amount, $category)
{
    return $this->type('amount', $amount)
        ->select('category', $category)
        ->press('Create')
        ->waitForText('Success');
}
```

## Test Data Management

### 1. Factories and Seeders
```php
// Database seeding for E2E tests
protected function setUp(): void
{
    parent::setUp();
    
    $this->seed([
        UserSeeder::class,
        CategorySeeder::class,
        CurrencySeeder::class
    ]);
}
```

### 2. Test Data Cleanup
```php
protected function tearDown(): void
{
    $this->artisan('migrate:fresh');
    parent::tearDown();
}
```

## Common Test Scenarios

### 1. Data Entry Validation
```php
public function test_expense_validation(): void
{
    $browser->loginAs($user)
        ->visit('/expenses/create')
        ->press('Save')
        ->waitForText('The amount field is required')
        ->assertSee('The category field is required');
}
```

### 2. Navigation Testing
```php
public function test_navigation_flow(): void
{
    $browser->loginAs($user)
        ->visit('/dashboard')
        ->clickLink('Reports')
        ->waitForLocation('/reports')
        ->clickLink('Monthly Report')
        ->waitForLocation('/reports/monthly');
}
```

## Best Practices

### 1. Test Organization
- Group related test cases
- Use descriptive test names
- Keep tests focused and atomic
- Handle async operations properly

### 2. Reliability
- Add appropriate waits
- Handle loading states
- Check for element visibility
- Use reliable selectors

### 3. Performance
- Minimize browser starts
- Reuse authentication state
- Clean up test data efficiently

## Test Maintenance

### 1. Selector Strategy
```php
// Use data-testid attributes
<button data-testid="submit-expense">
    Save Expense
</button>

// In tests
$browser->click('@submit-expense')
```

### 2. Page Objects
```php
class DashboardPage extends Page
{
    public function addExpense($amount, $category)
    {
        return $this->click('@add-expense')
            ->type('@amount', $amount)
            ->select('@category', $category)
            ->press('Save');
    }
}
```

## Continuous Integration

### 1. CI Pipeline Setup
```yaml
e2e-tests:
  stage: test
  script:
    - php artisan dusk:chrome-driver
    - php artisan serve --env=dusk.local &
    - php artisan dusk
```

### 2. Artifacts
- Screenshot capture
- Console log collection
- Video recording
- Test reports

## Troubleshooting

### 1. Common Issues
- Element not found
- Timing issues
- Database state
- Browser configuration

### 2. Debug Techniques
- Screenshot capture
- Console log review
- State inspection
- Database validation