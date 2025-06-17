import React from "react";
import { cn } from "@/lib/utils";

const FileInput = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="file"
      className={cn(
        "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0",
        "file:text-sm file:font-semibold",
        "file:bg-primary file:text-primary-foreground",
        "hover:file:bg-primary/90",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

FileInput.displayName = "FileInput";

export { FileInput };
