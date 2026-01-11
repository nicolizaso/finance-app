
/**
 * Calculates credit card projection data.
 * @param {Array} transactions - List of credit expense transactions.
 * @param {Date} currentDate - The date to calculate projection relative to (default now).
 * @returns {Object} { totalDebt, nextMonthBill }
 */
const calculateCreditProjection = (transactions, currentDate = new Date()) => {
    let totalDebt = 0;
    let nextMonthBill = 0;
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11

    transactions.forEach(tx => {
        const purchaseDate = new Date(tx.date);
        const pYear = purchaseDate.getFullYear();
        const pMonth = purchaseDate.getMonth();

        // Calculate months elapsed since purchase
        // If purchased in Jan (0) and now is Jan (0) -> 0 months
        // If now is Feb (1) -> 1 month
        const monthsElapsed = (currentYear - pYear) * 12 + (currentMonth - pMonth);

        const installments = tx.installments && tx.installments > 0 ? tx.installments : 1;
        const monthlyAmount = tx.amount / installments;

        // 1. Calculate Total Remaining Debt
        // Assumption: 1st installment is paid in month following purchase (month 1 relative)
        // Paid installments = monthsElapsed.
        let installmentsPaid = Math.max(0, monthsElapsed);

        // Cannot pay more than total
        if (installmentsPaid > installments) installmentsPaid = installments;

        const remainingInstallments = installments - installmentsPaid;
        totalDebt += remainingInstallments * monthlyAmount;

        // 2. Calculate Next Month Bill (Current Month + 1)
        // Next bill corresponds to relative month "monthsElapsed + 1"
        const nextBillMonthIndex = monthsElapsed + 1;

        if (nextBillMonthIndex >= 1 && nextBillMonthIndex <= installments) {
            nextMonthBill += monthlyAmount;
        }
    });

    return { totalDebt, nextMonthBill };
};

module.exports = { calculateCreditProjection };
