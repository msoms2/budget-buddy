import React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AnalysisTypeSelector({ 
    value, 
    onChange,
    className,
    label = "Analysis Type",
    types = [
        { value: 'daily', label: 'Daily Analysis' },
        { value: 'weekly', label: 'Weekly Analysis' },
        { value: 'monthly', label: 'Monthly Analysis' },
        { value: 'yearly', label: 'Yearly Analysis' },
    ]
}) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{label}</SelectLabel>
                        {types.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

// Example usage:
/*
    <AnalysisTypeSelector
        value={analysisType}
        onChange={setAnalysisType}
        types={[
            { value: 'daily', label: 'Daily View' },
            { value: 'weekly', label: 'Weekly Summary' },
            { value: 'monthly', label: 'Monthly Overview' }
        ]}
    />
*/
