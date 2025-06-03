import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, AlertTriangle } from 'lucide-react';
import { detectExtensionConflicts, monitorExtensionErrors } from '@/utils/extensionDetection';

export default function ExportDialog({ open, setOpen }) {
  const [isLoading, setIsLoading] = useState(false);
  const [exportId, setExportId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [extensionWarning, setExtensionWarning] = useState(null);

  const { data, setData, post, get, processing } = useForm({
    exporter: 'expenses',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    post(route('exports.store'), {
      preserveScroll: true,
      onSuccess: (page) => {
        console.log('Export store response:', page);
        console.log('Flash data:', page.props?.flash);
        
        const responseData = page.props?.flash;
        if (responseData && responseData.export) {
          setExportId(responseData.export.id);
          setProgress(
            responseData.export.total_rows > 0
              ? (responseData.export.processed_rows / responseData.export.total_rows) * 100
              : 0
          );
          if (responseData.export.completed_at) {
            setIsLoading(false);
          }
        } else {
          // Handle case where responseData or responseData.export is undefined
          setError("Export data not available in response");
          setIsLoading(false);
        }
      },
      onError: (errors) => {
        setError(Object.values(errors).join('\n'));
        setIsLoading(false);
      },
    });
  };

  // Auto-refresh dialog every 2 seconds while export is processing
  useEffect(() => {
    let interval;
    if (isLoading && exportId) {
      interval = setInterval(() => {
        get(route('exports.status', { export: exportId }), {
          preserveScroll: true,
          onSuccess: (page) => {
            console.log('Export status response:', page);
            console.log('Status flash data:', page.props?.flash);
            
            const responseData = page.props?.flash;
            if (responseData && responseData.export) {
              const { processed_rows, total_rows, completed_at } = responseData.export;
              const newProgress = total_rows > 0 ? (processed_rows / total_rows) * 100 : 0;
              setProgress(Math.min(newProgress, 100));
              
              // Set download ready state if export is complete and successful
              if (completed_at) {
                setIsLoading(false);
                clearInterval(interval);
                
                if (!responseData.export.error && newProgress === 100) {
                  setIsDownloadReady(true);
                } else if (responseData.export.error) {
                  setError(responseData.export.error);
                }
              }
            } else {
              // Handle case where responseData or responseData.export is undefined
              setError("Export status data not available");
              setIsLoading(false);
              clearInterval(interval);
            }
          },
          onError: (errors) => {
            setError(typeof errors === 'string' ? errors : 'Error checking export status');
            setIsLoading(false);
            clearInterval(interval);
          }
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading, exportId]);

  const handleDownload = () => {
    if (!exportId) return;
    window.location.href = route('exports.download', { export: exportId });
  };

  const resetForm = () => {
    setData({
      exporter: 'expenses',
      from_date: new Date().toISOString().split('T')[0],
      to_date: new Date().toISOString().split('T')[0],
    });
    setExportId(null);
    setProgress(0);
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  // Add extension error monitoring
  useEffect(() => {
    if (open) {
      // Check for extension conflicts when dialog opens
      const conflicts = detectExtensionConflicts();
      if (conflicts.length > 0) {
        setExtensionWarning(`Browser extension detected that may interfere with export: ${conflicts[0]}. If export fails, try disabling browser extensions.`);
      }

      // Monitor for extension errors during export
      const cleanup = monitorExtensionErrors((errorInfo) => {
        console.warn('Extension error detected:', errorInfo);
        if (!extensionWarning) {
          setExtensionWarning('Browser extension conflict detected. If export fails, try disabling extensions.');
        }
      });

      // Handle browser extension errors that might interfere with export
      const handleExtensionErrors = (event) => {
        if (event.message && event.message.includes('receiving end does not exist')) {
          console.warn('Browser extension conflict detected during export:', event.message);
          // Don't let extension errors stop our export process
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      };

      window.addEventListener('error', handleExtensionErrors, true);
      window.addEventListener('unhandledrejection', handleExtensionErrors, true);

      return () => {
        cleanup();
        window.removeEventListener('error', handleExtensionErrors, true);
        window.removeEventListener('unhandledrejection', handleExtensionErrors, true);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Financial Data</DialogTitle>
          <DialogDescription>
            Export your financial data to an XLSX file. The exported file will include:
            <ul className="mt-2 list-disc pl-4 text-sm">
              <li>Original amounts in their source currencies</li>
              <li>Converted amounts in your preferred currency</li>
              <li>Exchange rates used for conversions</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        {extensionWarning && (
          <Alert className="mt-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {extensionWarning}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription className="flex items-start">
              <span className="font-medium">Export failed:</span>
              <span className="ml-2">{error}</span>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exporter">Export Type</Label>
            <Select
              value={data.exporter}
              onValueChange={(value) => setData('exporter', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type to export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="earnings">Earnings</SelectItem>
                <SelectItem value="all">All Transactions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="from_date">From Date</Label>
            <Input
              id="from_date"
              type="date"
              value={data.from_date}
              onChange={e => setData('from_date', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="to_date">To Date</Label>
            <Input
              id="to_date"
              type="date"
              value={data.to_date}
              onChange={e => setData('to_date', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mt-4 rounded-lg border border-muted p-4">
            <h4 className="font-medium text-sm mb-2">Currency Information</h4>
            <p className="text-sm text-muted-foreground">
              Amounts will be exported with both original and converted values using
              current exchange rates. All conversions use your preferred currency as the base.
            </p>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Export Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancel
            </Button>
            {isLoading ? (
              <Button type="button" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </Button>
            ) : !exportId ? (
              <Button type="submit" disabled={processing}>
                Export
              </Button>
            ) : isDownloadReady ? (
              <Button type="button" onClick={handleDownload} variant="success">
                <Download className="mr-2 h-4 w-4" />
                Download Ready
              </Button>
            ) : error ? (
              <Button type="submit" variant="destructive" onClick={() => resetForm()}>
                Retry Export
              </Button>
            ) : (
              <Button type="button" disabled>
                Preparing Download...
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
