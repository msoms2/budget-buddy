import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import DeleteCreditorModal from '@/components/Creditors/DeleteCreditorModal';
import { 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp, 
  AlertTriangle,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function DebtList({ debts, onEditDebt }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState(null);
  const { formatCurrency } = useCurrency();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateMonthlyInterest = (balance, rate) => {
    const monthlyRate = parseFloat(rate || 0) / 100 / 12;
    const debtBalance = parseFloat(balance || 0);
    return debtBalance * monthlyRate;
  };

  const getInterestRateBadge = (rate) => {
    const numRate = parseFloat(rate || 0);
    if (numRate >= 20) {
      return <Badge variant="destructive" className="text-xs">{numRate}%</Badge>;
    } else if (numRate >= 15) {
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">{numRate}%</Badge>;
    } else if (numRate >= 10) {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">{numRate}%</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">{numRate}%</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="text-xs">Active</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Paid</Badge>;
      case 'defaulted':
        return <Badge variant="destructive" className="text-xs">Defaulted</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  const handleEditClick = (debt) => {
    if (onEditDebt) {
      onEditDebt(debt);
    }
  };

  const handleDeleteClick = (debt) => {
    setDebtToDelete(debt);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDebtToDelete(null);
  };

  if (!debts || debts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="mx-auto h-8 w-8 mb-2" />
        <p>No debts to display</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Creditor</TableHead>
              <TableHead className="text-right font-semibold">Balance</TableHead>
              <TableHead className="text-center font-semibold">Interest Rate</TableHead>
              <TableHead className="text-right font-semibold">Monthly Interest</TableHead>
              <TableHead className="text-right font-semibold">Min Payment</TableHead>
              <TableHead className="text-center font-semibold">Due Date</TableHead>
              <TableHead className="text-center font-semibold">Status</TableHead>
              <TableHead className="text-center font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt) => {
              const balance = parseFloat(debt.amount_owed || debt.balance || 0);
              const monthlyInterest = calculateMonthlyInterest(balance, debt.interest_rate);
              const isHighInterest = parseFloat(debt.interest_rate || 0) >= 15;
              
              return (
                <TableRow key={debt.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {isHighInterest && (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold">{debt.name}</div>
                        {debt.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {debt.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(balance)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {getInterestRateBadge(debt.interest_rate)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-orange-600">
                        {formatCurrency(monthlyInterest)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        per month
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {formatCurrency(debt.minimum_payment || 0)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{formatDate(debt.due_date)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {getStatusBadge(debt.status)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Link href={route('creditors.show', debt.id)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(debt)}
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(debt)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCreditorModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        creditor={debtToDelete}
      />
    </>
  );
}