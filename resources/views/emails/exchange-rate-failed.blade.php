<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Exchange Rate Update Failed</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 15px; margin-bottom: 20px; }
        .error-box { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .info-box { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Exchange Rate Update Failed</h1>
        </div>
        
        <p>Hello Administrator,</p>
        
        <p>The automatic exchange rate update for Budget Buddy has failed. Please review the details below:</p>
        
        <div class="error-box">
            <strong>Error Message:</strong><br>
            {{ $errorMessage }}
        </div>
        
        <div class="info-box">
            <strong>Attempt Count:</strong> {{ $attemptCount }}<br>
            @if($lastSuccessfulUpdate)
                <strong>Last Successful Update:</strong> {{ $lastSuccessfulUpdate->format('Y-m-d H:i:s T') }}<br>
            @else
                <strong>Last Successful Update:</strong> Never<br>
            @endif
            <strong>Failed At:</strong> {{ now()->format('Y-m-d H:i:s T') }}
        </div>
        
        <h3>Recommended Actions:</h3>
        <ul>
            <li>Check the fawazahmed0/exchange-api status at: <a href="https://github.com/fawazahmed0/exchange-api">https://github.com/fawazahmed0/exchange-api</a></li>
            <li>Verify internet connectivity on the server</li>
            <li>Run manual update: <code>php artisan exchange-rates:update --force</code></li>
            <li>Check system health: <code>php artisan exchange-rates:monitor --health</code></li>
        </ul>
        
        <p>If the issue persists, please check the application logs for more detailed error information.</p>
        
        <div class="footer">
            <p>This is an automated notification from Budget Buddy Exchange Rate System.<br>
            Server: {{ config('app.name') }} ({{ config('app.env') }})</p>
        </div>
    </div>
</body>
</html>
