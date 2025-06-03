import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, HelpCircle, CalendarIcon } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from 'axios';

export default function PaymentScheduleEdit({ auth, schedule, currencies, categories, paymentMethods, subcategories: initialSubcategories }) {
  const { data, setData, put, processing, errors } = useForm({
    name: schedule.name || '',
    description: schedule.description || '',
    amount: schedule.amount || '',
    due_date: schedule.due_date ? format(new Date(schedule.due_date), 'yyyy-MM-dd') : '',
    reminder_date: schedule.reminder_date ? format(new Date(schedule.reminder_date), 'yyyy-MM-dd') : '',
    category_id: schedule.category_id || '',
    subcategory_id: schedule.subcategory_id || '',
    payment_method_id: schedule.payment_method_id || '',
    currency_id: schedule.currency_id || (currencies.length > 0 ? currencies[0].id : ''),
    recipient: schedule.recipient || '',
    is_recurring: schedule.is_recurring || false,
    frequency: schedule.frequency || '',
    recurring_end_date: schedule.recurring_end_date ? format(new Date(schedule.recurring_end_date), 'yyyy-MM-dd') : '',
    auto_process: schedule.auto_process || false,
    type: schedule.type || 'expense'
  });

  const [subcategories, setSubcategories] = useState(initialSubcategories || []);
  const [categorySelected, setCategorySelected] = useState(!!schedule.category_id);

  const loadSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      setCategorySelected(false);
      return;
    }

    setCategorySelected(true);
    try {
      const response = await axios.get(route('transactions.schedules.subcategories', categoryId));
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setData('category_id', categoryId);
    setData('subcategory_id', '');
    loadSubcategories(categoryId);
  };

  const handleCheckboxChange = (field) => {
    setData(field, !data[field]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('transactions.schedules.update', schedule.id));
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Payment Schedule</h2>}
    >
      <Head title="Edit Payment Schedule" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Payment Schedule: {schedule.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Payment Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      placeholder="e.g., Internet Bill"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.amount}
                      onChange={e => setData('amount', e.target.value)}
                      placeholder="0.00"
                      className={errors.amount ? 'border-red-500' : ''}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency_id">Currency</Label>
                    <select
                      id="currency_id"
                      value={data.currency_id}
                      onChange={e => setData('currency_id', e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.code} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method_id">Payment Method</Label>
                    <select
                      id="payment_method_id"
                      value={data.payment_method_id}
                      onChange={e => setData('payment_method_id', e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background"
                    >
                      <option value="">Select Payment Method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">
                      Due Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={data.due_date}
                      onChange={e => setData('due_date', e.target.value)}
                      className={errors.due_date ? 'border-red-500' : ''}
                    />
                    {errors.due_date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.due_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reminder_date">Reminder Date</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Date to receive a reminder before the payment is due</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="reminder_date"
                      type="date"
                      value={data.reminder_date}
                      onChange={e => setData('reminder_date', e.target.value)}
                      className={errors.reminder_date ? 'border-red-500' : ''}
                    />
                    {errors.reminder_date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.reminder_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient/Payee</Label>
                    <Input
                      id="recipient"
                      value={data.recipient}
                      onChange={e => setData('recipient', e.target.value)}
                      placeholder="e.g., Internet Provider"
                      className={errors.recipient ? 'border-red-500' : ''}
                    />
                    {errors.recipient && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.recipient}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={data.type}
                      onChange={e => setData('type', e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                      id="category_id"
                      value={data.category_id}
                      onChange={handleCategoryChange}
                      className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {categorySelected && (
                    <div className="space-y-2">
                      <Label htmlFor="subcategory_id">Subcategory</Label>
                      <select
                        id="subcategory_id"
                        value={data.subcategory_id}
                        onChange={e => setData('subcategory_id', e.target.value)}
                        className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background"
                        disabled={subcategories.length === 0}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder="Add any additional details about this payment"
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Recurring Payment Settings */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_recurring"
                      checked={data.is_recurring}
                      onCheckedChange={() => handleCheckboxChange('is_recurring')}
                    />
                    <Label htmlFor="is_recurring">This is a recurring payment</Label>
                  </div>

                  {data.is_recurring && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">
                          Frequency <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="frequency"
                          value={data.frequency}
                          onChange={e => setData('frequency', e.target.value)}
                          className={`w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background ${errors.frequency ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select Frequency</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="biannually">Bi-annually</option>
                          <option value="annually">Annually</option>
                        </select>
                        {errors.frequency && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.frequency}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="recurring_end_date">End Date</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Leave empty for indefinite recurrence</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="recurring_end_date"
                          type="date"
                          value={data.recurring_end_date}
                          onChange={e => setData('recurring_end_date', e.target.value)}
                          className={errors.recurring_end_date ? 'border-red-500' : ''}
                        />
                        {errors.recurring_end_date && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.recurring_end_date}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="auto_process"
                            checked={data.auto_process}
                            onCheckedChange={() => handleCheckboxChange('auto_process')}
                          />
                          <div>
                            <Label htmlFor="auto_process">Automatically process this payment</Label>
                            <p className="text-sm text-gray-500">
                              When enabled, an expense will be automatically created on the due date
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Payment Schedule'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}