import BalanceCard from '../components/BalanceCard';
import FixedExpensesCard from '../components/FixedExpensesCard';
import CreditCardWidget from '../components/CreditCardWidget';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const DashboardView = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode,
        onOpenFixedExpense
    } = useOutletContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 md:pb-6">
            {/* Balance Card - Full Width on Mobile, 8/12 on Desktop */}
            <div className="md:col-span-8">
                <BalanceCard transactions={transactions} isPrivacyMode={isPrivacyMode} />
            </div>

            {/* Quick Chart (Credit Card Widget) - 4/12 */}
            <div className="md:col-span-4">
                <CreditCardWidget isPrivacyMode={isPrivacyMode} refreshTrigger={transactions} />
            </div>

            {/* Fixed Expenses - Full Width */}
            <div className="md:col-span-12">
                <FixedExpensesCard
                    transactions={transactions}
                    onRefresh={onRefresh}
                    isPrivacyMode={isPrivacyMode}
                    onOpenConfig={onOpenFixedExpense}
                />
            </div>
        </div>
    );
};

export default DashboardView;
