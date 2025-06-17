import React from "react";
import { Button } from "@/components/ui/button";
import { useTransactionSheet } from "@/hooks/use-transaction-sheet";

export function AddTransactionButton({
  children,
  transactionType,
  categories,
  initialCategory = null,
  sourcePage = null,
  onSuccess = null,
  variant = "default",
  className = "",
  ...props
}) {
  const { sheet } = useTransactionSheet();

  function handleClick() {
    sheet.show({
      type: transactionType,
      categories,
      initialCategory,
      sourcePage,
      onSuccess
    });
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children || "Add Transaction"}
    </Button>
  );
}
