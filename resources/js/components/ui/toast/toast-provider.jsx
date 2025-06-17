import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast.js';
import { Toast, ToastAction, ToastClose } from './toast';
import { ToastViewport } from './toast-viewport';

export function ToastProvider() {
  const { toasts, remove } = useToast();

  return (
    <ToastViewport>
      {toasts.map(({ id, title, description, action, status, ...props }) => {
        return (
          <Toast
            key={id}
            data-type={status}
            {...props}
            title={title}
            description={description}
            action={
              action ? (
                <ToastAction
                  altText={typeof action === 'string' ? action : 'Action'}
                  onClick={() => {
                    if (typeof action === 'function') {
                      action();
                    }
                    remove(id);
                  }}
                >
                  {typeof action === 'string' ? action : 'Action'}
                </ToastAction>
              ) : null
            }
          >
            <ToastClose onClick={() => remove(id)} />
          </Toast>
        );
      })}
    </ToastViewport>
  );
}