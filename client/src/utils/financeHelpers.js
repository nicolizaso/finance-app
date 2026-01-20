// Utility functions for financial calculations

/**
 * Calculates the effective amount for a transaction that impacts the user's balance.
 * - For normal transactions, returns the full amount.
 * - For shared transactions, returns the user's share (myShare).
 *
 * Handles both legacy data (where amount = share) and new data (where amount = total).
 * Relying on 'myShare' being present for shared transactions.
 *
 * @param {Object} transaction - The transaction object
 * @returns {number} The effective amount in centavos
 */
export const getEffectiveAmount = (transaction) => {
    // If it's a shared transaction:
    // 1. If 'myShare' is defined (even if 0), it's a NEW transaction structure where amount=Total. Use myShare.
    // 2. If 'myShare' is undefined/null, it's a LEGACY transaction where amount=Share. Use amount.
    if (transaction.isShared && transaction.myShare !== undefined && transaction.myShare !== null) {
        return transaction.myShare;
    }
    return transaction.amount;
};
