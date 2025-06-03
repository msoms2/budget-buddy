import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { detectExtensionConflicts } from '@/utils/extensionDetection';

export default function ExtensionCompatibility() {
  const [conflicts, setConflicts] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkExtensions = () => {
    setIsChecking(true);
    setTimeout(() => {
      const detectedConflicts = detectExtensionConflicts();
      setConflicts(detectedConflicts);
      setLastChecked(new Date());
      setIsChecking(false);
    }, 500);
  };

  useEffect(() => {
    checkExtensions();
  }, []);

  const openExtensionsPage = () => {
    window.open('chrome://extensions/', '_blank');
  };

  const openTroubleshootingGuide = () => {
    window.open('/docs/browser-extension-troubleshooting.md', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Browser Extension Compatibility
        </CardTitle>
        <CardDescription>
          Check for browser extensions that might interfere with Budget Buddy functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkExtensions}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Extensions
          </Button>
        </div>

        {conflicts.length === 0 ? (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              No conflicting browser extensions detected. Your export functionality should work smoothly.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Potential extension conflicts detected:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
                <p className="text-sm mt-2">
                  These extensions may interfere with export functionality. If you experience issues, 
                  try disabling them or use incognito mode.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" onClick={openExtensionsPage} className="justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage Extensions
          </Button>
          <Button variant="outline" onClick={openTroubleshootingGuide} className="justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            Troubleshooting Guide
          </Button>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Quick Fix</h4>
          <p className="text-sm text-muted-foreground">
            If exports fail, try using <strong>incognito/private mode</strong> where extensions are disabled by default.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
