<?php

namespace App\Http\Controllers;

use App\Models\NotificationType;
use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class NotificationSettingController extends Controller
{
    /**
     * Get notification settings for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            Log::info('NotificationSettings: Starting index method');
            
            // Check if user is authenticated
            if (!auth()->check()) {
                Log::warning('NotificationSettings: User not authenticated');
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            $userId = auth()->id();
            Log::info('NotificationSettings: Authenticated user ID', ['user_id' => $userId]);
            
            // Check if notification_types table exists and has data
            try {
                $typesCount = NotificationType::count();
                Log::info('NotificationSettings: Notification types count', ['count' => $typesCount]);
                
                if ($typesCount === 0) {
                    Log::error('NotificationSettings: No notification types found in database');
                    return response()->json([
                        'message' => 'No notification types configured in the system. Please run the notification type seeder.',
                        'debug_info' => [
                            'types_count' => $typesCount,
                            'table_exists' => true
                        ]
                    ], 500);
                }
            } catch (\Exception $e) {
                Log::error('NotificationSettings: Error checking notification types table', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Database error: notification_types table may not exist',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            // Get all notification types
            $types = NotificationType::all();
            Log::info('NotificationSettings: Retrieved notification types', [
                'count' => $types->count(),
                'types' => $types->pluck('name', 'id')->toArray()
            ]);
            
            // Check if notification_settings table exists
            try {
                $settingsCount = NotificationSetting::where('user_id', $userId)->count();
                Log::info('NotificationSettings: Existing user settings count', ['count' => $settingsCount]);
            } catch (\Exception $e) {
                Log::error('NotificationSettings: Error checking notification settings table', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Database error: notification_settings table may not exist',
                    'error' => $e->getMessage()
                ], 500);
            }
            
            // Get the user's notification settings
            $settings = NotificationSetting::where('user_id', $userId)
                ->with('notificationType')
                ->get();
                
            Log::info('NotificationSettings: Retrieved user settings', [
                'count' => $settings->count(),
                'settings_ids' => $settings->pluck('id')->toArray()
            ]);
            
            // Create default settings for any notification types that don't have settings
            foreach ($types as $type) {
                if (!$settings->contains('notification_type_id', $type->id)) {
                    Log::info('NotificationSettings: Creating default setting for type', [
                        'type_id' => $type->id,
                        'type_name' => $type->name
                    ]);
                    
                    try {
                        $newSetting = NotificationSetting::create([
                            'user_id' => $userId,
                            'notification_type_id' => $type->id,
                            'is_enabled' => true,
                            'frequency' => 'immediate',
                            'channels' => ['email', 'in_app'] // Fixed channel name
                        ]);
                        
                        if ($newSetting) {
                            $newSetting->load('notificationType');
                            $settings->push($newSetting);
                            Log::info('NotificationSettings: Created default setting', [
                                'setting_id' => $newSetting->id,
                                'type_id' => $type->id
                            ]);
                        }
                    } catch (\Exception $e) {
                        Log::error('NotificationSettings: Failed to create default setting', [
                            'type_id' => $type->id,
                            'user_id' => $userId,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        // Continue with the loop even if one setting fails
                        continue;
                    }
                }
            }
            
            Log::info('NotificationSettings: Returning settings', [
                'final_count' => $settings->count()
            ]);
            
            return response()->json($settings);
            
        } catch (\Exception $e) {
            Log::error('NotificationSettings: Unexpected error in index method', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'message' => 'Failed to fetch notification settings',
                'error' => $e->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }
    
    /**
     * Update notification settings for a specific notification type.
     *
     * @param Request $request
     * @param NotificationType $notificationType
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, NotificationType $notificationType)
    {
        try {
            // Check if user is authenticated
            if (!auth()->check()) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'is_enabled' => 'required|boolean',
                'frequency' => 'required|string|in:immediate,daily,weekly',
                'channels' => 'required|array',
                'channels.*' => 'in:email,in_app,sms'
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            // Find or create notification setting
            $setting = NotificationSetting::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'notification_type_id' => $notificationType->id
                ],
                [
                    'is_enabled' => $request->is_enabled,
                    'frequency' => $request->frequency,
                    'channels' => $request->channels
                ]
            );
            
            return response()->json([
                'message' => 'Notification settings updated successfully',
                'setting' => $setting->load('notificationType')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update notification settings: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'notification_type_id' => $notificationType->id
            ]);
            
            return response()->json([
                'message' => 'Failed to update notification settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}