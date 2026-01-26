import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { X, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QuickAddModal = ({ onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus automático
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      // Valor base
      const payload = {
        amount: parseFloat(amount) * 100, // Convertir a centavos
        description: 'Gasto Rápido ⚡',
        category: 'Varios',
        date: new Date(),
        needsReview: true,
        type: 'EXPENSE'
      };

      const res = await api.post('/transactions', payload);

      onSuccess(res.data);
      addToast('Gasto rápido guardado', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      addToast('Error al guardar rápido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center gap-8">

        {/* Título o Icono */}
        <div className="flex flex-col items-center gap-2 text-indigo-400/80">
            <Zap size={48} className="fill-indigo-400/20 animate-pulse" />
            <span className="font-heading font-bold tracking-wider text-sm uppercase">Lightning Mode</span>
        </div>

        {/* Input Gigante */}
        <div className="relative w-full">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-slate-400/50 font-mono">$</span>
            <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
                }}
                placeholder="0"
                className="w-full bg-transparent border-none outline-none text-center text-7xl font-mono font-bold text-white placeholder-slate-700 focus:ring-0"
                autoFocus
            />
        </div>

        {/* Botón Confirmar */}
        <button
            type="submit"
            disabled={loading || !amount}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
            {loading ? 'Guardando...' : 'Guardar Rápido ⚡'}
        </button>

        <p className="text-slate-400 text-sm text-center">
            Se guardará como "Varios". Podrás editar los detalles luego.
        </p>

      </form>
    </div>
  );
};

export default QuickAddModal;
