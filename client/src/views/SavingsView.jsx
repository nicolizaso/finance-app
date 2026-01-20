import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Plus } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import SavingsCard from '../components/SavingsCard';
import SavingsGoalForm from '../components/SavingsGoalForm';
import { useToast } from '../context/ToastContext';

export default function SavingsView() {
    const { isPrivacyMode, handleGamification } = useOutletContext();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [actionModal, setActionModal] = useState({ show: false, type: 'ADD', goal: null });
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { addToast } = useToast();

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/savings-goals');
            if (res.data.success) {
                setGoals(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
            addToast('Error al cargar metas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // CREATE / EDIT HANDLER
    const handleFormSubmit = async (formData) => {
        try {
            if (editingGoal) {
                // Update
                const res = await api.put(`/savings-goals/${editingGoal._id}`, formData);
                if (res.data.success) {
                    addToast('Meta actualizada correctamente', 'success');
                    handleGamification(res.data.gamification);
                }
            } else {
                // Create
                const res = await api.post('/savings-goals', formData);
                if (res.data.success) {
                    addToast('Meta creada exitosamente', 'success');
                    handleGamification(res.data.gamification);
                }
            }
            setShowFormModal(false);
            setEditingGoal(null);
            fetchGoals();
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.error || 'Error al guardar la meta', 'error');
        }
    };

    const handleDelete = async (goal) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta meta?')) return;
        try {
            await api.delete(`/savings-goals/${goal._id}`);
            addToast('Meta eliminada', 'success');
            fetchGoals();
        } catch (error) {
            console.error(error);
            addToast('Error al eliminar la meta', 'error');
        }
    };

    // ACTION HANDLER (Add/Withdraw)
    const handleActionSubmit = async (e) => {
        e.preventDefault();
        const { type, goal } = actionModal;
        if (!goal) return;
        setSubmitting(true);

        try {
            const endpoint = type === 'ADD' ? `/savings-goals/${goal._id}/add` : `/savings-goals/${goal._id}/withdraw`;
            const res = await api.post(endpoint, { amount: Number(amount) });

            if (res.data.success) {
                 addToast(type === 'ADD' ? 'Fondos agregados' : 'Fondos retirados', 'success');
                 handleGamification(res.data.gamification);
            }

            setActionModal({ show: false, type: 'ADD', goal: null });
            setAmount('');
            fetchGoals();
        } catch (error) {
            addToast(error.response?.data?.error || 'Error al procesar la solicitud', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openActionModal = (goal, type) => {
        setActionModal({ show: true, type, goal });
        setAmount('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto pb-24 md:pb-6 space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <PiggyBank className="text-pink-400" />
                        Metas de Ahorro
                    </h1>
                    <p className="text-textMuted text-sm mt-1">
                        Visualiza y gestiona tus objetivos financieros.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingGoal(null); setShowFormModal(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Nueva Meta
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-surface/30">
                        <div className="w-16 h-16 rounded-full bg-surfaceHighlight/20 flex items-center justify-center mb-4 text-textMuted">
                            <PiggyBank size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">No tienes metas aún</h3>
                        <p className="text-textMuted text-sm max-w-xs mb-6">
                            Comienza a ahorrar para tus sueños creando tu primera meta de ahorro.
                        </p>
                        <button
                            onClick={() => { setEditingGoal(null); setShowFormModal(true); }}
                            className="btn-secondary"
                        >
                            Crear Primera Meta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map(goal => (
                            <SavingsCard
                                key={goal._id}
                                goal={goal}
                                isPrivacyMode={isPrivacyMode}
                                onAddFunds={(g) => openActionModal(g, 'ADD')}
                                onWithdraw={(g) => openActionModal(g, 'WITHDRAW')}
                                onEdit={(g) => { setEditingGoal(g); setShowFormModal(true); }}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* FORM MODAL */}
            {showFormModal && (
                <SavingsGoalForm
                    onClose={() => setShowFormModal(false)}
                    onSubmit={handleFormSubmit}
                    initialData={editingGoal}
                />
            )}

            {/* ACTION MODAL (Add/Withdraw) */}
            {actionModal.show && actionModal.goal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-primary/30 rounded-2xl p-6 w-full max-w-sm shadow-glow">
                        <h3 className="text-lg font-bold text-white mb-2">
                            {actionModal.type === 'ADD' ? 'Agregar Fondos' : 'Retirar Fondos'}
                        </h3>
                        <p className="text-sm text-textMuted mb-4">
                            {actionModal.goal.title}
                        </p>

                        <form onSubmit={handleActionSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-textMuted block mb-1">Monto ({actionModal.goal.currency})</label>
                                <input
                                    type="number"
                                    className="input-pro w-full text-lg"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            {actionModal.type === 'ADD' && (
                                <p className="text-xs text-emerald-400">
                                    Se creará un GASTO en tus movimientos para reducir tu dinero disponible.
                                </p>
                            )}
                            {actionModal.type === 'WITHDRAW' && (
                                <p className="text-xs text-rose-400">
                                    Se creará un INGRESO en tus movimientos para aumentar tu dinero disponible.
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActionModal({ show: false, type: 'ADD', goal: null })}
                                    disabled={submitting}
                                    className="flex-1 btn-ghost text-sm disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 btn-primary text-sm disabled:opacity-50">
                                    {submitting ? 'Procesando...' : 'Confirmar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
