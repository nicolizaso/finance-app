import BalanceCard from '../components/BalanceCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import CreditCardWidget from '../components/CreditCardWidget'; // <--- Importar
import SubscriptionWidget from '../components/SubscriptionWidget'; // <--- Subscription Radar
import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';

const Home = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode
    } = useOutletContext();

    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleTransactionClick = (transaction) => {
        // Al hacer clic, llevamos los datos al formulario
        setEditingTransaction(transaction);
        // Scroll suave hacia arriba en móvil para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
                 {/* ROW 1: BALANCE & CREDIT CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[220px]">
                    <BalanceCard transactions={transactions} isPrivacyMode={isPrivacyMode} />
                    <div className="flex flex-col gap-6">
                        <CreditCardWidget isPrivacyMode={isPrivacyMode} refreshTrigger={transactions} />
                        <SubscriptionWidget />
                    </div>
                </div>

                 {/* Transaction Form */}
                <div>
                   <TransactionForm
                        onTransactionAdded={() => {
                            onRefresh();
                            setEditingTransaction(null);
                        }}
                        initialData={editingTransaction}
                        onCancelEdit={() => setEditingTransaction(null)}
                   />
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
                        onTransactionClick={handleTransactionClick}
                    />
                  </div>
               </div>
            </div>
        </div>
    );
};

export default Home;
