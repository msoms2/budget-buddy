import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckIcon, ChevronRightIcon, ArrowRightIcon } from "lucide-react";
import { format, isValid, isBefore, isAfter, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function DateRangeSelector({ 
    startDate,
    endDate,
    onDateChange,
    className 
}) {
    // Safe initialization of dates with null fallback
    const [dates, setDates] = useState({
        from: startDate ? new Date(startDate) : null,
        to: endDate ? new Date(endDate) : null
    });

    // Handle date changes safely
    const handleDateChange = (newDates) => {
        // Make sure we're not passing undefined to the parent component
        if (newDates) {
            setDates(newDates);
            if (newDates.from && newDates.to && onDateChange) {
                onDateChange(newDates);
            }
        }
    };

    // Handle start date selection
    const handleStartDateSelect = (date) => {
        const newDates = { ...dates, from: date };
        
        // If end date exists but is before the new start date, clear it
        if (newDates.to && isValid(newDates.to) && isBefore(newDates.to, date)) {
            newDates.to = null;
        }
        
        setDates(newDates);
    };

    // Handle end date selection
    const handleEndDateSelect = (date) => {
        const newDates = { ...dates, to: date };
        
        // If start date exists but is after the new end date, clear it
        if (newDates.from && isValid(newDates.from) && isAfter(newDates.from, date)) {
            newDates.from = null;
        }
        
        setDates(newDates);
    };

    const presets = [
        {
            name: 'Today',
            dates: {
                from: new Date(),
                to: new Date(),
            },
        },
        {
            name: 'Last 7 days',
            dates: {
                from: (() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 6);
                    return date;
                })(),
                to: new Date(),
            },
        },
        {
            name: 'Last 30 days',
            dates: {
                from: (() => {
                    const date = new Date();
                    date.setDate(date.getDate() - 29);
                    return date;
                })(),
                to: new Date(),
            },
        },
        {
            name: 'This month',
            dates: {
                from: (() => {
                    const date = new Date();
                    date.setDate(1);
                    return date;
                })(),
                to: new Date(),
            },
        },
        {
            name: 'Last month',
            dates: {
                from: (() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - 1);
                    date.setDate(1);
                    return date;
                })(),
                to: (() => {
                    const date = new Date();
                    date.setDate(0);
                    return date;
                })(),
            },
        },
        {
            name: 'This year',
            dates: {
                from: new Date(new Date().getFullYear(), 0, 1),
                to: new Date(),
            },
        },
    ];

    // Calculate the number of days in the selected range
    const getDayCount = () => {
        if (!dates?.from || !dates?.to) return null;
        if (!isValid(dates.from) || !isValid(dates.to)) return null;
        return Math.ceil((dates.to - dates.from) / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal h-auto py-3 border-dashed hover:border-blue-400 dark:hover:border-blue-500 transition-colors group",
                            !dates?.from && "text-muted-foreground"
                        )}
                    >
                        <div className="flex flex-col items-start gap-1 w-full">
                            <div className="flex items-center w-full">
                                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {!dates?.from ? "Select date range" : "Date range"}
                                </span>
                                {dates?.from && dates?.to && isValid(dates.from) && isValid(dates.to) && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {getDayCount()} {getDayCount() === 1 ? "day" : "days"}
                                    </Badge>
                                )}
                            </div>
                            
                            {dates?.from && dates?.to && isValid(dates.from) && isValid(dates.to) ? (
                                <p className="text-sm text-muted-foreground">
                                    {format(dates.from, "MMM d, yyyy")} 
                                    <ChevronRightIcon className="inline mx-1 h-3 w-3" /> 
                                    {format(dates.to, "MMM d, yyyy")}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Choose start and end dates
                                </p>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col border-b">
                        <div className="p-2 border-b border-border bg-muted/20">
                            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground mb-2">
                                Quick Select
                            </div>
                            <div className="space-y-1.5">
                                {presets.map((preset) => (
                                    <Button
                                        key={preset.name}
                                        variant="ghost"
                                        className="w-full justify-start text-sm font-normal hover:bg-muted/50"
                                        onClick={() => handleDateChange(preset.dates)}
                                    >
                                        {preset.name}
                                        {dates?.from &&
                                            dates?.to &&
                                            dates.from.toDateString() === preset.dates.from.toDateString() &&
                                            dates.to.toDateString() === preset.dates.to.toDateString() && (
                                                <CheckIcon className="ml-auto h-4 w-4 text-green-500" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-950">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
                                    <Calendar
                                        mode="single"
                                        selected={dates?.from}
                                        onSelect={handleStartDateSelect}
                                        initialFocus
                                        defaultMonth={dates?.from || new Date()}
                                        disabled={(date) => date > new Date()}
                                        className="rounded border-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">End Date</Label>
                                    <Calendar
                                        mode="single"
                                        selected={dates?.to}
                                        onSelect={handleEndDateSelect}
                                        defaultMonth={dates?.to || (dates?.from ? addMonths(dates.from, 1) : new Date())}
                                        disabled={(date) => 
                                            date > new Date() || 
                                            (dates?.from && isBefore(date, dates.from))
                                        }
                                        className="rounded border-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {dates?.from && dates?.to && (
                        <div className="flex items-center justify-between p-3 border-t">
                            <div className="text-sm text-muted-foreground flex items-center">
                                <span className="font-medium">{getDayCount()}</span> {getDayCount() === 1 ? "day" : "days"} selected
                                <span className="mx-2 text-muted-foreground/50">|</span>
                                <span className="text-xs font-medium">
                                    {format(dates.from, "MMM d")} <ArrowRightIcon className="inline mx-1 h-3 w-3" /> {format(dates.to, "MMM d, yyyy")}
                                </span>
                            </div>
                            <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    if (dates?.from && dates?.to) {
                                        handleDateChange(dates);
                                    }
                                }}
                            >
                                Apply
                            </Button>
                        </div>
                    )}
                    
                    {(!dates?.from || !dates?.to) && (
                        <div className="flex items-center justify-between p-3 border-t">
                            <div className="text-sm text-muted-foreground">
                                {!dates?.from && !dates?.to 
                                    ? "Select both start and end dates" 
                                    : !dates?.from 
                                        ? "Select a start date" 
                                        : "Select an end date"}
                            </div>
                            <Button 
                                size="sm" 
                                disabled={!dates?.from || !dates?.to}
                                variant="outline"
                            >
                                Apply
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
