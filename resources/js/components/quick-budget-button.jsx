import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function QuickBudgetButton({
  children = "New Budget",
  variant = "default",
  className = "",
  size = "default",
  onClick,
  ...props
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-1 ${className}`}
      onClick={onClick}
      {...props}
    >
      <PlusIcon className="h-4 w-4" />
      {children}
    </Button>
  );
}