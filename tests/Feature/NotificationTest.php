<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\NotificationType;
use App\Models\Notification;
use App\Models\NotificationSetting;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Expense;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class NotificationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $notificationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->notificationService = app(NotificationService::class);
        
        // Create default notification types
        $this->createDefaultNotificationTypes();
    }

    protected function createDefaultNotificationTypes(): void
    {
        NotificationType::updateOrCreate(
            ['slug' => 'budget_limit_alert'],
            [
                'name' => 'Budget Limit Alert',
                'description' => 'Alert when budget limit is approached or exceeded',
                'is_active' => true
            ]
        );

        NotificationType::updateOrCreate(
            ['slug' => 'large_expense'],
            [
                'name' => 'Large Expense Alert',
                'description' => 'Alert when a large expense is recorded',
                'is_active' => true
            ]
        );

        NotificationType::updateOrCreate(
            ['slug' => 'goal_progress_update'],
            [
                'name' => 'Goal Progress Update',
                'description' => 'Update on financial goal progress',
                'is_active' => true
            ]
        );
    }

    public function test_notification_types_are_created_successfully()
    {
        $this->assertDatabaseHas('notification_types', [
            'slug' => 'budget_limit_alert'
        ]);

        $this->assertDatabaseHas('notification_types', [
            'slug' => 'large_expense'
        ]);

        $this->assertEquals(4, NotificationType::count());
    }

    public function test_user_can_view_notification_settings()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/notifications/settings');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'settings' => [
                         '*' => [
                             'id',
                             'user_id',
                             'notification_type_id',
                             'is_enabled',
                             'frequency',
                             'channels',
                             'notification_type'
                         ]
                     ],
                     'channels',
                     'frequencies'
                 ]);
    }

    public function test_user_can_update_notification_settings()
    {
        $this->actingAs($this->user);
        
        $notificationType = NotificationType::first();
        
        // Create initial setting
        $setting = NotificationSetting::create([
            'user_id' => $this->user->id,
            'notification_type_id' => $notificationType->id,
            'is_enabled' => true,
            'frequency' => 'immediate',
            'channels' => ['email', 'in_app']
        ]);

        $updateData = [
            'is_enabled' => false,
            'frequency' => 'daily',
            'channels' => ['email']
        ];

        $response = $this->putJson("/api/notifications/settings/{$notificationType->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Notification settings updated successfully'
                 ]);

        $this->assertDatabaseHas('notification_settings', [
            'user_id' => $this->user->id,
            'notification_type_id' => $notificationType->id,
            'is_enabled' => false,
            'frequency' => 'daily'
        ]);
    }

    public function test_notification_service_creates_notification()
    {
        $notificationType = NotificationType::where('slug', 'budget_limit_alert')->first();
        
        $data = [
            'budget_name' => 'Groceries',
            'current_amount' => 450,
            'limit_amount' => 500,
            'percentage' => 90
        ];

        $notification = $this->notificationService->create(
            $this->user->id,
            $notificationType->id,
            'Your Groceries budget is at 90% capacity',
            $data
        );

        $this->assertInstanceOf(Notification::class, $notification);
        $this->assertEquals($this->user->id, $notification->user_id);
        $this->assertEquals($notificationType->id, $notification->notification_type_id);
        $this->assertFalse($notification->is_read);
    }

    public function test_user_can_fetch_notifications()
    {
        $this->actingAs($this->user);
        
        // Create some test notifications
        $notificationType = NotificationType::first();
        Notification::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'notification_type_id' => $notificationType->id
        ]);

        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'title',
                             'message',
                             'is_read',
                             'created_at',
                             'notification_type'
                         ]
                     ],
                     'meta'
                 ]);
    }

    public function test_user_can_mark_notification_as_read()
    {
        $this->actingAs($this->user);
        
        $notification = Notification::factory()->create([
            'user_id' => $this->user->id,
            'is_read' => false
        ]);

        $response = $this->putJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Notification marked as read'
                 ]);

        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_user_can_mark_all_notifications_as_read()
    {
        $this->actingAs($this->user);
        
        // Create multiple unread notifications
        Notification::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'is_read' => false
        ]);

        $response = $this->putJson('/api/notifications/mark-all-read');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'All notifications marked as read'
                 ]);

        $this->assertEquals(0, $this->user->notifications()->where('is_read', false)->count());
    }

    public function test_user_can_delete_notification()
    {
        $this->actingAs($this->user);
        
        $notification = Notification::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Notification deleted successfully'
                 ]);

        $this->assertSoftDeleted($notification);
    }

    public function test_budget_limit_notification_is_triggered()
    {
        // Create a budget
        $category = Category::factory()->create(['user_id' => $this->user->id]);
        $budget = Budget::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $category->id,
            'amount' => 500,
            'period' => 'monthly'
        ]);

        // Create an expense that triggers 90% threshold
        Expense::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $category->id,
            'amount' => 450, // 90% of 500
            'date' => now()
        ]);

        // Check if notification was created
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'notification_type_id' => NotificationType::where('slug', 'budget_limit_alert')->first()->id
        ]);
    }

    public function test_large_expense_notification_is_triggered()
    {
        $category = Category::factory()->create(['user_id' => $this->user->id]);
        
        // Create a large expense (over $1000 threshold)
        $expense = Expense::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $category->id,
            'amount' => 1500,
            'date' => now()
        ]);

        // Check if notification was created
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->user->id,
            'notification_type_id' => NotificationType::where('slug', 'large_expense')->first()->id
        ]);
    }

    public function test_user_cannot_access_other_users_notifications()
    {
        $otherUser = User::factory()->create();
        $this->actingAs($this->user);
        
        $otherNotification = Notification::factory()->create([
            'user_id' => $otherUser->id
        ]);

        $response = $this->putJson("/api/notifications/{$otherNotification->id}/read");
        $response->assertStatus(404);

        $response = $this->deleteJson("/api/notifications/{$otherNotification->id}");
        $response->assertStatus(404);
    }

    public function test_notification_settings_are_respected()
    {
        $notificationType = NotificationType::where('slug', 'budget_limit_alert')->first();
        
        // Disable notifications for this type
        NotificationSetting::create([
            'user_id' => $this->user->id,
            'notification_type_id' => $notificationType->id,
            'is_enabled' => false,
            'frequency' => 'immediate',
            'channels' => ['email', 'in_app']
        ]);

        // Try to create a notification
        $notification = $this->notificationService->create(
            $this->user->id,
            $notificationType->id,
            'Test notification',
            []
        );

        // Should return null since notifications are disabled
        $this->assertNull($notification);
    }

    public function test_guest_cannot_access_notification_endpoints()
    {
        $response = $this->getJson('/api/notifications');
        $response->assertStatus(401);

        $response = $this->getJson('/api/notifications/settings');
        $response->assertStatus(401);

        $response = $this->putJson('/api/notifications/mark-all-read');
        $response->assertStatus(401);
    }

    public function test_notification_frequency_options_are_available()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/notifications/settings');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'frequencies' => [
                         'immediate' => 'Immediate',
                         'daily' => 'Daily Summary',
                         'weekly' => 'Weekly Summary',
                         'never' => 'Never'
                     ]
                 ]);
    }

    public function test_notification_channels_are_available()
    {
        $this->actingAs($this->user);

        $response = $this->getJson('/api/notifications/settings');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'channels' => [
                         'email' => 'Email',
                         'in_app' => 'In-App',
                         'sms' => 'SMS'
                     ]
                 ]);
    }
}