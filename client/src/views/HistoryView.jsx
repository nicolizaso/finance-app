import TransactionList from '../components/TransactionList';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState } from 'react';

const HistoryView = () => {
    const {
        transactions,
        onRefresh,
        isPrivacyMode
    } = useOutletContext();

    const [searchTerm, setSearchTerm] = useState('');

    // Filter transactions based on search
    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] pb-20 md:pb-0">
            {/* Search Bar */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted" size={18} />
                <input
                    type="text"
                    placeholder="Buscar movimientos..."
                    className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-textMuted focus:border-primary focus:outline-none transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bento-card p-0 border-primary/10 bg-surface/50">
                 <TransactionList
                    transactions={filteredTransactions}
                    onTransactionUpdated={onRefresh}
                    isPrivacyMode={isPrivacyMode}
                    // onTransactionClick handling? Usually TransactionList handles editing internally or via prop.
                    // Checking Home.jsx, it passed `onTransactionClick`.
                    // TransactionList likely invokes a callback.
                    // If I want to edit, I need to open the modal.
                    // Home.jsx had `editingTransaction` state and passed `initialData` to `TransactionForm`.
                    // But `TransactionForm` is not in this view!
                    // I need a way to edit transactions.
                    // Maybe `TransactionList` has a built-in edit modal?
                    // Let's check TransactionList code later. If it requires a parent form, I might need a global Edit Modal.
                    // For now, I'll pass a placeholder.
                />
            </div>
        </div>
    );
};

export default HistoryView;
