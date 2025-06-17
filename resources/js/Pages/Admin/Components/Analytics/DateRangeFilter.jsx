import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  X,
  Clock,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isValid } from "date-fns";

/**
 * DateRangeFilter Component
 * 
 * Date range picker component for filtering analytics data.
 * Features:
 * - Custom date range selection
 * - Quick preset options (Last 7 days, Last month, etc.)
 * - Clear/reset functionality
 * - Validation and error handling
 * - Responsive design
 * - Accessibility support
 * 
 * @param {Object} props
 * @param {Object} props.value - Current date range {from: Date, to: Date}
 * @param {Function} props.onChange - Date range change handler
 * @param {Array} props.presets - Quick preset options
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showPresets - Show preset buttons
 * @param {boolean} props.showClear - Show clear button
 * @param {string} props.variant - Component variant
 * @param {string} props.size - Component size
 */
export default function DateRangeFilter({
  value = { from: null, to: null },
  onChange,
  presets = null,
  placeholder = "Select date range",
  disabled = false,
  minDate = null,
  maxDate = new Date(),
  className = "",
  showPresets = true,
  showClear = true,
  variant = "default",
  size = "default"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(value);

  // Default presets
  const defaultPresets = [
    {
      label: "Last 7 days",
      value: "7d",
      range: {
        from: subDays(new Date(), 6),
        to: new Date()
      }
    },
    {
      label: "Last 30 days",
      value: "30d",
      range: {
        from: subDays(new Date(), 29),
        to: new Date()
      }
    },
    {
      label: "Last 90 days",
      value: "90d",
      range: {
        from: subDays(new Date(), 89),
        to: new Date()
      }
    },
    {
      label: "This month",
      value: "month",
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }
    },
    {
      label: "This year",
      value: "year",
      range: {
        from: startOfYear(new Date()),
        to: endOfYear(new Date())
      }
    }
  ];

  const activePresets = presets || defaultPresets;

  // Update temp range when value changes
  useEffect(() => {
    setTempRange(value);
  }, [value]);

  // Handle preset selection
  const handlePresetSelect = (preset) => {
    const newRange = preset.range;
    setTempRange(newRange);
    onChange?.(newRange);
    setIsOpen(false);
  };

  // Handle manual date selection
  const handleDateSelect = (range) => {
    setTempRange(range);
  };

  // Apply date range
  const handleApply = () => {
    if (tempRange.from && tempRange.to && tempRange.from <= tempRange.to) {
      onChange?.(tempRange);
      setIsOpen(false);
    }
  };

  // Clear date range
  const handleClear = (e) => {
    e.stopPropagation();
    const clearedRange = { from: null, to: null };
    setTempRange(clearedRange);
    onChange?.(clearedRange);
  };

  // Reset to original value
  const handleReset = () => {
    setTempRange(value);
  };

  // Check if current selection matches a preset
  const getActivePreset = () => {
    if (!value.from || !value.to) return null;
    
    return activePresets.find(preset => {
      const presetFrom = format(preset.range.from, 'yyyy-MM-dd');
      const presetTo = format(preset.range.to, 'yyyy-MM-dd');
      const valueFrom = format(value.from, 'yyyy-MM-dd');
      const valueTo = format(value.to, 'yyyy-MM-dd');
      
      return presetFrom === valueFrom && presetTo === valueTo;
    });
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!value.from && !value.to) return placeholder;
    
    if (value.from && !value.to) {
      return format(value.from, "MMM dd, yyyy");
    }
    
    if (value.from && value.to) {
      return `${format(value.from, "MMM dd, yyyy")} - ${format(value.to, "MMM dd, yyyy")}`;
    }
    
    return placeholder;
  };

  // Validate date range
  const isValidRange = tempRange.from && tempRange.to && tempRange.from <= tempRange.to;
  const hasChanges = JSON.stringify(tempRange) !== JSON.stringify(value);

  const activePreset = getActivePreset();

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main date range selector */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={variant === "default" ? "outline" : variant}
            size={size}
            disabled={disabled}
            className={cn(
              "justify-start text-left font-normal w-full",
              !value.from && !value.to && "text-muted-foreground",
              size === "sm" && "h-8",
              size === "lg" && "h-12"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate">{formatDateRange()}</span>
            
            {/* Active preset badge */}
            {activePreset && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activePreset.label}
              </Badge>
            )}
            
            {/* Clear button */}
            {showClear && (value.from || value.to) && (
              <X 
                className="ml-2 h-4 w-4 hover:text-destructive transition-colors" 
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets sidebar */}
            {showPresets && (
              <div className="border-r bg-muted/50 p-3 space-y-2 min-w-[200px]">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Filters
                </Label>
                
                <div className="space-y-1">
                  {activePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-sm",
                        activePreset?.value === preset.value && "bg-primary/10 text-primary"
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <Clock className="mr-2 h-3 w-3" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempRange.from || new Date()}
                selected={tempRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={(date) => {
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
              />
              
              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-xs"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reset
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!isValidRange}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected range info */}
      {(value.from || value.to) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>
            {value.from && value.to ? (
              `${Math.ceil((value.to - value.from) / (1000 * 60 * 60 * 24)) + 1} days selected`
            ) : (
              'Incomplete date range'
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to create date range filter configurations
 */
export const createDateRangeConfig = ({
  presets = null,
  minDate = null,
  maxDate = new Date(),
  showPresets = true,
  showClear = true
}) => ({
  presets,
  minDate,
  maxDate,
  showPresets,
  showClear
});

/**
 * Common date range presets
 */
export const dateRangePresets = {
  analytics: [
    {
      label: "Last 7 days",
      value: "7d",
      range: {
        from: subDays(new Date(), 6),
        to: new Date()
      }
    },
    {
      label: "Last 30 days", 
      value: "30d",
      range: {
        from: subDays(new Date(), 29),
        to: new Date()
      }
    },
    {
      label: "Last 90 days",
      value: "90d", 
      range: {
        from: subDays(new Date(), 89),
        to: new Date()
      }
    },
    {
      label: "Last 6 months",
      value: "6m",
      range: {
        from: subDays(new Date(), 179),
        to: new Date()
      }
    },
    {
      label: "Last year",
      value: "1y",
      range: {
        from: subDays(new Date(), 364),
        to: new Date()
      }
    }
  ],
  
  financial: [
    {
      label: "This month",
      value: "month",
      range: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      }
    },
    {
      label: "This quarter",
      value: "quarter",
      range: {
        from: startOfMonth(subDays(new Date(), 90)),
        to: endOfMonth(new Date())
      }
    },
    {
      label: "This year",
      value: "year",
      range: {
        from: startOfYear(new Date()),
        to: endOfYear(new Date())
      }
    }
  ]
};