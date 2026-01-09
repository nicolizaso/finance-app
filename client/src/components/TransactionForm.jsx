import { useState } from 'react';
import api from '../api/axios';

const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    category: 'Comida',
    date: new Date().toISOString().split('T')[0],
    status: 'COMPLETED'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 'COMPLETED' : 'PENDING') : e.target.value;
    if (e.target.name === 'isPaid') {
       setFormData({ ...formData, status: value });
    } else {
       setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, amount: parseFloat(formData.amount) * 100 };

    try {
      await api.post('/transactions', payload);
      if (onTransactionAdded) onTransactionAdded();
      setFormData(prev => ({ ...prev, description: '', amount: '' }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 h-full shadow-card relative overflow-hidden">
      {/* Header Formulario */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-primary text-2xl">+</span> Agregar
        </h3>
        
        {/* Toggle Gasto/Ingreso */}
        <div className="bg-surfaceHighlight p-1 rounded-xl flex">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'EXPENSE'})}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-textMuted hover:text-white'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'INCOME'})}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-textMuted hover:text-white'}`}
            >
              Ingreso
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Descripción */}
        <div className="relative group">
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder=" "
            className="input-pro peer pt-6 pb-2"
            required
            autoComplete="off"
          />
          <label className="absolute left-4 top-4 text-textMuted/60 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-textMuted/40 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary pointer-events-none">
            Descripción (ej. Supermercado)
          </label>
        </div>

        {/* Monto y Fecha Row */}
        <div className="flex gap-4">
          <div className="relative w-1/2">
            <span className="absolute left-4 top-3.5 text-textMuted">$</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="input-pro pl-8 font-mono text-lg"
              required
            />
          </div>
          <div className="w-1/2">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-pro text-sm"
              required
            />
          </div>
        </div>

        {/* Categoría y Estado Row */}
        <div className="flex gap-4 items-center">
            <div className="w-1/2">
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-pro appearance-none cursor-pointer"
                >
                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-surface">{cat}</option>)}
                </select>
            </div>

            <label className="w-1/2 flex items-center justify-between cursor-pointer bg-surfaceHighlight border border-border p-3 rounded-xl hover:border-primary/50 transition-colors">
                <span className="text-sm text-textMuted select-none">
                 {formData.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.status === 'COMPLETED' ? 'bg-primary' : 'bg-gray-600'}`}>
                   <input type="checkbox" name="isPaid" checked={formData.status === 'COMPLETED'} onChange={handleChange} className="hidden"/>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${formData.status === 'COMPLETED' ? 'left-6' : 'left-1'}`}></div>
                </div>
            </label>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? (
             <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : 'Guardar Transacción'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;