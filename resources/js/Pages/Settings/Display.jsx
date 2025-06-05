import React from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Monitor,
    FolderIcon,
    Home,
    BarChart3,
    CreditCard,
    DollarSign,
    Target,
    TrendingUp,
    FileText,
    Shield,
    Info,
    Save
} from 'lucide-react';

export default function Display({ data, setData, processing, handleSubmit }) {
    const { auth } = usePage().props;

    return (
        <form onSubmit={handleSubmit}>
            <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                        <Monitor className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Display Settings</CardTitle>
                        <CardDescription>
                            Customize the interface layout and sidebar navigation.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                        <FolderIcon className="h-4 w-4" />
                        Sidebar Navigation
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Choose which sections appear in your sidebar navigation. Changes take effect after saving.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Main overview page' },
                            { id: 'analyticsAndIncome', label: 'Analytics & Income', icon: BarChart3, description: 'Income tracking and analytics' },
                            { id: 'categories', label: 'Categories', icon: FolderIcon, description: 'Expense and income categories' },
                            { id: 'transactions', label: 'Transactions', icon: CreditCard, description: 'All financial transactions' },
                            { id: 'budgets', label: 'Budgets', icon: DollarSign, description: 'Budget planning and tracking' },
                            { id: 'goals', label: 'Goals', icon: Target, description: 'Financial goals and targets' },
                            { id: 'savings', label: 'Savings', icon: DollarSign, description: 'Savings accounts and tracking' },
                            { id: 'debtManagement', label: 'Debt Management', icon: CreditCard, description: 'Debt tracking and management' },
                            { id: 'investments', label: 'Investments', icon: TrendingUp, description: 'Investment portfolio' },
                            { id: 'reports', label: 'Reports', icon: FileText, description: 'Financial reports and exports' }
                        ].map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-sm">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={data.sidebarItems[item.id]}
                                        onCheckedChange={(checked) => 
                                            setData('sidebarItems', {...data.sidebarItems, [item.id]: checked})
                                        }
                                    />
                                </div>
                            );
                        })}

                        {/* Admin Panel - Only show if user is admin */}
                        {auth.user?.roles?.some(role => role.name === 'admin') && (
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Admin Panel</p>
                                        <p className="text-xs text-muted-foreground">Administrative controls and settings</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={data.sidebarItems.adminPanel}
                                    onCheckedChange={(checked) => 
                                        setData('sidebarItems', {...data.sidebarItems, adminPanel: checked})
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Changes to sidebar items will take effect after saving your settings and refreshing the page.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="bg-muted/30">
                <Button type="submit" disabled={processing} className="flex items-center gap-2" onClick={handleSubmit}>
                    <Save className="h-4 w-4" />
                    {processing ? 'Saving...' : 'Save Display Settings'}
                </Button>
            </CardFooter>
            </Card>
        </form>
    );
}
