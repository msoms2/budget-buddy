import React from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

export default function SecuritySection() {
    const { toast } = useToast();
    
    const { data, setData, post, processing } = useForm({
        two_factor_enabled: false,
        browser_sessions_enabled: true,
        login_notifications: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('security.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Security Settings Updated',
                    description: 'Your security preferences have been saved.',
                });
            },
        });
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Enhanced Security</CardTitle>
                        <CardDescription>
                            Configure additional security features for your account.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="two_factor_enabled" className="text-base">Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                                Require a security code in addition to your password when signing in.
                            </p>
                        </div>
                        <Switch
                            id="two_factor_enabled"
                            checked={data.two_factor_enabled}
                            onCheckedChange={(checked) => setData('two_factor_enabled', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="browser_sessions_enabled" className="text-base">Remember Browser Sessions</Label>
                            <p className="text-sm text-muted-foreground">
                                Keep track of browsers and devices where you're logged in.
                            </p>
                        </div>
                        <Switch
                            id="browser_sessions_enabled"
                            checked={data.browser_sessions_enabled}
                            onCheckedChange={(checked) => setData('browser_sessions_enabled', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="login_notifications" className="text-base">Login Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive email notifications for new sign-ins to your account.
                            </p>
                        </div>
                        <Switch
                            id="login_notifications"
                            checked={data.login_notifications}
                            onCheckedChange={(checked) => setData('login_notifications', checked)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30">
                    <Button type="submit" disabled={processing} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
