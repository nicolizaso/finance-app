import BalanceCard from '../components/BalanceCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import { useOutletContext } from 'react-router-dom';

const Home = () => {
    // We expect these to be passed via outlet context or similar,
    // BUT since we are extracting from App.jsx where they were local state,
    // we should look at how we pass data.
    // In React Router v6+, we can use useOutletContext().
    const {
        transactions,
        onRefresh,
        isPrivacyMode
    } = useOutletContext();

    // Filter recent transactions (e.g., last 5)
    // Note: TransactionList already handles list rendering.
    // Maybe we want a "Compact" version or just show the component.
    // For now I'll use the TransactionList but maybe limit it if possible,
    // or just show it as is. The original layout had it on the side.

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
                 {/* ROW 1: BALANCE */}
                <div className="min-h-[220px]">
                    <BalanceCard transactions={transactions} isPrivacyMode={isPrivacyMode} />
                </div>

                 {/* Transaction Form */}
                <div>
                   <TransactionForm onTransactionAdded={onRefresh} />
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-4">
               <div className="bento-card h-[500px] flex flex-col p-0 border-primary/10">
                  <div className="p-4 border-b border-border bg-surfaceHighlight/20">
                    <h3 className="text-md font-bold text-white">Últimos Movimientos</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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

export default Home;
