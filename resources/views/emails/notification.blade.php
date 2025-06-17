<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $notification->title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .notification-type {
            display: inline-block;
            background-color: #f0f9ff;
            color: #1e40af;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .title {
            color: #1f2937;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .content {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        .data-section {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .data-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .data-item:last-child {
            border-bottom: none;
        }
        .data-label {
            font-weight: bold;
            color: #374151;
        }
        .data-value {
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">💰 Budget Buddy</div>
            <div class="notification-type">{{ $notificationType->name ?? 'Notification' }}</div>
        </div>
        
        <div class="title">{{ $notification->title }}</div>
        
        <div class="content">
            {{ $notification->content }}
        </div>
        
        @if (isset($notification->data['budget_name']))
        @component('mail::panel')
        **Budget:** {{ $notification->data['budget_name'] }}  
        **Current amount:** ${{ number_format($notification->data['current_amount'] ?? 0, 2) }}  
        **Limit:** ${{ number_format($notification->data['limit_amount'] ?? 0, 2) }}  
        **Usage:** {{ number_format($notification->data['percentage'] ?? 0) }}%
        @endcomponent
        @elseif (isset($notification->data['amount']))
        @component('mail::panel')
        **Amount:** ${{ number_format($notification->data['amount'] ?? 0, 2) }}  
        **Category:** {{ $notification->data['category'] ?? 'Unknown' }}  
        **Description:** {{ $notification->data['description'] ?? 'No description provided' }}
        @endcomponent
        @elseif (isset($notification->data['goal_name']))
        @component('mail::panel')
        **Goal:** {{ $notification->data['goal_name'] }}  
        **Current amount:** ${{ number_format($notification->data['current_amount'] ?? 0, 2) }}  
        **Target amount:** ${{ number_format($notification->data['target_amount'] ?? 0, 2) }}  
        **Progress:** {{ number_format($notification->data['percentage'] ?? 0) }}%
        @endcomponent
        @endif

        @component('mail::button', ['url' => url('/dashboard')])
        View in Budget Buddy
        @endcomponent

        Thanks,<br>
        {{ config('app.name') }}

        @component('mail::subcopy')
        If you no longer wish to receive these notifications, you can update your settings in the Notifications section of your account settings.
        @endcomponent
    </div>
</body>
</html>