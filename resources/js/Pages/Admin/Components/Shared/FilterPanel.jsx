import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  X, 
  Search, 
  Calendar,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * FilterPanel Component
 * 
 * Advanced filtering interface for data tables with:
 * - Text search
 * - Select filters
 * - Date range filters
 * - Active filter display
 * - Reset functionality
 * - Collapsible sections
 * 
 * @param {Object} props
 * @param {Array} props.filters - Array of filter definitions
 * @param {Object} props.values - Current filter values
 * @param {Function} props.onFiltersChange - Filter change handler
 * @param {Function} props.onReset - Reset handler
 * @param {boolean} props.collapsible - Whether the panel is collapsible
 * @param {boolean} props.defaultExpanded - Default expanded state
 * @param {string} props.title - Panel title
 * @param {string} props.className - Additional CSS classes
 */
export default function FilterPanel({
  filters = [],
  values = {},
  onFiltersChange,
  onReset,
  collapsible = false,
  defaultExpanded = true,
  title = "Filters",
  className = ""
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localValues, setLocalValues] = useState(values);

  // Update local values when props change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  // Handle filter value change
  const handleFilterChange = (key, value) => {
    // Convert special clear value to empty string
    const actualValue = value === "__clear__" ? "" : value;
    const newValues = { ...localValues, [key]: actualValue };
    setLocalValues(newValues);
    onFiltersChange && onFiltersChange(newValues);
  };

  // Handle reset
  const handleReset = () => {
    const resetValues = {};
    filters.forEach(filter => {
      resetValues[filter.key] = filter.defaultValue || '';
    });
    setLocalValues(resetValues);
    onReset && onReset();
  };

  // Get active filters count
  const activeFiltersCount = Object.values(localValues).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;

  // Render filter input based on type
  const renderFilterInput = (filter) => {
    const value = localValues[filter.key] || '';

    switch (filter.type) {
      case 'text':
      case 'search':
        return (
          <div className="relative">
            {filter.type === 'search' && (
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              type="text"
              placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className={filter.type === 'search' ? "pl-8" : ""}
            />
          </div>
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleFilterChange(filter.key, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {filter.clearable && (
                <SelectItem value="__clear__">
                  <span className="text-muted-foreground">All {filter.label}</span>
                </SelectItem>
              )}
              {filter.options?.filter(option => option && option.value !== '' && option.value !== null && option.value !== undefined).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="pl-8"
            />
          </div>
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="From"
                value={value?.from || ''}
                onChange={(e) => handleFilterChange(filter.key, { 
                  ...value, 
                  from: e.target.value 
                })}
                className="pl-8"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="To"
                value={value?.to || ''}
                onChange={(e) => handleFilterChange(filter.key, { 
                  ...value, 
                  to: e.target.value 
                })}
                className="pl-8"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            min={filter.min}
            max={filter.max}
            step={filter.step}
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );
    }
  };

  // Panel content
  const panelContent = (
    <div className="space-y-6">
      {/* Filter grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-2">
            <Label htmlFor={filter.key} className="text-sm font-medium">
              {filter.label}
              {filter.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div id={filter.key}>
              {renderFilterInput(filter)}
            </div>
          </div>
        ))}
      </div>

      {/* Active filters and actions */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Active filters:
              </span>
              {Object.entries(localValues).map(([key, value]) => {
                if (!value || value === '') return null;
                
                const filter = filters.find(f => f.key === key);
                if (!filter) return null;

                const displayValue = filter.type === 'select' 
                  ? filter.options?.find(opt => opt.value === value)?.label || value
                  : filter.type === 'daterange'
                  ? `${value.from || ''} - ${value.to || ''}`
                  : value;

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span className="text-xs">
                      {filter.label}: {displayValue}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange(key, '')}
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <Card className={cn("w-full", className)}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {panelContent}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <CardTitle className="text-lg">{title}</CardTitle>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {panelContent}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to create filter definitions
 */
export const createFilter = ({
  key,
  label,
  type = 'text',
  placeholder = null,
  options = [],
  required = false,
  clearable = true,
  defaultValue = '',
  min = null,
  max = null,
  step = null
}) => ({
  key,
  label,
  type,
  placeholder,
  options,
  required,
  clearable,
  defaultValue,
  min,
  max,
  step
});