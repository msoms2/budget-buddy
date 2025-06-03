import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DeleteCreditorModal({ isOpen, onClose, creditor }) {
  const { delete: destroy, processing } = useForm();

  const handleDelete = () => {
    if (!creditor) return;
    
    destroy(route('creditors.destroy', creditor.id), {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!creditor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Debt
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the debt record for "{creditor.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Are you sure you want to delete this debt?</h4>
                <p className="text-sm text-red-600 mt-1">
                  This will remove all information about your debt with {creditor.name}, 
                  including the balance of ${creditor.amount_owed || creditor.balance || 0}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={processing}
            >
              {processing ? 'Deleting...' : 'Delete Debt'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}