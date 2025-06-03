import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function RepaymentStrategyComparison({ debts, monthlyPayment }) {
  const { formatCurrency } = useCurrency();

  const calculatePayoffTime = (strategy) => {
    let remainingDebts = debts.map(debt => ({
      ...debt,
      balance: parseFloat(debt.balance),
      rate: parseFloat(debt.interest_rate),
      minPayment: parseFloat(debt.minimum_payment)
    }));

    if (strategy === 'snowball') {
      remainingDebts.sort((a, b) => a.balance - b.balance);
    } else {
      remainingDebts.sort((a, b) => b.rate - a.rate);
    }

    let months = 0;
    let totalInterestPaid = 0;
    let isDebtRemaining = true;

    while (isDebtRemaining && months < 360) { // Cap at 30 years
      months++;
      let remainingPayment = monthlyPayment;

      // Pay minimum on all debts
      remainingDebts = remainingDebts.map(debt => {
        const interest = (debt.balance * (debt.rate / 100)) / 12;
        totalInterestPaid += interest;
        const payment = Math.min(debt.minPayment, debt.balance + interest);
        remainingPayment -= payment;
        
        return {
          ...debt,
          balance: Math.max(0, debt.balance + interest - payment)
        };
      });

      // Apply remaining payment to priority debt
      if (remainingPayment > 0 && remainingDebts[0].balance > 0) {
        remainingDebts[0].balance = Math.max(0, 
          remainingDebts[0].balance - remainingPayment
        );
      }

      // Check if all debts are paid
      isDebtRemaining = remainingDebts.some(debt => debt.balance > 0);

      // Resort the debts based on strategy
      if (strategy === 'snowball') {
        remainingDebts.sort((a, b) => a.balance - b.balance);
      } else {
        remainingDebts.sort((a, b) => b.rate - a.rate);
      }
    }

    return {
      months,
      totalInterestPaid: Math.round(totalInterestPaid)
    };
  };

  const snowball = calculatePayoffTime('snowball');
  const avalanche = calculatePayoffTime('avalanche');

  const formatTime = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return years > 0 
      ? `${years} years${remainingMonths > 0 ? ` ${remainingMonths} months` : ''}`
      : `${remainingMonths} months`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Repayment Strategy Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Time to Pay Off</TableHead>
              <TableHead className="text-right">Total Interest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Debt Snowball</TableCell>
              <TableCell>Pay off smallest debts first</TableCell>
              <TableCell className="text-right">{formatTime(snowball.months)}</TableCell>
              <TableCell className="text-right">{formatCurrency(snowball.totalInterestPaid)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Debt Avalanche</TableCell>
              <TableCell>Pay off highest interest debts first</TableCell>
              <TableCell className="text-right">{formatTime(avalanche.months)}</TableCell>
              <TableCell className="text-right">{formatCurrency(avalanche.totalInterestPaid)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-4 text-sm text-muted-foreground">
          {avalanche.totalInterestPaid < snowball.totalInterestPaid ? (
            <p>
              The Debt Avalanche method will save you approximately{' '}
              {formatCurrency(snowball.totalInterestPaid - avalanche.totalInterestPaid)}{' '}
              in interest payments.
            </p>
          ) : (
            <p>
              Both methods will cost the same in interest, but the Snowball method may provide better motivation through quick wins.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}