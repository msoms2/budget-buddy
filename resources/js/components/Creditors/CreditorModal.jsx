import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  CreditCard, 
  DollarSign, 
  Percent, 
  Calendar, 
  FileText,
  Save,
  Plus
} from 'lucide-react';

export default function CreditorModal({ isOpen, onClose, creditor = null }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    description: '',
    amount_owed: '',
    interest_rate: '',
    minimum_payment: '',
    due_date: '',
    payment_frequency: 'monthly',
    contact_info: '',
    status: 'active',
  });

  useEffect(() => {
    if (creditor) {
      setData({
        name: creditor.name || '',
        description: creditor.description || '',
        amount_owed: creditor.amount_owed || creditor.balance || '',
        interest_rate: creditor.interest_rate || '',
        minimum_payment: creditor.minimum_payment || '',
        due_date: creditor.due_date || '',
        payment_frequency: creditor.payment_frequency || 'monthly',
        contact_info: creditor.contact_info || '',
        status: creditor.status || 'active',
      });
    } else {
      reset();
    }
  }, [creditor, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (creditor) {
      put(route('creditors.update', creditor.id), {
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        }
      });
    } else {
      post(route('creditors.store'), {
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {creditor ? (
              <>
                <CreditCard className="h-5 w-5 text-blue-600" />
                Edit Debt
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-blue-600" />
                Add New Debt
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {creditor 
              ? "Update your debt details and track your payment progress."
              : "Add a new debt to start tracking your payment obligations."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Creditor Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Chase Bank, Capital One"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.name}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paid">Paid Off</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.status}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of this debt..."
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                rows={2}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.description}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount_owed" className="text-sm font-medium">
                  Current Balance *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount_owed"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={data.amount_owed}
                    onChange={e => setData('amount_owed', e.target.value)}
                    className={`pl-10 ${errors.amount_owed ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.amount_owed && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.amount_owed}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_rate" className="text-sm font-medium">
                  Interest Rate (%)
                </Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="15.99"
                    value={data.interest_rate}
                    onChange={e => setData('interest_rate', e.target.value)}
                    className={`pl-10 ${errors.interest_rate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.interest_rate && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.interest_rate}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_payment" className="text-sm font-medium">
                  Minimum Monthly Payment
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="minimum_payment"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50.00"
                    value={data.minimum_payment}
                    onChange={e => setData('minimum_payment', e.target.value)}
                    className={`pl-10 ${errors.minimum_payment ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.minimum_payment && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.minimum_payment}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_frequency" className="text-sm font-medium">
                  Payment Frequency
                </Label>
                <Select value={data.payment_frequency} onValueChange={(value) => setData('payment_frequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_frequency && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.payment_frequency}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-sm font-medium">
                  Next Due Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="due_date"
                    type="date"
                    value={data.due_date}
                    onChange={e => setData('due_date', e.target.value)}
                    className={`pl-10 ${errors.due_date ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.due_date && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.due_date}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info" className="text-sm font-medium">
                  Contact Information
                </Label>
                <Input
                  id="contact_info"
                  type="text"
                  placeholder="Phone, email, or website"
                  value={data.contact_info}
                  onChange={e => setData('contact_info', e.target.value)}
                  className={errors.contact_info ? 'border-red-500' : ''}
                />
                {errors.contact_info && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.contact_info}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={processing}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              {processing ? 'Saving...' : (creditor ? 'Update Debt' : 'Add Debt')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}