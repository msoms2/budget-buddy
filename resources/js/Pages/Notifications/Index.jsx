import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import axios from 'axios';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

export default function Index({ notifications, unreadCount }) {
  const [notificationsList, setNotificationsList] = useState(notifications.data);
  const [totalUnread, setTotalUnread] = useState(unreadCount);
  const { toast } = useToast();

  const getNotificationIcon = (type) => {
    if (!type || !type.slug) return <Bell className="h-5 w-5" />;
    
    switch (type.slug) {
      case 'budget_limit_alert':
        return <span className="text-red-500 text-xl">💰</span>;
      case 'large_expense':
        return <span className="text-orange-500 text-xl">💸</span>;
      case 'goal_progress_update':
        return <span className="text-green-500 text-xl">🎯</span>;
      case 'bill_payment_reminder':
        return <span className="text-blue-500 text-xl">📅</span>;
      case 'investment_update':
        return <span className="text-purple-500 text-xl">📈</span>;
      case 'account_activity':
        return <span className="text-gray-500 text-xl">🔄</span>;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      
      // Update the local state
      setNotificationsList(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Decrement the unread count
      setTotalUnread(prev => Math.max(0, prev - 1));
      
      toast({
        title: "Notification marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Could not mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      
      // Update all notifications to be read
      setNotificationsList(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Reset unread count
      setTotalUnread(0);
      
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Could not mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      
      // Filter out the deleted notification
      const deletedNotification = notificationsList.find(n => n.id === id);
      setNotificationsList(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      
      // Update unread count if needed
      if (deletedNotification && !deletedNotification.is_read) {
        setTotalUnread(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: "Notification deleted",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Could not delete notification",
        variant: "destructive",
      });
    }
  };

  const renderNotificationContent = (notification) => {
    return (
      <div>
        <h4 className="font-semibold">{notification.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
        
        {notification.data && (
          <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
            {notification.notification_type?.slug === 'budget_limit_alert' && (
              <>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium">{notification.data.budget_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="font-medium">${notification.data.current_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Limit:</span>
                  <span className="font-medium">${notification.data.limit_amount}</span>
                </div>
              </>
            )}
            
            {notification.notification_type?.slug === 'large_expense' && (
              <>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">${notification.data.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{notification.data.category}</span>
                </div>
              </>
            )}
            
            {notification.notification_type?.slug === 'goal_progress_update' && (
              <>
                <div className="flex justify-between">
                  <span>Goal:</span>
                  <span className="font-medium">{notification.data.goal_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-medium">{notification.data.percentage}%</span>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          {notification.created_at_human}
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Notifications" />
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notifications</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {totalUnread} unread
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          {notificationsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
              <h3 className="text-lg font-medium mb-1">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any notifications yet. We'll notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificationsList.map((notification) => (
                <div 
                  key={notification.id}
                  className={`relative p-4 rounded-lg border ${
                    !notification.is_read 
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" 
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1">
                      {renderNotificationContent(notification)}
                      
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600"
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => deleteNotification(notification.id)}
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notifications.meta && notifications.meta.total > notifications.meta.per_page && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                {Array.from({ length: notifications.meta.last_page }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={notifications.meta.current_page === i + 1 ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={notifications.meta.current_page === i + 1}
                    onClick={() => window.location.href = `?page=${i + 1}`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </nav>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}