import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DateRangeSelector from "@/Pages/Reports/components/shared/DateRangeSelector";
import { useToast } from "@/hooks/use-toast.js";
import { apiFetch } from "@/utils/api.js";
import { 
  FileTextIcon, 
  DownloadIcon, 
  CalendarIcon, 
  FilterIcon,
  Loader2Icon,
  AlertCircleIcon,
  CheckCircleIcon,
  FileX
} from "lucide-react";

export default function TransactionsPdfDialog({ open, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const { toast } = useToast();
  const cancelButtonRef = useRef(null);

  // Reset states when dialog opens
  React.useEffect(() => {
    if (open) {
      setIsSuccess(false);
      setError("");
      // Initialize with empty dates when opening
      setDateRange({
        from: null,
        to: null
      });
    }
  }, [open]);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Validate dates
      if (!dateRange.from || !dateRange.to) {
        setError("Please select both start and end dates");
        return;
      }
      
      // Format dates to YYYY-MM-DD format
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        // Use local date formatting to avoid timezone issues
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const formattedStartDate = formatDate(dateRange.from);
      const formattedEndDate = formatDate(dateRange.to);
      
      // Use apiFetch instead of apiJsonFetch for PDF download
      const response = await apiFetch(route('reports.transactions.generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          format: 'pdf'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF report has been downloaded successfully",
        variant: "default",
      });

      // Show success state briefly before closing
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1500);
    } catch (error) {
      setError("Failed to generate PDF report");
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} onOpenAutoFocus={() => cancelButtonRef.current?.focus()}>
      <DialogContent 
        className="sm:max-w-[500px] gap-0 p-0 overflow-hidden"
        aria-describedby="transaction-pdf-description"
        aria-live="polite"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-6 border-b">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FileTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Export Transaction Report
                </DialogTitle>
                <DialogDescription id="transaction-pdf-description" className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Generate a comprehensive PDF report of your transactions for the selected date range.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range Selection Card */}
          <Card className="border-0 shadow-sm bg-gray-50/50 dark:bg-gray-900/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Date Range
                </CardTitle>
                {dateRange.from && dateRange.to && (
                  <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                    {Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24)) + 1} days
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-gray-500">
                Choose the period for your transaction report. Both dates are inclusive.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <DateRangeSelector
                startDate={dateRange.from}
                endDate={dateRange.to}
                onDateChange={(dates) => {
                  // Only update if we have valid dates
                  if (dates && dates.from && dates.to) {
                    setDateRange(dates);
                    setError(""); // Clear any date-related errors
                  }
                }}
                className="w-full rounded-md"
              />
              {(!dateRange.from || !dateRange.to) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  Please select both start and end dates to continue
                </p>
              )}
            </CardContent>
          </Card>

          {/* Export Options Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What's Included in Your Report
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircleIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">All transactions</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <CheckCircleIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">Category breakdown</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <CheckCircleIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">Payment methods</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <CheckCircleIcon className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                <span className="text-orange-700 dark:text-orange-300">Summary totals</span>
              </div>
            </div>
            
            {dateRange.from && dateRange.to && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileTextIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Report Preview</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Period: {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Duration: {Math.ceil((new Date(dateRange.to) - new Date(dateRange.from)) / (1000 * 60 * 60 * 24)) + 1} days
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {isSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
              <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                PDF report generated and downloaded successfully!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50/50 dark:bg-gray-900/50 p-6">
          <DialogFooter className="gap-3">
            <Button
              ref={cancelButtonRef}
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-initial"
              aria-label="Cancel PDF generation"
            >
              Cancel
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleExport}
                    disabled={isLoading || !dateRange.from || !dateRange.to || isSuccess}
                    className={`flex-1 sm:flex-initial shadow-lg transition-all duration-200 ${
                      isSuccess 
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    }`}
                    aria-label={isLoading ? "Generating PDF report..." : isSuccess ? "PDF generated successfully" : "Generate PDF report"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                        Downloaded!
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {(!dateRange.from || !dateRange.to) && (
                  <TooltipContent>
                    <p>Please select both start and end dates to generate the report</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}