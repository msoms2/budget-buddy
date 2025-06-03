import React from 'react';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  CreditCard, 
  DollarSign, 
  Percent, 
  Calendar, 
  FileText,
  Save,
  ArrowLeft
} from 'lucide-react';

export default function CreditorForm({ creditor, mode = 'create' }) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: creditor?.name || '',
    description: creditor?.description || '',
    amount_owed: creditor?.amount_owed || creditor?.balance || '',
    interest_rate: creditor?.interest_rate || '',
    minimum_payment: creditor?.minimum_payment || '',
    due_date: creditor?.due_date || '',
    payment_frequency: creditor?.payment_frequency || 'monthly',
    contact_info: creditor?.contact_info || '',
    status: creditor?.status || 'active',
  });

  useEffect(() => {
    if (creditor) {
      reset({
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
    }
  }, [creditor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'create') {
      post(route('creditors.store'));
    } else {
      put(route('creditors.update', creditor.id));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Card>
        <CardFooter className="flex justify-between gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={processing}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Saving...' : (mode === 'create' ? 'Add Debt' : 'Update Debt')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}