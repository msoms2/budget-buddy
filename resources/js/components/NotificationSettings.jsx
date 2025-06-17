import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Bell, 
    Mail, 
    Smartphone, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    DollarSign,
    TrendingUp,
    Target,
    Calendar,
    CreditCard,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';
import axios from 'axios';

export default function NotificationSettings() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState([]);
    const [channels, setChannels] = useState({});
    const [frequencies, setFrequencies] = useState({});
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notifications/settings');
            setSettings(response.data.settings || []);
            setChannels(response.data.channels || {});
            setFrequencies(response.data.frequencies || {});
            setError('');
        } catch (error) {
            console.error('Failed to fetch notification settings:', error);
            setError('Failed to load notification settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (typeId, updates) => {
        try {
            setSaving(true);
            const notificationType = settings.find(s => s.notification_type_id === typeId)?.notification_type;
            
            if (!notificationType) {
                throw new Error('Notification type not found');
            }

            await axios.put(`/api/notifications/settings/${notificationType.id}`, updates);
            
            // Update local state
            setSettings(prev => prev.map(setting => 
                setting.notification_type_id === typeId 
                    ? { ...setting, ...updates }
                    : setting
            ));
            
            setHasChanges(false);
            toast({
                title: 'Settings Updated',
                description: 'Your notification preferences have been saved successfully.',
                variant: 'default'
            });
        } catch (error) {
            console.error('Failed to update notification settings:', error);
            toast({
                title: 'Update Failed',
                description: 'Failed to update notification settings. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (typeId, field, value) => {
        setSettings(prev => prev.map(setting => 
            setting.notification_type_id === typeId 
                ? { ...setting, [field]: value }
                : setting
        ));
        setHasChanges(true);
    };

    const saveAllChanges = async () => {
        try {
            setSaving(true);
            const promises = settings.map(setting => {
                const { notification_type, ...updates } = setting;
                return axios.put(`/api/notifications/settings/${notification_type.id}`, {
                    is_enabled: updates.is_enabled,
                    frequency: updates.frequency || 'immediate', // Ensure valid frequency is set
                    channels: updates.channels && updates.channels.length > 0 ? updates.channels : ['email', 'in_app']
                });
            });
            
            await Promise.all(promises);
            setHasChanges(false);
            toast({
                title: 'All Settings Updated',
                description: 'All notification preferences have been saved successfully.',
                variant: 'default'
            });
        } catch (error) {
            console.error('Failed to save all settings:', error);
            toast({
                title: 'Save Failed',
                description: 'Failed to save some notification settings. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const resetToDefaults = () => {
        setSettings(prev => prev.map(setting => ({
            ...setting,
            is_enabled: true,
            frequency: 'immediate',
            channels: ['email', 'in_app']
        })));
        setHasChanges(true);
    };

    const getNotificationIcon = (slug) => {
        const iconMap = {
            'budget_limit_alert': DollarSign,
            'goal_progress_update': Target,
            'bill_payment_reminder': Calendar,
            'large_expense': CreditCard,
            'investment_update': TrendingUp,
            'default': Bell
        };
        return iconMap[slug] || iconMap.default;
    };

    const getNotificationColor = (slug) => {
        const colorMap = {
            'budget_limit_alert': 'text-red-600 dark:text-red-400',
            'goal_progress_update': 'text-green-600 dark:text-green-400',
            'bill_payment_reminder': 'text-blue-600 dark:text-blue-400',
            'large_expense': 'text-orange-600 dark:text-orange-400',
            'investment_update': 'text-purple-600 dark:text-purple-400',
            'default': 'text-gray-600 dark:text-gray-400'
        };
        return colorMap[slug] || colorMap.default;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading notification settings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                    {error}
                    <Button variant="outline" size="sm" onClick={fetchSettings}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Notification Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure how and when you receive different types of notifications.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Unsaved changes
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={resetToDefaults}>
                        Reset to defaults
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">All Notifications</p>
                                <p className="text-xs text-muted-foreground">Enable/disable all at once</p>
                            </div>
                            <Switch
                                checked={settings.every(s => s.is_enabled)}
                                onCheckedChange={(enabled) => {
                                    setSettings(prev => prev.map(setting => ({
                                        ...setting,
                                        is_enabled: enabled
                                    })));
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Enable email for all types</p>
                            </div>
                            <Switch
                                checked={settings.every(s => s.channels?.includes('email'))}
                                onCheckedChange={(enabled) => {
                                    setSettings(prev => prev.map(setting => ({
                                        ...setting,
                                        channels: enabled 
                                            ? [...new Set([...(setting.channels || []), 'email'])]
                                            : (setting.channels || []).filter(c => c !== 'email')
                                    })));
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">In-App Notifications</p>
                                <p className="text-xs text-muted-foreground">Show in notification bell</p>
                            </div>
                            <Switch
                                checked={settings.every(s => s.channels?.includes('in_app'))}
                                onCheckedChange={(enabled) => {
                                    setSettings(prev => prev.map(setting => ({
                                        ...setting,
                                        channels: enabled 
                                            ? [...new Set([...(setting.channels || []), 'in_app'])]
                                            : (setting.channels || []).filter(c => c !== 'in_app')
                                    })));
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Individual Notification Settings */}
            <div className="space-y-4">
                <h4 className="font-medium text-base">Individual Notification Types</h4>
                
                {settings.map((setting) => {
                    const IconComponent = getNotificationIcon(setting.notification_type?.slug);
                    const iconColor = getNotificationColor(setting.notification_type?.slug);
                    
                    return (
                        <Card key={setting.id} className="transition-all hover:shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg bg-muted/50 ${iconColor}`}>
                                        <IconComponent className="h-5 w-5" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-medium">
                                                    {setting.notification_type?.name || 'Unknown Type'}
                                                </h5>
                                                <p className="text-sm text-muted-foreground">
                                                    {setting.notification_type?.description || 'No description available'}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={setting.is_enabled}
                                                onCheckedChange={(enabled) => 
                                                    handleToggle(setting.notification_type_id, 'is_enabled', enabled)
                                                }
                                            />
                                        </div>

                                        {setting.is_enabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-muted">
                                                {/* Frequency Selection */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Frequency
                                                    </Label>
                                                    <Select
                                                        value={setting.frequency || 'immediate'}
                                                        onValueChange={(frequency) => 
                                                            handleToggle(setting.notification_type_id, 'frequency', frequency)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(frequencies).map(([key, label]) => (
                                                                <SelectItem key={key} value={key}>
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Channel Selection */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-2">
                                                        <Bell className="h-4 w-4" />
                                                        Delivery Method
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {Object.entries(channels).map(([key, label]) => (
                                                            <div key={key} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`${setting.id}-${key}`}
                                                                    checked={(setting.channels || []).includes(key)}
                                                                    onCheckedChange={(checked) => {
                                                                        const newChannels = checked
                                                                            ? [...new Set([...(setting.channels || []), key])]
                                                                            : (setting.channels || []).filter(c => c !== key);
                                                                        handleToggle(setting.notification_type_id, 'channels', newChannels);
                                                                    }}
                                                                />
                                                                <Label 
                                                                    htmlFor={`${setting.id}-${key}`}
                                                                    className="text-sm flex items-center gap-1"
                                                                >
                                                                    {key === 'email' && <Mail className="h-3 w-3" />}
                                                                    {key === 'sms' && <Smartphone className="h-3 w-3" />}
                                                                    {key === 'in_app' && <Bell className="h-3 w-3" />}
                                                                    {label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Save Section */}
            {hasChanges && (
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                        You have unsaved changes
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Save your notification preferences to apply the changes.
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={saveAllChanges} 
                                disabled={saving}
                                className="flex items-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Information Section */}
            <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                    <strong>Note:</strong> Email notifications require a verified email address. 
                    Changes to notification settings take effect immediately. You can test your 
                    notification settings by creating a test transaction or budget.
                </AlertDescription>
            </Alert>
        </div>
    );
}