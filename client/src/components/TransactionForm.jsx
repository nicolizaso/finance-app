import { useState, useEffect } from 'react';
import api from '../api/axios';
import { PlusCircle, Edit2, X, Tag } from 'lucide-react';
import SharedExpenseSelector from './SharedExpenseSelector';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const TransactionForm = ({ onTransactionAdded, initialData, onCancelEdit, exchangeRates, selectedCurrencyRate }) => {
  const { addToast } = useToast();
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
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  const [currency, setCurrency] = useState('ARS');

  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/transactions/tags')
      .then(res => {
        if (res.data.success) setAvailableTags(res.data.data);
      })
      .catch(err => console.error("Error fetching tags", err));
  }, []);

  useEffect(() => {
    if (initialData) {
      let amountToShow = initialData.amount;

      if (initialData.isShared) {
         amountToShow = initialData.totalAmount || initialData.amount;

         setSharedData({
            isShared: true,
            myShare: initialData.myShare || initialData.amount,
            otherShare: initialData.otherShare || (initialData.totalAmount ? initialData.totalAmount - initialData.amount : 0),
            sharedWith: initialData.sharedWith?._id || initialData.sharedWith,
         });
      }

      setFormData({
        ...initialData,
        amount: amountToShow / 100,
        date: new Date(initialData.date).toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'DEBIT',
        installments: initialData.installments || 1,
      });
      if (initialData.tags) {
        setTags(initialData.tags);
      }
    } else {
        setTags([]);
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

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalAmount = parseFloat(formData.amount);

    if (currency === 'USD' && exchangeRates && exchangeRates[selectedCurrencyRate]) {
        const rate = exchangeRates[selectedCurrencyRate].venta;
        finalAmount = finalAmount * rate;
    }

    let payload = { ...formData, tags, amount: Math.round(finalAmount * 100) };

    if (initialData) {
        payload.needsReview = false;
    }

    if (sharedData && sharedData.isShared) {
        const cleanSharedWith = sharedData.sharedWith?._id || sharedData.sharedWith;

        payload = {
            ...payload,
            ...sharedData,
            isShared: true,
            sharedWith: cleanSharedWith
        };

        payload.isShared = true;
        payload.sharedWith = sharedData.sharedWith?._id || sharedData.sharedWith;

        const splits = [
             { userId: 'CREATOR', amount: sharedData.myShare },
             { userId: cleanSharedWith, amount: sharedData.otherShare }
        ];

        payload.splits = splits;
        payload.totalAmount = Math.round(finalAmount * 100);
        payload.amount = sharedData.myShare;
    }

    try {
      if (initialData) {
        const res = await api.put(`/transactions/${initialData._id}`, payload);
        if (onCancelEdit) onCancelEdit();
        if (onTransactionAdded) onTransactionAdded(res.data);
      } else {
        const res = await api.post('/transactions', payload);
        setFormData(prev => ({ ...prev, description: '', amount: '' }));
        setTags([]);
        if (onTransactionAdded) onTransactionAdded(res.data);
      }
      addToast(initialData ? 'Transacción actualizada' : 'Transacción creada', 'success');
    } catch (error) {
      console.error(error);
      addToast('Error al guardar la transacción', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-slate-800 border ${initialData ? 'border-indigo-500/50 shadow-glow' : 'border-slate-700'} rounded-3xl p-6 h-full shadow-card relative overflow-hidden transition-all duration-300`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 font-heading">
          {initialData ? <Edit2 className="text-indigo-400" size={24} /> : <PlusCircle className="text-indigo-500" size={24} />}
          {initialData ? 'Editar / Revisar' : 'Agregar'}
        </h3>
        
        {initialData && (
            <button onClick={onCancelEdit} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
            </button>
        )}

        {/* Toggle Gasto/Ingreso */}
        <div className="bg-slate-700 p-1 rounded-xl flex">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'EXPENSE'})}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-500/20 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'INCOME'})}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.type === 'INCOME' ? 'bg-teal-500/20 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
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
            className="input-pro peer pt-6 pb-2 bg-slate-900 border-slate-700 focus:border-indigo-500"
            required
            autoComplete="off"
          />
          <label className="absolute left-4 top-4 text-slate-400/60 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400/40 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-500 pointer-events-none">
            Descripción (ej. Supermercado)
          </label>
        </div>

        {/* Fila: Monto y Fecha */}
        <div className="flex gap-4">
          <div className="relative w-1/2">
            <div className="flex items-center absolute left-4 top-3.5 gap-2">
                <span className="text-slate-400">$</span>
                {/* Toggle Currency */}
                <button
                    type="button"
                    onClick={() => setCurrency(prev => prev === 'ARS' ? 'USD' : 'ARS')}
                    className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-white font-bold hover:bg-indigo-500/50 transition-colors"
                >
                    {currency}
                </button>
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="input-pro pl-20 font-mono text-lg bg-slate-900 border-slate-700 focus:border-indigo-500"
              required
            />
            {/* Visual Feedback de Conversión */}
            {currency === 'USD' && formData.amount && exchangeRates && exchangeRates[selectedCurrencyRate] && (
                <div className="absolute -bottom-6 left-0 text-xs text-teal-400 font-mono">
                    ≈ ${ (parseFloat(formData.amount) * exchangeRates[selectedCurrencyRate].venta).toLocaleString('es-AR') } ARS ({selectedCurrencyRate})
                </div>
            )}
          </div>
          <div className="w-1/2">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-pro text-sm bg-slate-900 border-slate-700 focus:border-indigo-500"
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
                    className="input-pro appearance-none cursor-pointer bg-slate-900 border-slate-700 focus:border-indigo-500"
                >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
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
                  className="input-pro appearance-none cursor-pointer bg-slate-900 border-slate-700 focus:border-indigo-500"
                >
                  <option value="DEBIT" className="bg-slate-800">Débito</option>
                  <option value="CREDIT" className="bg-slate-800">Crédito</option>
                  <option value="CASH" className="bg-slate-800">Efectivo</option>
                </select>
              ) : (
                 <div className="h-full flex items-center px-4 text-slate-400 text-sm border border-slate-700 rounded-2xl bg-slate-700/10">
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
                        className="input-pro appearance-none cursor-pointer bg-slate-900 border-slate-700 focus:border-indigo-500"
                    >
                        {[1, 3, 6, 9, 12].map(num => (
                            <option key={num} value={num} className="bg-slate-800">{num} cuotas</option>
                        ))}
                    </select>
                 </div>
            ) : (
                <div className="w-1/2"></div> // Espaciador
            )}

            {/* Switch Pendiente/Pagado */}
            <label className="w-1/2 flex items-center justify-between cursor-pointer bg-slate-700 border border-slate-600 p-3 rounded-xl hover:border-indigo-500/50 transition-colors">
                <span className="text-sm text-slate-400 select-none">
                 {formData.status === 'COMPLETED' ? 'Pagado' : 'Pendiente'}
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.status === 'COMPLETED' ? 'bg-indigo-500' : 'bg-slate-500'}`}>
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
                initialData={initialData}
            />
        )}

        {/* Tags Input */}
        <div className="relative">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                {tags.map(tag => (
                    <span key={tag} className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                    </span>
                ))}
            </div>
            <div className="relative group">
                 <Tag className="absolute left-4 top-3.5 text-slate-400" size={16} />
                 <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Etiquetas (Presiona Enter)"
                    className="input-pro pl-10 text-sm bg-slate-900 border-slate-700 focus:border-indigo-500"
                 />
                 {/* Autocomplete Suggestions */}
                 {tagInput && (
                    <div className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-xl mt-1 shadow-xl max-h-32 overflow-y-auto">
                        {availableTags
                            .filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t))
                            .map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => addTag(t)}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm text-slate-400 hover:text-white"
                                >
                                    {t}
                                </button>
                            ))
                        }
                    </div>
                 )}
            </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Guardando...' : 'Guardar Transacción'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
