import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { useOutletContext, useLocation } from 'react-router-dom';
import { Search, Plus, X, Filter } from 'lucide-react';
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
    
    // Estados combinados
    const [searchTerm, setSearchTerm] = useState('');
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Efecto: Detectar si venimos de la notificación (Pending Filter)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('filter') === 'pending') {
            setShowPendingOnly(true);
        }
    }, [location]);

    // Lógica de Filtrado Unificada (Búsqueda + Pendientes)
    const filteredTransactions = transactions.filter(t => {
        // 1. Filtro de Pendientes (si está activo)
        if (showPendingOnly && !t.needsReview) return false;

        // 2. Filtro de Texto (Buscador)
        const searchLower = searchTerm.toLowerCase();
        return (
            t.description.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    });

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

    const togglePendingFilter = () => {
        setShowPendingOnly(!showPendingOnly);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] pb-20 md:pb-0 relative">

            {/* Header: Search Bar & Actions */}
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

                {/* Botón Filtro Pendientes (Nuevo) */}
                <button
                    onClick={togglePendingFilter}
                    className={`w-12 rounded-xl flex items-center justify-center transition-all ${showPendingOnly ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-surface border border-white/10 text-textMuted hover:text-white'}`}
                    title="Ver solo pendientes de revisión"
                >
                    <Filter size={20} className={showPendingOnly ? "animate-pulse" : ""} />
                </button>

                {/* Botón Nuevo Movimiento */}
                <button
                    onClick={handleCreateNew}
                    className="bg-primary hover:bg-primaryHover text-white w-12 rounded-xl flex items-center justify-center shadow-glow transition-all active:scale-95"
                    title="Nuevo Movimiento Detallado"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Chip de Filtro Activo (Feedback Visual) */}
            {showPendingOnly && (
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Filtrando pendientes de revisión
                        <button onClick={() => setShowPendingOnly(false)} className="hover:text-white ml-1"><X size={12} /></button>
                    </span>
                </div>
            )}

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
                    {/* Wrapper con dimensiones */}
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