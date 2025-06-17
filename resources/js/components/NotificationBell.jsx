import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function NotificationBell() {
  return (
    <Link 
      href={route('notifications.index')}
      className="inline-flex items-center justify-center"
    >
      <Bell className="h-5 w-5" />
    </Link>
  );
}