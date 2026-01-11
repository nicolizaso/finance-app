import { useState } from 'react';
import FixedExpensesCard from '../components/FixedExpensesCard';
import FixedExpenseForm from '../components/FixedExpenseForm';
import { useOutletContext } from 'react-router-dom';

const CalendarPage = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();
    const [showFixedForm, setShowFixedForm] = useState(false);

    return (
        <div className="max-w-4xl mx-auto">
             {/* MODAL CONFIG */}
             {showFixedForm && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-md bg-surface border border-primary/50 rounded-3xl p-6 relative shadow-glow">
                        <button onClick={() => setShowFixedForm(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">✕</button>
                        <FixedExpenseForm onClose={() => setShowFixedForm(false)} onSaved={onRefresh} />
                    </div>
                </div>
            )}

            <div className="h-full min-h-[500px]">
                <FixedExpensesCard
                    transactions={transactions}
                    onRefresh={onRefresh}
                    onOpenConfig={() => setShowFixedForm(true)}
                    isPrivacyMode={isPrivacyMode}
                />
            </div>
        </div>
    );
};

export default CalendarPage;
