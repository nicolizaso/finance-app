import { useState, useEffect } from 'react';
import { X, PiggyBank, Car, Home, Plane, Gift, Smartphone, GraduationCap, Gamepad2, Briefcase } from 'lucide-react';

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

export default function SavingsGoalForm({ onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '0',
        icon: 'PiggyBank',
        color: '#10b981',
        deadline: '',
        currency: 'ARS'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                targetAmount: initialData.targetAmount || '',
                currentAmount: initialData.currentAmount || '0',
                icon: initialData.icon || 'PiggyBank',
                color: initialData.color || '#10b981',
                deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
                currency: initialData.currency || 'ARS'
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                targetAmount: Number(formData.targetAmount),
                currentAmount: Number(formData.currentAmount)
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const clearDate = () => {
        setFormData({ ...formData, deadline: '' });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-primary/30 rounded-2xl p-6 w-full max-w-sm shadow-glow max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">
                        {initialData ? 'Editar Meta' : 'Nueva Meta'}
                    </h3>
                    <button onClick={onClose} className="text-textMuted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-textMuted block mb-1">Título</label>
                        <input
                            type="text"
                            className="input-pro w-full"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            required
                            placeholder="Ej: Viaje a Japón"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-textMuted block mb-1">Meta</label>
                            <input
                                type="number"
                                className="input-pro w-full"
                                value={formData.targetAmount}
                                onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                                required
                                placeholder="100000"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-textMuted block mb-1">Inicial</label>
                            <input
                                type="number"
                                className="input-pro w-full"
                                value={formData.currentAmount}
                                onChange={e => setFormData({...formData, currentAmount: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Currency Selector */}
                    <div>
                        <label className="text-xs text-textMuted block mb-1">Moneda</label>
                        <div className="flex bg-surfaceHighlight/30 rounded-lg p-1">
                            {['ARS', 'USD'].map(curr => (
                                <button
                                    key={curr}
                                    type="button"
                                    onClick={() => setFormData({...formData, currency: curr})}
                                    className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${
                                        formData.currency === curr
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-textMuted hover:text-white'
                                    }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Picker with Clear Button */}
                    <div className="relative">
                        <label className="text-xs text-textMuted block mb-1">Fecha Límite (Opcional)</label>
                        <div className="relative w-full overflow-hidden rounded-lg">
                            <input
                                type="date"
                                className="input-pro w-full pr-10"
                                value={formData.deadline}
                                onChange={e => setFormData({...formData, deadline: e.target.value})}
                            />
                            {formData.deadline && (
                                <button
                                    type="button"
                                    onClick={clearDate}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textMuted hover:text-rose-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="text-xs text-textMuted block mb-2">Ícono</label>
                        <div className="flex gap-2 flex-wrap">
                            {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                                <button
                                    type="button"
                                    key={name}
                                    onClick={() => setFormData({...formData, icon: name})}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        formData.icon === name
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'border-white/10 text-textMuted hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="text-xs text-textMuted block mb-2">Color Neon</label>
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
                        {submitting ? 'Guardando...' : (initialData ? 'Actualizar Meta' : 'Crear Meta')}
                    </button>
                </form>
            </div>
        </div>
    );
}
