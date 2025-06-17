import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  Eye, 
  Pencil, 
  Trash2,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvestmentList({ investments, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();

  // Safety check for formatCurrency
  const safeFormatCurrency = (amount) => {
    try {
      if (typeof formatCurrency === 'function') {
        return formatCurrency(amount);
      }
      // Fallback formatting if formatCurrency is not available
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    } catch (err) {
      console.error('Currency formatting error:', err);
      return '0.00';
    }
  };
  if (investments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">No investments found.</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Investment</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Current Value</TableHead>
            <TableHead className="text-right">Initial Investment</TableHead>
            <TableHead className="text-right">Total Return</TableHead>
            <TableHead className="text-right">ROI</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => {
            const currentValue = investment.current_value || 0;
            const initialValue = investment.initial_value || 0;
            const totalReturn = currentValue - initialValue;
            const returnPercentage = initialValue > 0 ? ((totalReturn / initialValue) * 100) : 0;
            const isProfit = totalReturn >= 0;

            return (
              <TableRow key={investment.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{investment.name}</div>
                    {investment.symbol && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {investment.symbol}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Badge variant={investment.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {investment.category?.name || 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {safeFormatCurrency(currentValue)}
                </TableCell>
                <TableCell className="text-right">
                  {safeFormatCurrency(initialValue)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isProfit ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {safeFormatCurrency(totalReturn)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {returnPercentage.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(investment)} className="flex items-center cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Investment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(investment.id)} 
                        className="flex items-center cursor-pointer text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}