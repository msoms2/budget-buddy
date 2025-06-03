import * as React from "react";
import { cn } from "@/lib/utils";

const ToastViewport = React.forwardRef(({ className, position = "bottom-right", ...props }, ref) => {
  // Define position classes
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-center": "top-0 left-1/2 transform -translate-x-1/2",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-center": "bottom-0 left-1/2 transform -translate-x-1/2",
    "bottom-left": "bottom-0 left-0"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-[100] flex max-h-screen flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]",
        positionClasses[position],
        className
      )}
      {...props}
    />
  );
});

ToastViewport.displayName = "ToastViewport";

export { ToastViewport };