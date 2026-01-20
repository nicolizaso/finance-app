export const getEffectiveAmount = (transaction) => {
  if (!transaction || !transaction.amount) return 0;

  if (transaction.isShared && transaction.otherShare) {
    // If shared, effective amount is Total - Other's Share
    // We assume 'amount' is the Total Bill Amount
    return Math.max(0, transaction.amount - transaction.otherShare);
  }

  return transaction.amount;
};

// Helper for consistency if needed elsewhere
export const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return '$0';
  return '$' + Math.round(amount).toLocaleString('es-AR');
};
