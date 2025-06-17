import React, { useState } from 'react';
import PaymentScheduleSheet from '@/Pages/Transactions/Partials/PaymentScheduleSheet';

export function usePaymentScheduleSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [params, setParams] = useState({});

  const openSheet = (sheetParams = {}) => {
    setParams(sheetParams);
    setIsOpen(true);
  };

  const closeSheet = () => {
    setIsOpen(false);
    setParams({});
  };

  const paymentScheduleSheet = isOpen ? (
    <PaymentScheduleSheet
      isOpen={isOpen}
      onClose={closeSheet}
      {...params}
    />
  ) : null;

  return {
    openSheet,
    closeSheet,
    paymentScheduleSheet,
  };
}