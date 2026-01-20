import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Search, Plus, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const HistoryView = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode,
        exchangeRates,
        selectedCurrencyRate
    } = useOutletContext();

    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Check for "pending" query param or state
    useEffect(() => {
        if (location.state?.filter === 'pending') {
            setShowPendingOnly(true);
        }
    }, [location.state]);

    // Filter transactions based on search and pending toggle
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesPending = showPendingOnly ? t.needsReview : true;

        return matchesSearch && matchesPending;
    });

    const handleTransactionClick = (t) => {
        if (t.needsReview) {
            setEditingTransaction(t);
            // We use the same modal state for both, or just set editingTransaction and reuse the logic.
            // Since the code had two modal implementations, I will unify them.
            setIsFormOpen(true);
        } else {
            // Original behavior if not needing review? Or allow editing all?
            // HEAD allowed editing all via click. Feature allowed editing pending.
            // I'll allow editing all, but if it's pending it might have specific handling in Form.
            setEditingTransaction(t);
            setIsFormOpen(true);
        }
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

                <button
                    onClick={() => setShowPendingOnly(!showPendingOnly)}
                    className={`flex items-center justify-center w-12 rounded-xl border transition-all ${
                        showPendingOnly
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-surface border-white/10 text-textMuted hover:text-white'
                    }`}
                    title="Mostrar solo pendientes de revisión"
                >
                    <Filter size={20} className={showPendingOnly ? "animate-pulse" : ""} />
                </button>

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
                    {/* Wrapper con dimensiones - Adjusted for mobile/desktop compatibility */}
                    <div className="w-full max-w-md h-[85vh] relative flex flex-col bg-transparent">

                        {/* Botón Cerrar Flotante */}
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
