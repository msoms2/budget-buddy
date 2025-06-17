import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClockIcon } from "lucide-react";
import {
    ACTIVITY_TYPES,
    getActivityConfig,
    getActivityIcon,
    getActivityStyling
} from "./ActivityTypes";

/**
 * Activity Timeline Component
 * 
 * Displays chronological user activity including transactions, logins, 
 * account changes, and other significant user actions in a timeline format.
 */
export default function ActivityTimeline({ timeline = [], user }) {

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user?.currency?.code || 'USD'
        }).format(amount);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Unknown time';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        // Format relative time
        let relativeTime;
        if (diffMinutes < 1) {
            relativeTime = 'Just now';
        } else if (diffMinutes < 60) {
            relativeTime = `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            relativeTime = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            relativeTime = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else {
            relativeTime = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: diffDays > 365 ? 'numeric' : undefined
            });
        }

        const fullDateTime = date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return { relativeTime, fullDateTime };
    };

    const getActivityIconComponent = (type) => {
        const IconComponent = getActivityIcon(type);
        return <IconComponent className="h-4 w-4" />;
    };

    const formatActivityDescription = (activity) => {
        switch (activity.type) {
            case 'expense':
                return (
                    <span>
                        Created expense <strong>{activity.name}</strong>
                        {activity.amount && (
                            <> for <strong className="text-red-600">{formatCurrency(Math.abs(activity.amount))}</strong></>
                        )}
                        {activity.category && (
                            <> in <Badge variant="outline" className="ml-1">{activity.category}</Badge></>
                        )}
                    </span>
                );
            case 'income':
            case 'earning':
                return (
                    <span>
                        Received income <strong>{activity.name}</strong>
                        {activity.amount && (
                            <> of <strong className="text-green-600">{formatCurrency(activity.amount)}</strong></>
                        )}
                        {activity.category && (
                            <> from <Badge variant="outline" className="ml-1">{activity.category}</Badge></>
                        )}
                    </span>
                );
            case 'login':
                return (
                    <span>
                        Signed in to account
                        {activity.ip_address && (
                            <> from <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{activity.ip_address}</code></>
                        )}
                    </span>
                );
            case 'profile_update':
                return (
                    <span>
                        Updated profile information
                        {activity.fields && (
                            <> ({activity.fields.join(', ')})</>
                        )}
                    </span>
                );
            case 'goal_created':
                return (
                    <span>
                        Created new goal <strong>{activity.name}</strong>
                        {activity.target_amount && (
                            <> with target of <strong>{formatCurrency(activity.target_amount)}</strong></>
                        )}
                    </span>
                );
            case 'goal_updated':
                return (
                    <span>
                        Updated goal <strong>{activity.name}</strong>
                        {activity.progress && (
                            <> (Progress: {activity.progress}%)</>
                        )}
                    </span>
                );
            case 'budget_created':
                return (
                    <span>
                        Created budget for <strong>{activity.category}</strong>
                        {activity.amount && (
                            <> with limit of <strong>{formatCurrency(activity.amount)}</strong></>
                        )}
                    </span>
                );
            case 'account_change':
                return (
                    <span>
                        {activity.action || 'Updated account settings'}
                        {activity.details && (
                            <> - {activity.details}</>
                        )}
                    </span>
                );
            default:
                return activity.description || activity.name || 'Unknown activity';
        }
    };

    if (!timeline || timeline.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        Recent Activity Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity to display</p>
                        <p className="text-sm">User activity will appear here once they start using the platform</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Recent Activity Timeline
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Chronological view of user's recent activities and transactions
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {timeline.map((activity, index) => {
                        const styling = getActivityStyling(activity.type);
                        const timeInfo = formatDateTime(activity.timestamp || activity.created_at || activity.date);
                        
                        return (
                            <div key={activity.id || index} className="flex gap-4">
                                {/* Timeline Icon */}
                                <div className="flex flex-col items-center">
                                    <div className={`
                                        flex items-center justify-center w-10 h-10 rounded-full
                                        ${styling.color} text-white shadow-sm
                                    `}>
                                        {getActivityIconComponent(activity.type)}
                                    </div>
                                    {index < timeline.length - 1 && (
                                        <div className="w-px h-6 bg-border mt-2" />
                                    )}
                                </div>

                                {/* Activity Content */}
                                <div className={`
                                    flex-1 p-4 rounded-lg border
                                    ${styling.bgColor}
                                `}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${styling.textColor}`}>
                                                {formatActivityDescription(activity)}
                                            </div>
                                            
                                            {activity.description && activity.type !== 'expense' && activity.type !== 'income' && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {activity.description}
                                                </p>
                                            )}

                                            {/* Additional activity details */}
                                            {activity.metadata && (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    {Object.entries(activity.metadata).map(([key, value]) => (
                                                        <span key={key} className="mr-3">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-muted-foreground text-right">
                                            <div title={timeInfo.fullDateTime}>
                                                {timeInfo.relativeTime}
                                            </div>
                                            {activity.source && (
                                                <div className="mt-1">
                                                    via {activity.source}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Load more indicator */}
                    {timeline.length >= 10 && (
                        <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing last {timeline.length} activities
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}