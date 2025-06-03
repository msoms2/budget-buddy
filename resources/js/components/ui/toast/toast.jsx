import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const Toast = React.forwardRef(({ className, title, description, action, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-border p-4 pr-6 shadow-md",
        "data-[type=success]:bg-emerald-50 data-[type=success]:text-emerald-700 dark:data-[type=success]:bg-emerald-950 dark:data-[type=success]:text-emerald-300",
        "data-[type=error]:bg-red-50 data-[type=error]:text-red-700 dark:data-[type=error]:bg-red-950 dark:data-[type=error]:text-red-300",
        "data-[type=info]:bg-sky-50 data-[type=info]:text-sky-700 dark:data-[type=info]:bg-sky-950 dark:data-[type=info]:text-sky-300",
        "data-[type=warning]:bg-amber-50 data-[type=warning]:text-amber-700 dark:data-[type=warning]:bg-amber-950 dark:data-[type=warning]:text-amber-300",
        className
      )}
      {...props}
    >
      <div className="grid gap-1">
        {title && <p className="text-sm font-medium">{title}</p>}
        {description && (
          <p className="text-sm opacity-90">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
});

Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));

ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
));

ToastClose.displayName = "ToastClose";

export { Toast, ToastAction, ToastClose };