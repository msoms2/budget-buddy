import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrencySettingsPopup } from '@/hooks/useCurrencySettingsPopup';
import { DollarSign, Settings2, Star, CheckCircle } from 'lucide-react';

/**
 * Demo component showing the Currency Settings Popup functionality
 * This demonstrates all the features that have been implemented:
 * - Shows all selected currencies in the system
 * - "+Add New Currency" button functionality
 * - Search functionality for available currencies
 * - Prevents display of already selected currencies in add list
 * - Remove currency functionality with validation
 */
export default function CurrencyPopupDemo() {
    const { openPopup, popup } = useCurrencySettingsPopup();

    const features = [
        {
            icon: CheckCircle,
            title: "Display Selected Currencies",
            description: "Shows all currently selected currencies with details and symbols"
        },
        {
            icon: Settings2,
            title: "Add New Currencies",
            description: "Browse and add from all available currencies with search functionality"
        },
        {
            icon: Star,
            title: "Smart Filtering",
            description: "Already selected currencies don't appear in the add list"
        },
        {
            icon: DollarSign,
            title: "Remove Currencies",
            description: "Remove currencies with validation (must keep at least one)"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                            <Settings2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            ✅ Implementation Complete
                        </Badge>
                    </div>
                    <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                        Currency Settings Popup Demo
                    </CardTitle>
                    <CardDescription className="text-base">
                        A comprehensive currency management interface that allows users to manage 
                        which currencies are displayed throughout the application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div 
                                    key={index}
                                    className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                            <IconComponent className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm">{feature.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-center">
                            Test the Currency Settings Popup
                        </h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            Click the button below to open the currency settings popup and experience 
                            all the implemented features.
                        </p>
                        <Button 
                            onClick={openPopup}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Settings2 className="h-5 w-5 mr-2" />
                            Open Currency Settings Popup
                        </Button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                            Implementation Status
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>CurrencySettingsPopup.jsx component - Complete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>useCurrencySettingsPopup.jsx hook - Complete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Settings/Currency.jsx integration - Complete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>API endpoints (/api/currencies/*) - Available</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* The popup component will be rendered here when opened */}
            {popup}
        </div>
    );
}
