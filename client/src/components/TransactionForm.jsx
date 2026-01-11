import { useState, useEffect } from 'react';
import api from '../api/axios';
import { PlusCircle, Edit2, X } from 'lucide-react';
import SharedExpenseSelector from './SharedExpenseSelector'; // <--- Importar

// --- ESTA ES LA LÍNEA QUE FALTABA ---
const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const TransactionForm = ({ onTransactionAdded, initialData, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    category: 'Comida',
    date: new Date().toISOString().split('T')[0],
    status: 'COMPLETED',
    paymentMethod: 'DEBIT',
    installments: 1
  });
  const [sharedData, setSharedData] = useState(null); // <--- Estado para datos compartidos
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount / 100, // Convertir de centavos a unidades
        date: new Date(initialData.date).toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'DEBIT',
        installments: initialData.installments || 1,
        // Si venía con needsReview, al editarlo lo quitaremos (lógica en submit)
      });
      // TODO: Handle sharedData reconstruction if needed
    }
  }, [initialData]);

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
    // Convertimos a centavos
    let payload = { ...formData, amount: parseFloat(formData.amount) * 100 };

    // Si estamos editando, aseguramos que needsReview sea false
    if (initialData) {
        payload.needsReview = false;
    }

    // Inyectar datos compartidos si existen
    if (sharedData && sharedData.isShared) {
        payload = { ...payload, ...sharedData };
    }

    try {
      if (initialData) {
        // Modo Edición
        await api.put(`/transactions/${initialData._id}`, payload);
        if (onCancelEdit) onCancelEdit(); // Salir del modo edición
      } else {
        // Modo Creación
        await api.post('/transactions', payload);
        // Reset del formulario (mantenemos fecha y tipo para agilizar carga masiva)
        setFormData(prev => ({ ...prev, description: '', amount: '' }));
      }
      
      if (onTransactionAdded) onTransactionAdded();
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-surface border ${initialData ? 'border-orange-500/50 shadow-glow' : 'border-border'} rounded-3xl p-6 h-full shadow-card relative overflow-hidden transition-all duration-300`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 font-heading">
          {initialData ? <Edit2 className="text-orange-500" size={24} /> : <PlusCircle className="text-primary" size={24} />}
          {initialData ? 'Editar / Revisar' : 'Agregar'}
        </h3>
        
        {initialData && (
            <button onClick={onCancelEdit} className="text-textMuted hover:text-white p-1">
                <X size={20} />
            </button>
        )}

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

        {/* Fila: Monto y Fecha */}
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

        {/* Fila: Categoría y Método de Pago */}
        <div className="flex gap-4">
             {/* Selector de Categoría */}
             <div className="w-1/2">
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-pro appearance-none cursor-pointer"
                >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-surface">{cat}</option>
                    ))}
                </select>
            </div>

            {/* Método de Pago (Solo para Gastos) */}
            <div className="w-1/2">
              {formData.type === 'EXPENSE' ? (
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input-pro appearance-none cursor-pointer"
                >
                  <option value="DEBIT" className="bg-surface">Débito</option>
                  <option value="CREDIT" className="bg-surface">Crédito</option>
                  <option value="CASH" className="bg-surface">Efectivo</option>
                </select>
              ) : (
                 <div className="h-full flex items-center px-4 text-textMuted text-sm border border-border rounded-2xl bg-surfaceHighlight/10">
                   Ingreso
                 </div>
              )}
            </div>
        </div>

        {/* Fila: Cuotas (Si es Crédito) y Estado */}
        <div className="flex gap-4 items-center">
            {formData.paymentMethod === 'CREDIT' && formData.type === 'EXPENSE' ? (
                 <div className="w-1/2">
                    <select
                        name="installments"
                        value={formData.installments}
                        onChange={handleChange}
                        className="input-pro appearance-none cursor-pointer"
                    >
                        {[1, 3, 6, 9, 12].map(num => (
                            <option key={num} value={num} className="bg-surface">{num} cuotas</option>
                        ))}
                    </select>
                 </div>
            ) : (
                <div className="w-1/2"></div> // Espaciador
            )}

            {/* Switch Pendiente/Pagado */}
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

        {/* COMPONENTE DE GASTOS COMPARTIDOS */}
        {formData.type === 'EXPENSE' && (
            <SharedExpenseSelector 
                totalAmount={formData.amount} 
                onChange={setSharedData} 
            />
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Guardando...' : 'Guardar Transacción'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;