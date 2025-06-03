import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';
import { apiFetch } from '@/utils/api.js';

export default function AccountManagementCard() {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    
    const handleExportData = async () => {
        setExporting(true);
        setExportProgress(0);
        
        try {
            // Initiate export
            const response = await apiFetch('/api/exports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'all' })
            });

            if (!response.ok) {
                const errorText = await response.text().catch(e => 'No error details available');
                console.error('Export response error:', errorText);
                throw new Error(`Export failed: ${response.status} ${response.statusText}`);
            }

            const { export: exportData } = await response.json();
            console.log('Export initiated:', exportData);
            
            // Set initial progress
            setExportProgress(10);
            
            // Poll for status
            const checkStatus = async () => {
                const statusResponse = await apiFetch(`/api/exports/${exportData.id}/status`);
                if (!statusResponse.ok) {
                    throw new Error('Failed to check export status');
                }

                const { export: status } = await statusResponse.json();
                console.log('Export status:', status);

                // Update progress from backend
                if (status.progress !== undefined && status.progress !== null) {
                    console.log('Updating progress to:', status.progress);
                    setExportProgress(status.progress);
                } else {
                    console.log('No progress in status:', status);
                }

                if (status.error) {
                    throw new Error(status.error);
                }

                if (status.status === 'completed' && status.can_download) {
                    // Download the file
                    const downloadResponse = await apiFetch(`/api/exports/${exportData.id}/download`);
                    if (!downloadResponse.ok) {
                        throw new Error('Failed to download export');
                    }
                    
                    const blob = await downloadResponse.blob();
                    console.log('Download blob:', { size: blob.size, type: blob.type });
                    
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'budget-buddy-data.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    toast({
                        title: 'Export Successful',
                        description: 'Your data has been exported successfully.',
                    });

                    // Reset after a brief delay
                    setTimeout(() => {
                        setExporting(false);
                        setExportProgress(0);
                    }, 1000);
                    
                    return true;
                }
                
                if (status.status === 'failed') {
                    throw new Error(status.error || 'Export failed');
                }
                
                // Continue polling more frequently
                await new Promise(resolve => setTimeout(resolve, 500));
                return checkStatus();
            };

            await checkStatus();
        } catch (error) {
            console.error('Export error:', error);
            toast({
                title: 'Export Failed',
                description: error.message || 'There was a problem exporting your data. Please try again.',
                variant: 'destructive',
            });
            setExporting(false);
            setExportProgress(0);
        }
    };

    const handleImportData = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'auto'); // Auto-detect the file type

        setUploading(true);

        router.post('/import', formData, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Import Successful',
                    description: 'Your data has been imported successfully.',
                });
                e.target.value = '';
            },
            onError: () => {
                toast({
                    title: 'Import Failed',
                    description: 'There was a problem importing your data. Please check the file format and try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setUploading(false);
            }
        });
    };

    const handleDeleteAccount = () => {
        router.delete('/user-account', {
            onSuccess: () => {
                // This will redirect to login page automatically
            },
        });
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Account Management</CardTitle>
                <CardDescription>
                    Manage your account data and export or import financial records.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        className="flex items-center justify-center gap-2 h-auto py-4 border-dashed"
                        disabled
                    >
                        <Download className="h-5 w-5" />
                        <div className="text-left">
                            <div className="font-medium">Export Your Data</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Download your financial records
                            </p>
                        </div>
                    </Button>

                    <div className="relative">
                        <Button 
                            variant="outline" 
                            className="flex items-center justify-center gap-2 h-auto py-4 border-dashed w-full"
                            disabled
                        >
                            <Upload className="h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Import Data</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload CSV or Excel files
                                </p>
                            </div>
                        </Button>
                        <input 
                            type="file"
                            id="import-file"
                            className="hidden"
                            accept=".csv,.xlsx"
                            disabled
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-between">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your account and all your financial data. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDeleteAccount}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground italic">
                    Note: All exported data is encrypted for your security.
                </p>
            </CardFooter>
        </Card>
    );
}
