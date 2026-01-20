import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Landmark,
    HandCoins,
    Vault,
    TrendingDown,
    TrendingUp,
    Plus,
    DollarSign,
    AlertCircle,
    CheckCircle,
    PiggyBank,
    Edit2,
    Trash2,
    Check
} from 'lucide-react';

const WealthCard = ({ isPrivacyMode, onGamification }) => {
    const [activeTab, setActiveTab] = useState('DEBT'); // DEBT, RECEIVABLE, CASH
    const [items, setItems] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editItemId, setEditItemId] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        totalAmount: '',
        currentAmount: '',
        currency: 'ARS',
        type: 'DEBT'
    });

    const [actionAmount, setActionAmount] = useState('');
    const [createTransaction, setCreateTransaction] = useState(false);

    useEffect(() => {
        fetchItems();
    }, [refreshKey]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const [wealthRes, savingsRes] = await Promise.all([
                api.get('/wealth'),
                api.get('/savings-goals')
            ]);

            if (wealthRes.data.success) {
                setItems(wealthRes.data.data);
            }
            if (savingsRes.data.success) {
                setSavingsGoals(savingsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching wealth items:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredItems = () => {
        const wealthItems = items.filter(item => item.type === activeTab);
        if (activeTab === 'CASH') {
            const goalItems = savingsGoals.map(g => ({
                _id: g._id,
                title: g.title,
                currentAmount: g.currentAmount,
                totalAmount: g.targetAmount,
                type: 'CASH',
                currency: 'ARS',
                isSavingsGoal: true,
                icon: g.icon
            }));
            return [...wealthItems, ...goalItems];
        }
        return wealthItems;
    };

    const filteredItems = getFilteredItems();

    const totalValue = filteredItems.reduce((acc, item) => acc + item.currentAmount, 0);

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditItemId(null);
        setFormData({ title: '', totalAmount: '', currentAmount: '', currency: 'ARS', type: 'DEBT' });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                type: activeTab,
                totalAmount: formData.totalAmount || formData.currentAmount
            };

            if (isEditing && editItemId) {
                await api.put(`/wealth/${editItemId}`, payload);
            } else {
                await api.post('/wealth', payload);
            }

            setRefreshKey(prev => prev + 1);
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (item) => {
        if (item.isSavingsGoal) return;
        setFormData({
            title: item.title,
            totalAmount: item.totalAmount,
            currentAmount: item.currentAmount,
            currency: item.currency,
            type: item.type
        });
        setEditItemId(item._id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDeleteClick = async (item) => {
        if (item.isSavingsGoal) return;
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro permanentemente?')) {
            try {
                await api.delete(`/wealth/${item._id}`);
                setRefreshKey(prev => prev + 1);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleActionClick = (item) => {
        if (item.isSavingsGoal) return;
        setSelectedItem(item);
        setActionAmount('');
        setCreateTransaction(false);
        setShowActionModal(true);
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem || selectedItem.isSavingsGoal) return;

        try {
            const amount = Number(actionAmount);
            let newAmount = selectedItem.currentAmount;

            if (selectedItem.type === 'DEBT') {
                newAmount = selectedItem.currentAmount - amount;
            } else if (selectedItem.type === 'RECEIVABLE') {
                newAmount = selectedItem.currentAmount - amount;
            }

            const res = await api.put(`/wealth/${selectedItem._id}`, { currentAmount: newAmount });

            if (res.data.gamification && onGamification) {
                onGamification(res.data.gamification);
            }

            if (createTransaction) {
                const txType = selectedItem.type === 'DEBT' ? 'EXPENSE' : 'INCOME';
                const txData = {
                    description: `${selectedItem.type === 'DEBT' ? 'Pago deuda' : 'Cobro'}: ${selectedItem.title}`,
                    amount: amount,
                    type: txType,
                    category: 'Financiero',
                    currency: selectedItem.currency,
                    date: new Date()
                };
                await api.post('/transactions', txData);
            }

            setRefreshKey(prev => prev + 1);
            setShowActionModal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCashUpdate = async (item, amountToAdd) => {
        if (item.isSavingsGoal) return;
        try {
            const newAmount = item.currentAmount + amountToAdd;
            await api.put(`/wealth/${item._id}`, { currentAmount: newAmount });
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error(error);
        }
    };

    const formatMoney = (amount, currency = 'ARS') => {
        if (isPrivacyMode) return '****';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
    };

    const getTabColor = (tab) => {
        if (activeTab === tab) {
            switch(tab) {
                case 'DEBT': return 'text-rose-400 border-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)] bg-rose-400/10';
                case 'RECEIVABLE': return 'text-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)] bg-emerald-400/10';
                case 'CASH': return 'text-amber-400 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] bg-amber-400/10';
            }
        }
        return 'text-textMuted border-transparent hover:text-white';
    };

    return (
        <div className="bento-card relative flex flex-col h-full bg-surface border border-primary/20">
            {/* HEADER & TABS */}
            <div className="p-4 border-b border-border flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        {activeTab === 'DEBT' && <TrendingDown className="text-rose-400" />}
                        {activeTab === 'RECEIVABLE' && <HandCoins className="text-emerald-400" />}
                        {activeTab === 'CASH' && <Vault className="text-amber-400" />}
                        Patrimonio
                    </h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-icon bg-primary/20 text-primary hover:bg-primary hover:text-white"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex p-1 bg-surfaceHighlight/30 rounded-lg">
                    {['DEBT', 'RECEIVABLE', 'CASH'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${getTabColor(tab)}`}
                        >
                            {tab === 'DEBT' ? 'Deudas' : tab === 'RECEIVABLE' ? 'A Cobrar' : 'Caja'}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT LIST */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="text-center text-textMuted text-sm py-8">
                        No hay registros
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const isCompleted = (item.type === 'DEBT' || item.type === 'RECEIVABLE') && item.currentAmount === 0;

                        return (
                            <div key={item._id} className="bg-surfaceHighlight/10 border border-white/5 rounded-xl p-3 flex justify-between items-center group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    {item.isSavingsGoal && (
                                        <div className="p-2 rounded-full bg-pink-500/10 text-pink-500">
                                            <PiggyBank size={16} />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className={`font-medium text-white text-sm ${isCompleted ? 'line-through opacity-50' : ''}`}>
                                            {item.title}
                                            {item.isSavingsGoal && <span className="text-[10px] ml-2 text-pink-400 border border-pink-500/30 px-1 rounded">META</span>}
                                        </h4>
                                        <p className={`text-xs font-mono mt-1 ${
                                            item.type === 'DEBT' ? 'text-rose-400' :
                                            item.type === 'RECEIVABLE' ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                            {formatMoney(item.currentAmount, item.currency)}
                                            {item.totalAmount > item.currentAmount && item.type !== 'CASH' && (
                                                <span className="text-textMuted ml-1 opacity-70">
                                                    / {formatMoney(item.totalAmount, item.currency)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    {item.isSavingsGoal ? (
                                        <div className="text-[10px] text-textMuted px-2 py-1 bg-white/5 rounded">
                                            Gestionar abajo
                                        </div>
                                    ) : (
                                        <>
                                            {/* Primary Actions */}
                                            {item.type === 'CASH' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleCashUpdate(item, 1000)}
                                                        className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                                        title="Ingresar"
                                                    >
                                                        <Plus size={14} onClick={(e) => {
                                                            e.stopPropagation();
                                                            const amt = prompt('Monto a ingresar:');
                                                            if (amt) handleCashUpdate(item, Number(amt));
                                                        }}/>
                                                    </button>
                                                    <button
                                                        onClick={() => {}}
                                                        className="p-1.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                                                        title="Retirar"
                                                    >
                                                        <TrendingDown size={14} onClick={(e) => {
                                                            e.stopPropagation();
                                                            const amt = prompt('Monto a retirar:');
                                                            if (amt) handleCashUpdate(item, -Number(amt));
                                                        }}/>
                                                    </button>
                                                </>
                                            ) : (
                                                isCompleted ? (
                                                    <button
                                                        onClick={() => handleDeleteClick(item)}
                                                        className="btn-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded flex items-center gap-1"
                                                        title="Finalizar y Eliminar"
                                                    >
                                                        <Check size={12} /> <span className="text-xs">Finalizar</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActionClick(item)}
                                                        className="btn-xs btn-outline text-xs px-2 py-1"
                                                    >
                                                        {item.type === 'DEBT' ? 'Pagar' : 'Cobrar'}
                                                    </button>
                                                )
                                            )}

                                            {/* Separator */}
                                            <div className="w-px h-4 bg-white/10 mx-1"></div>

                                            {/* Edit & Delete Actions */}
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                className="p-1.5 text-primary hover:text-white hover:bg-primary/20 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={14} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* TOTAL FOOTER */}
            <div className="p-4 border-t border-border bg-surfaceHighlight/5">
                <div className="flex justify-between items-end">
                    <span className="text-xs text-textMuted uppercase font-bold tracking-wider">Total</span>
                    <span className="text-xl font-bold text-white tracking-tight">
                        {formatMoney(totalValue)}
                    </span>
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-primary/30 rounded-2xl p-6 w-full max-w-sm shadow-glow relative">
                        <h3 className="text-lg font-bold text-white mb-4">
                            {isEditing ? 'Editar Registro' : `Nuevo ${activeTab === 'DEBT' ? 'Pasivo' : activeTab === 'RECEIVABLE' ? 'Activo' : 'Fondo'}`}
                        </h3>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-textMuted block mb-1">Título</label>
                                <input
                                    type="text"
                                    className="input-pro w-full"
                                    placeholder="Ej: Hipoteca, Ahorro..."
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-textMuted block mb-1">Monto Actual</label>
                                    <input
                                        type="number"
                                        className="input-pro w-full"
                                        placeholder="0.00"
                                        value={formData.currentAmount}
                                        onChange={e => setFormData({...formData, currentAmount: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-textMuted block mb-1">Moneda</label>
                                    <select
                                        className="input-pro w-full"
                                        value={formData.currency}
                                        onChange={e => setFormData({...formData, currency: e.target.value})}
                                    >
                                        <option value="ARS">ARS</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>

                            {activeTab !== 'CASH' && (
                                <div>
                                    <label className="text-xs text-textMuted block mb-1">Monto Original (Opcional)</label>
                                    <input
                                        type="number"
                                        className="input-pro w-full"
                                        placeholder="Si es diferente al actual"
                                        value={formData.totalAmount}
                                        onChange={e => setFormData({...formData, totalAmount: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 btn-ghost text-sm">Cancelar</button>
                                <button type="submit" className="flex-1 btn-primary text-sm">
                                    {isEditing ? 'Actualizar Registro' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ACTION MODAL */}
            {showActionModal && selectedItem && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-primary/30 rounded-2xl p-6 w-full max-w-sm shadow-glow">
                        <h3 className="text-lg font-bold text-white mb-2">
                            {selectedItem.type === 'DEBT' ? 'Amortizar Deuda' : 'Registrar Cobro'}
                        </h3>
                        <p className="text-sm text-textMuted mb-4">
                            {selectedItem.title} - Restante: {formatMoney(selectedItem.currentAmount, selectedItem.currency)}
                        </p>

                        <form onSubmit={handleActionSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-textMuted block mb-1">Monto</label>
                                <input
                                    type="number"
                                    className="input-pro w-full text-lg"
                                    placeholder="0.00"
                                    value={actionAmount}
                                    onChange={e => setActionAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-surfaceHighlight/10 border border-white/5 cursor-pointer" onClick={() => setCreateTransaction(!createTransaction)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${createTransaction ? 'bg-primary border-primary' : 'border-textMuted'}`}>
                                    {createTransaction && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">
                                        {selectedItem.type === 'DEBT' ? 'Registrar Gasto' : 'Registrar Ingreso'}
                                    </p>
                                    <p className="text-xs text-textMuted leading-tight mt-1">
                                        Crear automáticamente una transacción en el historial impactando el saldo global.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowActionModal(false)} className="flex-1 btn-ghost text-sm">Cancelar</button>
                                <button type="submit" className="flex-1 btn-primary text-sm">Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WealthCard;
