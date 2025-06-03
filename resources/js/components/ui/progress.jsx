import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, indicatorClassName, value, ...props }, ref) => {
  // Ensure the value is between 0 and 100
  const normalizedValue = Math.min(Math.max(0, value || 0), 100)

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full bg-blue-600 transition-all", indicatorClassName)}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
})

Progress.displayName = "Progress"

export { Progress }