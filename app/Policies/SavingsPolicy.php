<?php

namespace App\Policies;

use App\Models\Savings;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SavingsPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Savings $savings)
    {
        return $user->id === $savings->user_id;
    }

    public function update(User $user, Savings $savings)
    {
        return $user->id === $savings->user_id;
    }

    public function delete(User $user, Savings $savings)
    {
        return $user->id === $savings->user_id;
    }
}