import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, ExternalLink } from 'lucide-react';
import { detectExtensionConflicts } from '@/utils/extensionDetection';

export default function ExtensionWarningBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    // Check if user has already dismissed the warning
    const dismissed = localStorage.getItem('extension-warning-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Check for extension conflicts
    const detectedConflicts = detectExtensionConflicts();
    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('extension-warning-dismissed', Date.now().toString());
  };

  const handleLearnMore = () => {
    window.open('/docs/browser-extension-troubleshooting.md', '_blank');
  };

  if (!isVisible || isDismissed || conflicts.length === 0) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1 pr-4">
          <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
            Browser Extension Detected
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Extensions may interfere with export functionality. If you experience issues, try using incognito mode or temporarily disable extensions.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLearnMore}
            className="border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/40"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Learn More
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
