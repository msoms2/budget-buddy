<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && $this->isAdmin($request->user())) {
            return $next($request);
        }

        // Redirect to dashboard if not an admin
        return redirect()->route('dashboard')->with('error', 'You do not have admin access.');
    }

    /**
     * Determine if the user is an admin.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    protected function isAdmin($user)
    {
        // Check both the role column and roles relation
        return $user->role === 'admin' || $user->roles()->where('name', 'admin')->exists();
    }
}