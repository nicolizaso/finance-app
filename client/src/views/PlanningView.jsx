import WishlistCard from '../components/WishlistCard';
import SubscriptionWidget from '../components/SubscriptionWidget';
import FinancialCalendar from '../components/FinancialCalendar';
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus } from 'lucide-react';

const PlanningView = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();

    // Logic for Financial Calendar
    const [fixedExpenses, setFixedExpenses] = useState([]);
    // We might need a way to open the FixedExpenseForm.
    // The prompt says "The QuickAddModal and FixedExpenseForm must be globally accessible via state."
    // I'll assume for now we use a local one or connect to global later.
    // I'll stick to local for the calendar part inside this view if needed,
    // OR just display the calendar.

    useEffect(() => {
        const fetchFixed = async () => {
            try {
                const res = await api.get('/fixed-expenses');
                if (res.data.success) {
                    setFixedExpenses(res.data.data);
                }
            } catch (e) { console.error(e); }
        };
        fetchFixed();
    }, [onRefresh]);

    return (
        <div className="space-y-6 pb-24 md:pb-6">
            {/* Top Row: Wishlist & Subscriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WishlistCard refreshTrigger={transactions} />
                <SubscriptionWidget />
            </div>

            {/* Calendar Section */}
            <div className="flex flex-col gap-4">
                 <h3 className="text-xl font-bold text-white font-heading">Calendario Financiero</h3>
                 <div className="bento-card p-4 min-h-[500px]">
                     <FinancialCalendar
                        transactions={transactions}
                        fixedExpenses={fixedExpenses}
                        onRefresh={onRefresh}
                        isPrivacyMode={isPrivacyMode}
                    />
                 </div>
            </div>
        </div>
    );
};

export default PlanningView;
