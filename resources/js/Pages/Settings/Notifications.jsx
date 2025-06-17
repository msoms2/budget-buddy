import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationSettings from '@/components/NotificationSettings';
import { Bell } from 'lucide-react';

export default function Notifications({ data, setData, processing, handleSubmit }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Notification Settings</CardTitle>
                        <CardDescription>
                            Configure how and when you receive notifications about your financial activity.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <NotificationSettings />
            </CardContent>
        </Card>
    );
}
