import TransactionList from '../components/TransactionList';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { useState } from 'react';
import TransactionForm from '../components/TransactionForm';

const HistoryView = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode,
        exchangeRates,
        selectedCurrencyRate
    } = useOutletContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Filter transactions based on search
    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Handlers
    const handleTransactionClick = (t) => {
        setEditingTransaction(t);
        setIsFormOpen(true);
    };

    const handleCreateNew = () => {
        setEditingTransaction(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTransaction(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] pb-20 md:pb-0 relative">

            {/* Header / Search Bar */}
            <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar movimientos..."
                        className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-textMuted focus:border-primary focus:outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Botón para carga detallada */}
                <button
                    onClick={handleCreateNew}
                    className="bg-primary hover:bg-primaryHover text-white w-12 rounded-xl flex items-center justify-center shadow-glow transition-all active:scale-95"
                    title="Nuevo Movimiento Detallado"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bento-card p-0 border-primary/10 bg-surface/50">
                 <TransactionList
                    transactions={filteredTransactions}
                    onTransactionUpdated={onRefresh}
                    isPrivacyMode={isPrivacyMode}
                    onTransactionClick={handleTransactionClick}
                />
            </div>

            {/* Detailed Transaction Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    {/* Wrapper con dimensiones pero sin estilos visuales redundantes (el Form ya los tiene) */}
                    <div className="w-full max-w-md h-[85vh] relative flex flex-col">

                        {/* Botón Cerrar Flotante (necesario porque TransactionForm solo lo muestra en modo edición) */}
                        <button
                            onClick={handleCloseForm}
                            className="absolute top-4 right-4 z-20 text-textMuted hover:text-white bg-surface/50 rounded-full p-1"
                        >
                            <X size={20} />
                        </button>

                        <TransactionForm
                            onTransactionAdded={(data) => {
                                onRefresh();
                                handleCloseForm();
                            }}
                            initialData={editingTransaction}
                            onCancelEdit={handleCloseForm}
                            exchangeRates={exchangeRates}
                            selectedCurrencyRate={selectedCurrencyRate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryView;
