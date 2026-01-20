import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { useState } from 'react';

const HistoryView = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode,
        exchangeRates,
        selectedCurrencyRate
    } = useOutletContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Filter transactions based on search
    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleAddClick = () => {
        setEditingTransaction(null);
        setShowModal(true);
    };

    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
    };

    const handleTransactionSaved = () => {
        onRefresh();
        handleCloseModal();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] pb-20 md:pb-0">
            {/* Header: Search & Add Button */}
            <div className="mb-4 flex gap-3">
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
                <button
                    onClick={handleAddClick}
                    className="bg-primary hover:bg-primary/80 text-white p-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-primary/20"
                    aria-label="Agregar movimiento"
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
                    onTransactionClick={handleEditClick}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={handleCloseModal}
                >
                    <div
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-scale-in shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                         {/* We pass onCancelEdit to handle closing/cancel logic, and onTransactionAdded for success */}
                         <TransactionForm
                            onTransactionAdded={handleTransactionSaved}
                            initialData={editingTransaction}
                            onCancelEdit={handleCloseModal}
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
