// Utility functions for financial calculations

/**
 * Calculates the effective amount for a transaction that impacts the user's balance.
 * - For normal transactions, returns the full amount.
 * - For shared transactions, calculates the user's portion properly.
 *
 * @param {Object} transaction - The transaction object
 * @returns {number} The effective amount
 */
export const getEffectiveAmount = (transaction) => {
  if (!transaction || !transaction.amount) return 0;

  // Caso Prioritario: Porcentaje explícito
  if (transaction.isShared && transaction.myPercentage !== undefined && transaction.myPercentage !== null) {
      // El total (transaction.amount) * porcentaje / 100
      return Math.round((transaction.amount * transaction.myPercentage) / 100);
  }

  // Caso 1: Estructura Nueva (Explícita)
  if (transaction.isShared && transaction.myShare !== undefined && transaction.myShare !== null) {
      return transaction.myShare;
  }

  // Caso 2: Estructura Calculada (Total - Parte del otro)
  if (transaction.isShared && transaction.otherShare) {
      return Math.max(0, transaction.amount - transaction.otherShare);
  }

  // Caso 3: Gasto Individual o Fallback
  return transaction.amount;
};

// Formateador estándar para toda la app (sin decimales para ARS)
export const formatMoney = (amount) => {
  if (amount === undefined || amount === null) return '$0';
  return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0, 
  }).format(amount);
};