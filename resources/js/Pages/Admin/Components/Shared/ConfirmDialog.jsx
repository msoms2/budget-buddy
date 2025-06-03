import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Trash2, 
  AlertCircle, 
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ConfirmDialog Component
 * 
 * Confirmation modal for destructive actions with:
 * - Multiple confirmation types (warning, danger, info)
 * - Text confirmation input
 * - Custom action buttons
 * - Loading states
 * - Accessibility features
 * - Auto-focus management
 * 
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Open state change handler
 * @param {React.ReactNode} props.trigger - Trigger element
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {string} props.type - Dialog type ('warning', 'danger', 'info', 'success')
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {Function} props.onCancel - Cancel action handler
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disable confirm button
 * @param {string} props.confirmationText - Required text to type for confirmation
 * @param {boolean} props.destructive - Whether this is a destructive action
 * @param {React.ReactNode} props.children - Custom content
 * @param {string} props.className - Additional CSS classes
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  type = 'warning',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  disabled = false,
  confirmationText = null,
  destructive = false,
  children,
  className = ""
}) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(open || false);

  // Update internal state when prop changes
  useEffect(() => {
    setIsOpen(open || false);
  }, [open]);

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // Handle open change
  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange && onOpenChange(newOpen);
  };

  // Handle confirm
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    handleOpenChange(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Check if confirm is disabled
  const isConfirmDisabled = disabled || loading || 
    (confirmationText && inputValue !== confirmationText);

  // Type configurations
  const typeConfigs = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
      confirmVariant: "default"
    },
    danger: {
      icon: destructive ? Trash2 : XCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-900/20",
      confirmVariant: "destructive"
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      confirmVariant: "default"
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/20",
      confirmVariant: "default"
    }
  };

  const config = typeConfigs[type] || typeConfigs.warning;
  const IconComponent = config.icon;

  const dialogContent = (
    <AlertDialogContent className={cn("sm:max-w-[425px]", className)}>
      <AlertDialogHeader>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            config.iconBg
          )}>
            <IconComponent className={cn("h-5 w-5", config.iconColor)} />
          </div>
          
          <div className="flex-1 space-y-2">
            <AlertDialogTitle className="text-left">
              {title}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-left">
                {description}
              </AlertDialogDescription>
            )}
          </div>
        </div>
      </AlertDialogHeader>

      {/* Custom content or confirmation input */}
      {children || (confirmationText && (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation-input">
              Type <span className="font-mono font-semibold">{confirmationText}</span> to confirm:
            </Label>
            <Input
              id="confirmation-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmationText}
              className={cn(
                "font-mono",
                inputValue === confirmationText && "border-green-500 focus:border-green-500"
              )}
              autoComplete="off"
              autoFocus
            />
          </div>
          {inputValue && inputValue !== confirmationText && (
            <p className="text-sm text-muted-foreground">
              Please type the exact text to confirm this action.
            </p>
          )}
        </div>
      ))}

      <AlertDialogFooter className="gap-2 sm:gap-2">
        <AlertDialogCancel
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelText}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          variant={config.confirmVariant}
          className={cn(
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </div>
          ) : (
            confirmText
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  // If trigger is provided, use it
  if (trigger) {
    return (
      <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
        {dialogContent}
      </AlertDialog>
    );
  }

  // Controlled dialog
  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </AlertDialog>
  );
}

/**
 * Helper hook for managing confirm dialog state
 */
export const useConfirmDialog = (initialConfig = {}) => {
  const [config, setConfig] = useState({
    open: false,
    title: '',
    description: '',
    type: 'warning',
    onConfirm: null,
    loading: false,
    ...initialConfig
  });

  const openDialog = (newConfig) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      open: true
    }));
  };

  const closeDialog = () => {
    setConfig(prev => ({
      ...prev,
      open: false,
      loading: false
    }));
  };

  const setLoading = (loading) => {
    setConfig(prev => ({
      ...prev,
      loading
    }));
  };

  return {
    config,
    openDialog,
    closeDialog,
    setLoading,
    isOpen: config.open
  };
};

/**
 * Pre-built dialog creators for common use cases
 */
export const DialogCreators = {
  // Delete confirmation
  delete: (itemName, onConfirm) => ({
    type: 'danger',
    title: 'Delete Item',
    description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    confirmText: 'Delete',
    destructive: true,
    onConfirm
  }),

  // Delete with confirmation text
  deleteWithConfirmation: (itemName, onConfirm) => ({
    type: 'danger',
    title: 'Delete Item',
    description: `This will permanently delete "${itemName}" and all associated data.`,
    confirmText: 'Delete',
    confirmationText: 'DELETE',
    destructive: true,
    onConfirm
  }),

  // Bulk delete
  bulkDelete: (count, onConfirm) => ({
    type: 'danger',
    title: 'Delete Multiple Items',
    description: `Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}? This action cannot be undone.`,
    confirmText: 'Delete All',
    destructive: true,
    onConfirm
  }),

  // Save changes
  saveChanges: (onConfirm) => ({
    type: 'warning',
    title: 'Save Changes',
    description: 'Do you want to save your changes?',
    confirmText: 'Save',
    onConfirm
  }),

  // Discard changes
  discardChanges: (onConfirm) => ({
    type: 'warning',
    title: 'Discard Changes',
    description: 'Are you sure you want to discard your changes? This action cannot be undone.',
    confirmText: 'Discard',
    onConfirm
  }),

  // Leave page
  leavePage: (onConfirm) => ({
    type: 'warning',
    title: 'Leave Page',
    description: 'You have unsaved changes. Are you sure you want to leave this page?',
    confirmText: 'Leave',
    onConfirm
  })
};