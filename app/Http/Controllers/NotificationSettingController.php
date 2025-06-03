<?php

namespace App\Http\Controllers;

use App\Models\NotificationType;
use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationSettingController extends Controller
{
    /**
     * Get notification settings for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Get all notification types
        $types = NotificationType::all();
        
        // Get the user's notification settings
        $settings = NotificationSetting::where('user_id', auth()->id())
            ->with('notificationType')
            ->get();
        
        // Create default settings for any notification types that don't have settings
        foreach ($types as $type) {
            if (!$settings->contains('notification_type_id', $type->id)) {
                $settings->push(
                    NotificationSetting::create([
                        'user_id' => auth()->id(),
                        'notification_type_id' => $type->id,
                        'is_enabled' => true,
                        'frequency' => 'immediate',
                        'channels' => ['email', 'in_app']
                    ])
                );
            }
        }
        
        // Define available notification channels
        $channels = [
            'email' => 'Email',
            'in_app' => 'In-App',
            'sms' => 'SMS'
        ];
        
        // Define available notification frequencies
        $frequencies = [
            'immediate' => 'Immediate',
            'daily' => 'Daily Summary',
            'weekly' => 'Weekly Summary',
            'never' => 'Never'
        ];
        
        return response()->json([
            'settings' => $settings,
            'channels' => $channels,
            'frequencies' => $frequencies
        ]);
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
        $validator = Validator::make($request->all(), [
            'is_enabled' => 'required|boolean',
            'frequency' => 'required|string|in:immediate,daily,weekly,never',
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
            'setting' => $setting
        ]);
    }
}