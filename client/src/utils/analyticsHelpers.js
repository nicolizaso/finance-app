export const getExpensesVsIncomeLast6Months = (transactions = []) => {
    if (!transactions) return [];
    const today = new Date();
    const result = [];

    // Last 6 months including current
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = d.getMonth();
        const year = d.getFullYear();

        // Month name
        const monthName = d.toLocaleString('default', { month: 'short' });

        // Filter transactions for this month/year
        const monthlyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === month && tDate.getFullYear() === year;
        });

        const income = monthlyTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = monthlyTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((acc, t) => acc + t.amount, 0);

        result.push({
            name: monthName,
            Income: income,
            Expense: expense
        });
    }
    return result;
};

export const getCategoryBreakdown = (transactions = [], period) => {
    if (!transactions) return [];
    const today = new Date();
    let filtered = [];

    if (period === 'thisMonth') {
        filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && t.type === 'EXPENSE';
        });
    } else if (period === 'lastMonth') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear() && t.type === 'EXPENSE';
        });
    } else if (period === 'thisYear') {
        filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === today.getFullYear() && t.type === 'EXPENSE';
        });
    }

    const categories = {};
    filtered.forEach(t => {
        const cat = t.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + t.amount;
    });

    return Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
};

export const getSpendingTrend = (transactions = []) => {
    if (!transactions) return [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // Get transactions
    const thisMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'EXPENSE';
    });

    const lastMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && t.type === 'EXPENSE';
    });

    const data = [];
    let accumThis = 0;
    let accumLast = 0;

    // Up to 31 days
    for (let day = 1; day <= 31; day++) {
        // Sum expenses for this day
        const dayExpenseThis = thisMonthTx
            .filter(t => new Date(t.date).getDate() === day)
            .reduce((acc, t) => acc + t.amount, 0);

        const dayExpenseLast = lastMonthTx
            .filter(t => new Date(t.date).getDate() === day)
            .reduce((acc, t) => acc + t.amount, 0);

        accumThis += dayExpenseThis;
        accumLast += dayExpenseLast;

        // If day is in future for current month, stop adding "This Month" data to avoid flat line
        let valThis = accumThis;
        if (day > today.getDate()) {
            valThis = null;
        }

        data.push({
            day,
            thisMonth: valThis,
            lastMonth: accumLast
        });
    }

    return data;
};
