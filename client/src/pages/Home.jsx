import BalanceCard from '../components/BalanceCard';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import CreditCardWidget from '../components/CreditCardWidget'; // <--- Importar
import SubscriptionWidget from '../components/SubscriptionWidget'; // <--- Subscription Radar
import WishlistCard from '../components/WishlistCard'; // <--- Wishlist
import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';

const Home = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode,
        handleGamification,
        exchangeRates,
        selectedCurrencyRate
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

                {/* ROW 2: Wishlist (Inserted here or maybe alongside Transaction Form?) */}
                {/* Let's put Wishlist alongside Transaction Form in a grid, or maybe below.
                    Given the transaction form is quite tall, maybe Wishlist can go below BalanceCard if space permits.
                    Or we can split the Transaction Form row.
                    The current layout is:
                    Left Col (8): Balance + (Credit/Sub), Transaction Form
                    Right Col (4): Recent Transactions

                    Adding Wishlist:
                    Maybe move Transaction Form to be its own block and put Wishlist next to it?
                    Or put Wishlist below Balance/Credit cards row?
                */}

                {/* Let's try inserting Wishlist above Transaction Form */}
                <div className="h-[400px]">
                    <WishlistCard refreshTrigger={transactions} />
                </div>

                 {/* Transaction Form */}
                <div>
                   <TransactionForm
                        onTransactionAdded={(data) => {
                            onRefresh();
                            setEditingTransaction(null);
                            if (data?.gamification) handleGamification(data.gamification);
                        }}
                        initialData={editingTransaction}
                        onCancelEdit={() => setEditingTransaction(null)}
                        exchangeRates={exchangeRates}
                        selectedCurrencyRate={selectedCurrencyRate}
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
