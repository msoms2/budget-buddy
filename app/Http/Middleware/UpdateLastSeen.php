<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Update last_seen for authenticated users
        if (auth()->check()) {
            $user = auth()->user();
            
            // Only update if last_seen is older than 1 minute to avoid too many DB writes
            if (!$user->last_seen || $user->last_seen->lt(now()->subMinute())) {
                $user->updateLastSeen();
            }
        }
        
        return $response;
    }
}
