import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  MoreVertical,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";

/**
 * ActionMenu Component
 * 
 * Dropdown action menu for table rows and other components with:
 * - Multiple action types (button, link, separator, submenu)
 * - Icon support
 * - Disabled states
 * - Confirmation dialogs
 * - Keyboard navigation
 * - Custom styling variants
 * 
 * @param {Object} props
 * @param {Array} props.actions - Array of action definitions
 * @param {React.ReactNode} props.trigger - Custom trigger element
 * @param {string} props.triggerVariant - Button variant for default trigger
 * @param {string} props.triggerSize - Button size for default trigger
 * @param {string} props.orientation - 'horizontal' or 'vertical' for default trigger
 * @param {string} props.align - Dropdown alignment
 * @param {number} props.sideOffset - Dropdown side offset
 * @param {boolean} props.disabled - Disable the entire menu
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onActionClick - Action click handler
 */
export default function ActionMenu({
  actions = [],
  trigger = null,
  triggerVariant = "ghost",
  triggerSize = "sm",
  orientation = "horizontal",
  align = "end",
  sideOffset = 4,
  disabled = false,
  className = "",
  onActionClick
}) {
  const [open, setOpen] = useState(false);

  // Handle action click
  const handleActionClick = (action, event) => {
    if (action.disabled) {
      event.preventDefault();
      return;
    }

    // Close menu
    setOpen(false);

    // Handle confirmation
    if (action.confirmMessage) {
      if (!window.confirm(action.confirmMessage)) {
        return;
      }
    }

    // Call action handler
    if (action.onClick) {
      action.onClick(event);
    }

    // Call global action handler
    if (onActionClick) {
      onActionClick(action, event);
    }
  };

  // Default trigger
  const defaultTrigger = (
    <Button
      variant={triggerVariant}
      size={triggerSize}
      className={cn(
        "h-8 w-8 p-0",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      disabled={disabled}
      aria-label="Open actions menu"
    >
      {orientation === "horizontal" ? (
        <MoreHorizontal className="h-4 w-4" />
      ) : (
        <MoreVertical className="h-4 w-4" />
      )}
    </Button>
  );

  // Render action item
  const renderActionItem = (action, index) => {
    // Separator
    if (action.type === 'separator') {
      return <DropdownMenuSeparator key={index} />;
    }

    // Label/header
    if (action.type === 'label') {
      return (
        <DropdownMenuLabel key={index} className={action.className}>
          {action.label}
        </DropdownMenuLabel>
      );
    }

    // Submenu
    if (action.type === 'submenu') {
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger
            className={cn(
              "flex items-center gap-2",
              action.disabled && "opacity-50 cursor-not-allowed",
              action.className
            )}
            disabled={action.disabled}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {action.children?.map((subAction, subIndex) => 
              renderActionItem(subAction, `${index}-${subIndex}`)
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    // Group
    if (action.type === 'group') {
      return (
        <DropdownMenuGroup key={index}>
          {action.children?.map((groupAction, groupIndex) => 
            renderActionItem(groupAction, `${index}-${groupIndex}`)
          )}
        </DropdownMenuGroup>
      );
    }

    // Regular action item
    const itemContent = (
      <div className="flex items-center gap-2 w-full">
        {action.icon && <action.icon className="h-4 w-4" />}
        <span className="flex-1">{action.label}</span>
        {action.shortcut && (
          <span className="text-xs text-muted-foreground">
            {action.shortcut}
          </span>
        )}
        {action.href && !action.internalLink && (
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    );

    const itemProps = {
      key: index,
      className: cn(
        "cursor-pointer",
        action.variant === 'destructive' && "text-destructive focus:text-destructive",
        action.disabled && "opacity-50 cursor-not-allowed",
        action.className
      ),
      disabled: action.disabled,
      onClick: (event) => handleActionClick(action, event)
    };

    // External link
    if (action.href && !action.internalLink) {
      return (
        <DropdownMenuItem key={index} asChild>
          <a
            href={action.href}
            target={action.target || "_blank"}
            rel={action.rel || "noopener noreferrer"}
            className={itemProps.className}
            onClick={itemProps.onClick}
          >
            {itemContent}
          </a>
        </DropdownMenuItem>
      );
    }

    // Internal link (Inertia)
    if (action.href && action.internalLink) {
      return (
        <DropdownMenuItem key={index} asChild>
          <Link
            href={action.href}
            className={itemProps.className}
            onClick={itemProps.onClick}
          >
            {itemContent}
          </Link>
        </DropdownMenuItem>
      );
    }

    // Button action
    return (
      <DropdownMenuItem {...itemProps}>
        {itemContent}
      </DropdownMenuItem>
    );
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className={className}>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className="w-56"
      >
        {actions.map((action, index) => renderActionItem(action, index))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Helper function to create action definitions
 */
export const createAction = ({
  type = 'item',
  label,
  icon = null,
  onClick = null,
  href = null,
  internalLink = false,
  target = null,
  rel = null,
  disabled = false,
  variant = 'default',
  confirmMessage = null,
  shortcut = null,
  className = "",
  children = []
}) => ({
  type,
  label,
  icon,
  onClick,
  href,
  internalLink,
  target,
  rel,
  disabled,
  variant,
  confirmMessage,
  shortcut,
  className,
  children
});

/**
 * Pre-built action creators for common use cases
 */
export const ActionCreators = {
  // View action
  view: (href, label = "View") => createAction({
    label,
    icon: null, // You can import Eye icon if needed
    href,
    internalLink: true
  }),

  // Edit action
  edit: (href, label = "Edit") => createAction({
    label,
    icon: null, // You can import Edit icon if needed
    href,
    internalLink: true
  }),

  // Delete action
  delete: (onClick, label = "Delete") => createAction({
    label,
    icon: null, // You can import Trash icon if needed
    onClick,
    variant: 'destructive',
    confirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.'
  }),

  // Separator
  separator: () => createAction({ type: 'separator' }),

  // Label
  label: (text) => createAction({ type: 'label', label: text }),

  // Submenu
  submenu: (label, children, icon = null) => createAction({
    type: 'submenu',
    label,
    icon,
    children
  }),

  // Group
  group: (children) => createAction({
    type: 'group',
    children
  })
};