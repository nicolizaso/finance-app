import { useState, useEffect } from 'react';
import api from '../api/axios';
import SavingsCard from './SavingsCard';
import { Plus, X, PiggyBank, Car, Home, Plane, Gift, Smartphone, GraduationCap, Gamepad2, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AVAILABLE_ICONS = [
    { name: 'PiggyBank', icon: PiggyBank },
    { name: 'Car', icon: Car },
    { name: 'Home', icon: Home },
    { name: 'Plane', icon: Plane },
    { name: 'Gift', icon: Gift },
    { name: 'Smartphone', icon: Smartphone },
    { name: 'GraduationCap', icon: GraduationCap },
    { name: 'Gamepad2', icon: Gamepad2 },
    { name: 'Briefcase', icon: Briefcase },
];

const COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#d946ef', // Fuchsia
];

export default function SavingsList({ isPrivacyMode }) {
    const { addToast } = useToast();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [actionModal, setActionModal] = useState({ show: false, type: 'ADD', goal: null });
    const [amount, setAmount] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '0',
        icon: 'PiggyBank',
        color: '#10b981',
        deadline: ''
    });

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await api.get('/savings-goals');
            if (res.data.success) {
                setGoals(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching goals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/savings-goals', {
                ...formData,
                targetAmount: Number(formData.targetAmount),
                currentAmount: Number(formData.currentAmount)
            });
            setShowModal(false);
            setFormData({
                title: '',
                targetAmount: '',
                currentAmount: '0',
                icon: 'PiggyBank',
                color: '#10b981',
                deadline: ''
            });
            addToast('Meta creada con éxito', 'success');
            fetchGoals();
        } catch (error) {
            console.error(error);
            addToast('Error al crear la meta', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        const { type, goal } = actionModal;
        if (!goal) return;
        setSubmitting(true);

        try {
            const endpoint = type === 'ADD' ? `/savings-goals/${goal._id}/add` : `/savings-goals/${goal._id}/withdraw`;
            await api.post(endpoint, { amount: Number(amount) });

            setActionModal({ show: false, type: 'ADD', goal: null });
            setAmount('');
            addToast('Actualización exitosa', 'success');
            fetchGoals();
        } catch (error) {
            addToast(error.response?.data?.error || 'Error processing request', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openActionModal = (goal, type) => {
        setActionModal({ show: true, type, goal });
        setAmount('');
    };

    return (
        <div className="bento-card relative flex flex-col w-full bg-slate-800 border border-slate-700 mt-6">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <PiggyBank className="text-indigo-400" />
                    Metas de Ahorro
                </h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-icon bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="p-4 md:overflow-x-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-4 pb-2">
                    {goals.length === 0 ? (
                        <div className="text-slate-400 text-sm w-full text-center py-8">
                            No tienes metas de ahorro activas.
                        </div>
                    ) : (
                        goals.map(goal => (
                            <SavingsCard
                                key={goal._id}
                                goal={goal}
                                isPrivacyMode={isPrivacyMode}
                                onAddFunds={(g) => openActionModal(g, 'ADD')}
                                onWithdraw={(g) => openActionModal(g, 'WITHDRAW')}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-glow max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Nueva Meta</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-wider">Título</label>
                                <input
                                    type="text"
                                    className="input-pro w-full bg-slate-900 border-slate-700"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required
                                    placeholder="Ej: Viaje a Japón"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-wider">Meta ($)</label>
                                    <input
                                        type="number"
                                        className="input-pro w-full bg-slate-900 border-slate-700"
                                        value={formData.targetAmount}
                                        onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                                        required
                                        placeholder="100000"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-wider">Inicial ($)</label>
                                    <input
                                        type="number"
                                        className="input-pro w-full bg-slate-900 border-slate-700"
                                        value={formData.currentAmount}
                                        onChange={e => setFormData({...formData, currentAmount: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-wider">Fecha Límite (Opcional)</label>
                                <input
                                    type="date"
                                    className="input-pro w-full bg-slate-900 border-slate-700"
                                    value={formData.deadline}
                                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                                />
                            </div>

                            {/* Icon Selection */}
                            <div>
                                <label className="text-xs text-slate-400 block mb-2 uppercase font-bold tracking-wider">Ícono</label>
                                <div className="flex gap-2 flex-wrap">
                                    {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                                        <button
                                            type="button"
                                            key={name}
                                            onClick={() => setFormData({...formData, icon: name})}
                                            className={`p-2 rounded-lg border transition-colors ${
                                                formData.icon === name
                                                ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                : 'border-slate-700 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <Icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="text-xs text-slate-400 block mb-2 uppercase font-bold tracking-wider">Color Neon</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map(color => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => setFormData({...formData, color})}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                                formData.color === color
                                                ? 'border-white scale-110'
                                                : 'border-transparent hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="w-full btn-primary mt-4 disabled:opacity-50">
                                {submitting ? 'Creando...' : 'Crear Meta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ACTION MODAL (Add/Withdraw) */}
            {actionModal.show && actionModal.goal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-glow">
                        <h3 className="text-lg font-bold text-white mb-2">
                            {actionModal.type === 'ADD' ? 'Agregar Fondos' : 'Retirar Fondos'}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            {actionModal.goal.title}
                        </p>

                        <form onSubmit={handleActionSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1 uppercase font-bold tracking-wider">Monto</label>
                                <input
                                    type="number"
                                    className="input-pro w-full text-lg bg-slate-900 border-slate-700"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            {actionModal.type === 'ADD' && (
                                <p className="text-xs text-teal-400">
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
                                    className="flex-1 text-slate-400 hover:text-white transition-colors text-sm disabled:opacity-50"
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
        </div>
    );
}
