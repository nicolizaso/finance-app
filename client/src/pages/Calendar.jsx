import { useState, useEffect } from 'react';
import FixedExpenseForm from '../components/FixedExpenseForm';
import { useOutletContext } from 'react-router-dom';
import FinancialCalendar from '../components/FinancialCalendar';
import api from '../api/axios';

const CalendarPage = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();
    const [fixedExpenses, setFixedExpenses] = useState([]);
    const [showFixedForm, setShowFixedForm] = useState(false);

    // Fetch Fixed Expenses Templates
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
        <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-4">
             {/* MODAL CONFIG */}
             {showFixedForm && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-surface border border-primary/50 rounded-3xl p-6 relative shadow-glow">
                        <button onClick={() => setShowFixedForm(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">✕</button>
                        <FixedExpenseForm onClose={() => setShowFixedForm(false)} onSaved={onRefresh} />
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0">
                <FinancialCalendar
                    transactions={transactions}
                    fixedExpenses={fixedExpenses}
                    onRefresh={onRefresh}
                    isPrivacyMode={isPrivacyMode}
                />
            </div>

            {/* Optional: Add a button to open Fixed Expense Configuration if needed, or rely on other menus.
                The prompt didn't strictly require the config button here, but keeping it accessible might be good.
                I'll leave it out of the main view for cleanliness unless requested,
                as the calendar itself is the main feature.
            */}
        </div>
    );
};

export default CalendarPage;
