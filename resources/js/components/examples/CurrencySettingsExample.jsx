import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { useCurrencySettingsPopup } from '@/hooks/useCurrencySettingsPopup';

/**
 * Example component showing how to integrate the Currency Settings Popup
 * This can be used in any page where you want to provide currency management functionality
 */
export default function CurrencySettingsButton({ className, children, ...props }) {
    const { openPopup, popup } = useCurrencySettingsPopup();

    return (
        <>
            <Button
                onClick={openPopup}
                className={className}
                {...props}
            >
                <Settings2 className="h-4 w-4 mr-2" />
                {children || 'Currency Settings'}
            </Button>
            {popup}
        </>
    );
}

// Alternative usage example as a simple function component
export function CurrencySettingsExample() {
    const { openPopup, popup } = useCurrencySettingsPopup();

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Currency Management Example</h2>
            <p className="text-gray-600">Click the button below to open the currency settings popup:</p>
            
            <Button onClick={openPopup} variant="outline">
                <Settings2 className="h-4 w-4 mr-2" />
                Manage Currencies
            </Button>
            
            {/* The popup will be rendered when opened */}
            {popup}
        </div>
    );
}
