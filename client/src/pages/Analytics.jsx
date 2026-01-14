import ExpenseChart from '../components/ExpenseChart';
import TransactionList from '../components/TransactionList';
import BudgetCard from '../components/BudgetCard';
import { useOutletContext } from 'react-router-dom';
import { History } from 'lucide-react';

const Analytics = () => {
    const { transactions, onRefresh, isPrivacyMode } = useOutletContext();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
                 <div className="h-[400px] mb-6">
                    <ExpenseChart transactions={transactions} isPrivacyMode={isPrivacyMode} />
                </div>
            </div>

            {/* Budget Section */}
            <div className="lg:col-span-12">
                <div className="h-[400px]">
                    <BudgetCard transactions={transactions} refreshTrigger={transactions} />
                </div>
            </div>

            <div className="lg:col-span-12">
                <div className="bento-card h-full flex flex-col p-0 border-primary/10">
                    <div className="p-6 border-b border-border bg-surfaceHighlight/20 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <History className="text-neon" size={20} />
                            Historial Completo
                        </h3>
                    </div>
                    <div className="p-4">
                        <TransactionList
                            transactions={transactions}
                            onTransactionUpdated={onRefresh}
                            isPrivacyMode={isPrivacyMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
