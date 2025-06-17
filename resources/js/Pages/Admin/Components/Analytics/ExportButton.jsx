import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

/**
 * ExportButton Component
 * 
 * Reusable export functionality component for analytics dashboards.
 * Features:
 * - Multiple export formats (CSV, PDF, PNG, Excel)
 * - Loading states with progress indication
 * - Success/error feedback
 * - Customizable format options
 * - Batch export functionality
 * - File size estimation
 * 
 * @param {Object} props
 * @param {Array} props.formats - Available export formats ['csv', 'pdf', 'png', 'excel']
 * @param {Function} props.onExport - Export handler function(format, options)
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.label - Button label
 * @param {Object} props.data - Data to export (for size estimation)
 * @param {string} props.filename - Default filename
 * @param {boolean} props.showProgress - Show progress indicator
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.exportOptions - Default export options
 * @param {boolean} props.showDropdown - Show format dropdown vs single button
 */
export default function ExportButton({
  formats = ['csv', 'pdf'],
  onExport,
  variant = "outline",
  size = "sm",
  disabled = false,
  label = "Export",
  data = null,
  filename = null,
  showProgress = true,
  className = "",
  exportOptions = {},
  showDropdown = true
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  // Format configurations
  const formatConfig = {
    csv: {
      label: 'CSV',
      icon: FileSpreadsheet,
      description: 'Comma-separated values',
      mimeType: 'text/csv',
      extension: '.csv',
      estimatedSize: data ? Math.ceil(JSON.stringify(data).length * 0.8) : null
    },
    excel: {
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Microsoft Excel file',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: '.xlsx',
      estimatedSize: data ? Math.ceil(JSON.stringify(data).length * 1.2) : null
    },
    pdf: {
      label: 'PDF',
      icon: FileText,
      description: 'Portable Document Format',
      mimeType: 'application/pdf',
      extension: '.pdf',
      estimatedSize: data ? Math.ceil(JSON.stringify(data).length * 1.5) : null
    },
    png: {
      label: 'PNG',
      icon: Image,
      description: 'Portable Network Graphics',
      mimeType: 'image/png',
      extension: '.png',
      estimatedSize: null // Cannot estimate image size
    },
    json: {
      label: 'JSON',
      icon: FileText,
      description: 'JavaScript Object Notation',
      mimeType: 'application/json',
      extension: '.json',
      estimatedSize: data ? JSON.stringify(data).length : null
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    return ` (~${size} ${sizes[i]})`;
  };

  // Handle export
  const handleExport = async (format) => {
    if (!onExport) {
      console.warn('ExportButton: onExport handler not provided');
      return;
    }

    setLoading(true);
    setCurrentFormat(format);
    setExportStatus(null);

    try {
      const config = formatConfig[format];
      const exportData = {
        format,
        filename: filename || `export_${Date.now()}${config.extension}`,
        mimeType: config.mimeType,
        ...exportOptions
      };

      await onExport(format, exportData);
      
      setExportStatus('success');
      toast({
        title: "Export Successful",
        description: `Data exported as ${config.label} format`,
        variant: "default"
      });

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setCurrentFormat(null);
      
      // Clear status after 3 seconds
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  // Render single format button
  const renderSingleButton = (format) => {
    const config = formatConfig[format];
    const IconComponent = config.icon;
    const isCurrentlyLoading = loading && currentFormat === format;

    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={() => handleExport(format)}
        className={cn("flex items-center gap-2", className)}
      >
        {isCurrentlyLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : exportStatus === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : exportStatus === 'error' ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <IconComponent className="h-4 w-4" />
        )}
        {label} {config.label}
      </Button>
    );
  };

  // Render dropdown menu
  const renderDropdown = () => {
    const hasMultipleFormats = formats.length > 1;
    
    if (!hasMultipleFormats && formats.length === 1) {
      return renderSingleButton(formats[0]);
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || loading}
            className={cn("flex items-center gap-2", className)}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : exportStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : exportStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {label}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {formats.map((format) => {
            const config = formatConfig[format];
            const IconComponent = config.icon;
            const isCurrentlyLoading = loading && currentFormat === format;
            const estimatedSize = config.estimatedSize;

            return (
              <DropdownMenuItem
                key={format}
                onClick={() => handleExport(format)}
                disabled={loading}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  {isCurrentlyLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconComponent className="h-4 w-4" />
                  )}
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.description}
                      {estimatedSize && formatFileSize(estimatedSize)}
                    </div>
                  </div>
                </div>
                
                {format === 'pdf' && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Show single button or dropdown based on props
  if (!showDropdown && formats.length === 1) {
    return renderSingleButton(formats[0]);
  }

  return renderDropdown();
}

/**
 * Helper function to create export configurations
 */
export const createExportConfig = ({
  formats = ['csv', 'pdf'],
  filename = null,
  onExport = null,
  exportOptions = {}
}) => ({
  formats,
  filename,
  onExport,
  exportOptions
});

/**
 * Default export handlers for common formats
 */
export const exportHandlers = {
  // CSV export handler
  csv: (data, options = {}) => {
    const { filename = 'export.csv' } = options;
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available for CSV export');
    }

    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  },

  // JSON export handler
  json: (data, options = {}) => {
    const { filename = 'export.json' } = options;
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
};