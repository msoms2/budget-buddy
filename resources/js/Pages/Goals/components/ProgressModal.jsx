import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast.js';
import { Loader2Icon } from 'lucide-react';

export default function ProgressModal({ isOpen, onClose, goal, onSuccessfulSubmit }) {
  const { toast } = useToast();
  const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
    amount: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    post(route('goals.update-progress', goal.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Progress has been added successfully.",
          variant: "success",
        });
        reset();
        onClose();
        if (onSuccessfulSubmit) {
          onSuccessfulSubmit();
        }
      },
      onError: (errors) => {
        toast({
          title: "Error",
          description: "Failed to add progress. Please check the form and try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Progress</DialogTitle>
          <DialogDescription>
            Record your contribution towards {goal.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={data.amount}
              onChange={e => setData('amount', e.target.value)}
              placeholder="Enter amount"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <Textarea
              id="notes"
              value={data.notes}
              onChange={e => setData('notes', e.target.value)}
              placeholder="Add any notes about this contribution"
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}