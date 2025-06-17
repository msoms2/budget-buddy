/**
 * Shared filter panel for unified analytics dashboard
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CalendarIcon, 
  FilterIcon, 
  X, 
  RotateCcw,
  ChevronDown,
  Clock,
  User,
  Download,
  Share2
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { DATE_RANGE_OPTIONS } from '../Hooks/useUnifiedFilters';

const AnalyticsFilterPanel = ({
  filters,
  onFiltersChange,
  isApplying = false,
  hasUnsavedChanges = false,
  onApply,
  onReset,
  onExport,
  onShare,
  className,
  variant = 'default', // 'default' | 'compact' | 'sidebar'
  showAdvancedFilters = true,
  showQuickActions = true,
  availableUsers = [],
  filterSummary = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Parse dates for calendar components
  const parseDate = (dateString) => {
    if (!dateString) return undefined;
    try {
      const date = parseISO(dateString);
      return isValid(date) ? date : undefined;
    } catch {
      return undefined;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
    } catch {
      return '';
    }
  };

  // Handle date changes
  const handleDateChange = (field, date) => {
    const dateString = date ? format(date, 'yyyy-MM-dd') : '';
    onFiltersChange({ [field]: dateString });
  };

  // Handle predefined date range selection
  const handlePredefinedRange = (range) => {
    // This would typically call a function from useUnifiedFilters
    // For now, we'll emit the range selection
    if (onFiltersChange.setPredefinedRange) {
      onFiltersChange.setPredefinedRange(range);
    }
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== null && value !== undefined && value !== ''
  ).length;

  // Render date picker
  const renderDatePicker = (label, value, onChange, isOpen, setIsOpen) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(parseDate(value) || new Date(), 'MMM dd, yyyy') : 'Select date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parseDate(value)}
            onSelect={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            disabled={(date) => date > new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  // Render quick date range buttons
  const renderQuickRanges = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Quick Ranges</Label>
      <div className="grid grid-cols-2 gap-2">
        {DATE_RANGE_OPTIONS.slice(0, 8).map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            onClick={() => handlePredefinedRange(option.value)}
            className="text-xs h-8"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );

  // Render user filter
  const renderUserFilter = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">User Filter</Label>
      <Select
        value={filters.user_id || ''}
        onValueChange={(value) => onFiltersChange({ user_id: value || '' })}
      >
        <SelectTrigger>
          <SelectValue placeholder="All users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All users</SelectItem>
          {availableUsers.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              <div className="flex items-center gap-2">
                {user.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{user.name}</span>
                <span className="text-xs text-gray-500">({user.email})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Render active filters summary
  const renderActiveFilters = () => {
    if (activeFilterCount === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {filters.start_date && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            From: {format(parseDate(filters.start_date), 'MMM dd')}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onFiltersChange({ start_date: '' })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {filters.end_date && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            To: {format(parseDate(filters.end_date), 'MMM dd')}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onFiltersChange({ end_date: '' })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {filters.user_id && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            User: {availableUsers.find(u => u.id.toString() === filters.user_id)?.name || filters.user_id}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onFiltersChange({ user_id: '' })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>
    );
  };

  // Render action buttons
  const renderActionButtons = () => (
    <div className="flex items-center gap-2">
      {hasUnsavedChanges && onApply && (
        <Button 
          onClick={onApply}
          disabled={isApplying}
          size="sm"
          className="relative"
        >
          {isApplying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <span className={isApplying ? 'opacity-0' : ''}>
            Apply Filters
          </span>
        </Button>
      )}
      
      {activeFilterCount > 0 && onReset && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
      
      {showQuickActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onExport && (
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Filters
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-4 p-3 bg-gray-50 rounded-lg', className)}>
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {renderActiveFilters()}
        </div>
        
        {renderActionButtons()}
        
        {isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderDatePicker(
                'Start Date', 
                filters.start_date, 
                (date) => handleDateChange('start_date', date),
                startDateOpen,
                setStartDateOpen
              )}
              
              {renderDatePicker(
                'End Date', 
                filters.end_date, 
                (date) => handleDateChange('end_date', date),
                endDateOpen,
                setEndDateOpen
              )}
              
              {availableUsers.length > 0 && renderUserFilter()}
            </div>
            
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t">
                {renderQuickRanges()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={cn('w-80 p-4 bg-white border-r space-y-6', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="outline">{activeFilterCount} active</Badge>
          )}
        </div>
        
        {renderActiveFilters()}
        
        <div className="space-y-4">
          {renderDatePicker(
            'Start Date', 
            filters.start_date, 
            (date) => handleDateChange('start_date', date),
            startDateOpen,
            setStartDateOpen
          )}
          
          {renderDatePicker(
            'End Date', 
            filters.end_date, 
            (date) => handleDateChange('end_date', date),
            endDateOpen,
            setEndDateOpen
          )}
          
          {availableUsers.length > 0 && renderUserFilter()}
          
          {showAdvancedFilters && renderQuickRanges()}
        </div>
        
        <div className="pt-4 border-t">
          {renderActionButtons()}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('p-4 bg-white border rounded-lg space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          <h3 className="font-semibold">Analytics Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="outline">{activeFilterCount} active</Badge>
          )}
        </div>
        
        {renderActionButtons()}
      </div>
      
      {renderActiveFilters()}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderDatePicker(
          'Start Date', 
          filters.start_date, 
          (date) => handleDateChange('start_date', date),
          startDateOpen,
          setStartDateOpen
        )}
        
        {renderDatePicker(
          'End Date', 
          filters.end_date, 
          (date) => handleDateChange('end_date', date),
          endDateOpen,
          setEndDateOpen
        )}
        
        {availableUsers.length > 0 && renderUserFilter()}
      </div>
      
      {showAdvancedFilters && (
        <div className="pt-4 border-t">
          {renderQuickRanges()}
        </div>
      )}
      
      {filterSummary && (
        <div className="text-sm text-gray-500 pt-2 border-t">
          {filterSummary}
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilterPanel;