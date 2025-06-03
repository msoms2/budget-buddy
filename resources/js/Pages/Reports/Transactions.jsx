import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import TransactionsPdfDialog from '@/components/Reports/TransactionsPdfDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileTextIcon, DownloadIcon } from "lucide-react";

export default function Transactions({ categories }) {
    const [showPdfDialog, setShowPdfDialog] = useState(true); // Open dialog by default

    return (
        <ReportsLayout>
            <Head title="Transaction Reports" />

            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">Transaction Reports</h2>
                    <p className="text-muted-foreground">
                        Generate detailed transaction reports with PDF export functionality
                    </p>
                </div>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <FileTextIcon className="h-8 w-8 text-blue-600" />
                            <div className="space-y-1">
                                <CardTitle>Export Transaction Data</CardTitle>
                                <CardDescription>
                                    Select a date range and generate a comprehensive PDF report of your transactions
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => setShowPdfDialog(true)}
                                className="flex items-center gap-2"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                Generate PDF Report
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Reports include income, expenses, categories, and summary totals
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Features</CardTitle>
                        <CardDescription>What's included in your transaction reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="font-medium">Transaction Details</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Date and description of each transaction</li>
                                    <li>• Transaction categories and amounts</li>
                                    <li>• Income and expense classification</li>
                                    <li>• Payment method information</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">Summary Information</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Total income for the period</li>
                                    <li>• Total expenses for the period</li>
                                    <li>• Net balance calculation</li>
                                    <li>• Report generation date</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <TransactionsPdfDialog
                open={showPdfDialog}
                onClose={() => setShowPdfDialog(false)}
            />
        </ReportsLayout>
    );
}
