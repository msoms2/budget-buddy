import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function InterestCalculator({ debt }) {
  const [paymentAmount, setPaymentAmount] = useState(debt.minimum_payment);
  const [projectionYears, setProjectionYears] = useState(5);
  const { formatCurrency } = useCurrency();
  
  const calculateProjection = () => {
    const monthlyRate = debt.interest_rate / 100 / 12;
    const totalMonths = projectionYears * 12;
    let currentBalance = debt.balance;
    const projection = [];
    let totalInterest = 0;
    
    for (let month = 1; month <= totalMonths; month++) {
      const monthlyInterest = currentBalance * monthlyRate;
      totalInterest += monthlyInterest;
      
      const principalPayment = Math.min(
        paymentAmount - monthlyInterest,
        currentBalance
      );
      
      currentBalance = Math.max(0, currentBalance - principalPayment);
      
      if (month % 12 === 0) {
        projection.push({
          year: month / 12,
          remainingBalance: currentBalance,
          interestPaid: totalInterest,
        });
      }
      
      if (currentBalance === 0) break;
    }
    
    return projection;
  };

  const projection = calculateProjection();
  const totalInterest = projection[projection.length - 1]?.interestPaid || 0;
  const finalBalance = projection[projection.length - 1]?.remainingBalance || 0;
  const monthsToPayoff = calculateMonthsToPayoff();

  function calculateMonthsToPayoff() {
    const monthlyRate = debt.interest_rate / 100 / 12;
    let balance = debt.balance;
    let months = 0;

    while (balance > 0 && months < 360) { // Cap at 30 years
      const interest = balance * monthlyRate;
      const principal = paymentAmount - interest;
      
      if (principal <= 0) return Infinity; // Payment too small to make progress
      
      balance = Math.max(0, balance - principal);
      months++;
    }

    return months;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="payment">Monthly Payment</Label>
            <Input
              id="payment"
              type="number"
              min={debt.minimum_payment}
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Minimum payment: {formatCurrency(debt.minimum_payment)}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="years">Projection Years</Label>
            <Input
              id="years"
              type="number"
              min="1"
              max="30"
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
            />
          </div>

          <div className="rounded-md bg-muted p-4">
            <div className="grid gap-2">
              <p className="font-medium">Summary</p>
              <div className="text-sm">
                <p>Time to pay off: {monthsToPayoff === Infinity 
                  ? "Never (payment too low)" 
                  : `${Math.floor(monthsToPayoff / 12)} years ${monthsToPayoff % 12} months`}
                </p>
                <p>Total interest: {formatCurrency(totalInterest)}</p>
                <p>Final balance: {formatCurrency(finalBalance)}</p>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Remaining Balance</TableHead>
                <TableHead className="text-right">Interest Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projection.map((row) => (
                <TableRow key={row.year}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.remainingBalance)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.interestPaid)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}