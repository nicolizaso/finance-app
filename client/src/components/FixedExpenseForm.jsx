import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Repeat, Link as LinkIcon, Save, Trash2, Edit2, Plus, ArrowLeft, CreditCard, Banknote, ArrowRightLeft, Globe, X } from 'lucide-react';
import SharedExpenseSelector from './SharedExpenseSelector';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const FixedExpenseForm = ({ onClose, onSuccess }) => {
  const { addToast } = useToast();
  const [view, setView] = useState('list'); 
  const [loading, setLoading] = useState(false);
  const [fixedList, setFixedList] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dayOfMonth: 1,
    category: 'Casa',
    paymentMethod: 'ONLINE',
    paymentLink: '',
    cbuAlias: '',
    currency: 'ARS',
    autoDebitCard: '',
    isSubscription: false
  });
  const [sharedData, setSharedData] = useState(null);
  const [initialSharedData, setInitialSharedData] = useState(null);

  const fetchFixedExpenses = async () => {
    try {
      const res = await api.get('/fixed-expenses');
      setFixedList(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchFixedExpenses(); }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);

    let amountToShow = item.amount / 100;

    if (item.isShared) {
         const rawTotal = item.totalAmount || item.amount;
         amountToShow = rawTotal / 100;

         const initialShared = {
             isShared: true,
             myShare: item.myShare,
             otherShare: item.otherShare,
             sharedWith: item.sharedWith?._id || item.sharedWith,
             amount: rawTotal
         };
         setSharedData(initialShared);
         setInitialSharedData(item);
    } else {
         setSharedData(null);
         setInitialSharedData(null);
    }

    setFormData({
      title: item.title,
      amount: amountToShow.toString(),
      dayOfMonth: item.dayOfMonth,
      category: item.category,
      paymentMethod: item.paymentMethod || 'ONLINE',
      paymentLink: item.paymentLink || '',
      cbuAlias: item.cbuAlias || '',
      currency: item.currency || 'ARS',
      autoDebitCard: item.autoDebitCard || '',
      isSubscription: item.isSubscription || false
    });

    setView('form');
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ 
        title: '', amount: '', dayOfMonth: 1, category: 'Casa', 
        paymentMethod: 'ONLINE', paymentLink: '', cbuAlias: '', currency: 'ARS', autoDebitCard: '', isSubscription: false
    });
    setSharedData(null);
    setInitialSharedData(null);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta regla? También se borrará el gasto pendiente de este mes.")) return;
    try {
      await api.delete(`/fixed-expenses/${id}`);
      fetchFixedExpenses(); 
      if (onSuccess) onSuccess();
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const rawAmount = parseFloat(formData.amount) * 100;
    let payload = { ...formData };

    if (sharedData && sharedData.isShared) {
        payload = {
            ...payload,
            ...sharedData,
            amount: sharedData.myShare,
            totalAmount: rawAmount,
            isShared: true,
            sharedWith: sharedData.sharedWith
        };
    } else {
        payload = {
            ...payload,
            amount: rawAmount,
            totalAmount: rawAmount,
            myShare: rawAmount,
            otherShare: 0,
            isShared: false,
            sharedWith: null,
            sharedStatus: 'NONE'
        };
    }

    try {
      if (editingId) {
        await api.put(`/fixed-expenses/${editingId}`, payload);
      } else {
        await api.post('/fixed-expenses', payload);
      }
      await api.post('/fixed-expenses/generate');
      
      if (onSuccess) onSuccess();
      fetchFixedExpenses();
      setView('list');
      addToast(editingId ? 'Regla actualizada' : 'Regla creada', 'success');
    } catch (error) {
      console.error(error);
      addToast('Error guardando', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (view === 'list') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <Repeat className="text-indigo-400" size={24} /> Reglas Mensuales
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNew}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus size={14} /> Nueva
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {fixedList.length === 0 ? (
              <div className="text-center text-slate-400 py-10 opacity-60">
                <p>No tienes gastos fijos configurados.</p>
              </div>
            ) : (
              fixedList.map(item => (
                <div key={item._id} className="bg-slate-700/30 border border-slate-700 p-3 rounded-xl flex justify-between items-center group hover:border-indigo-500/30 transition-colors">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-white font-bold text-sm truncate" title={item.title}>{item.title}</p>
                    <p className="text-slate-400 text-[10px]">
                      Día {item.dayOfMonth} • {item.paymentMethod}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg bg-slate-800 hover:text-indigo-400 transition-colors text-slate-400">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-slate-800 hover:text-rose-500 transition-colors text-slate-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setView('list')} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
              </button>
              <h3 className="text-xl font-bold text-white font-heading">
                {editingId ? 'Editar Regla' : 'Nuevo Gasto Fijo'}
              </h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1">

            <div className="relative group">
              <input
                type="text"
                placeholder=" "
                className="input-pro peer pt-6 pb-2 bg-slate-900 border-slate-700 focus:border-indigo-500"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
                autoFocus
              />
              <label className="absolute left-4 top-4 text-slate-400/60 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400/40 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-500 pointer-events-none">
                Nombre (ej. Internet)
              </label>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <input
                    type="checkbox"
                    id="isSubscription"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-indigo-500"
                    checked={formData.isSubscription}
                    onChange={e => setFormData({...formData, isSubscription: e.target.checked})}
                />
                <label htmlFor="isSubscription" className="text-sm text-slate-400 cursor-pointer select-none">
                    ¿Es una suscripción recurrente?
                </label>
            </div>

            {/* --- SELECTOR DE MEDIO DE PAGO --- */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Medio de Pago</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'ONLINE', icon: Globe, label: 'Online' },
                            { id: 'TRANSFER', icon: ArrowRightLeft, label: 'Transf.' },
                            { id: 'CASH', icon: Banknote, label: 'Efvo.' },
                            { id: 'DEBIT', icon: CreditCard, label: 'Débito' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFormData({...formData, paymentMethod: opt.id})}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                                    formData.paymentMethod === opt.id
                                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                    : 'bg-slate-700 border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <opt.icon size={18} className="mb-1" />
                                <span className="text-[9px] font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CAMPO CONDICIONAL SEGÚN PAGO --- */}
            <div className="bg-slate-700/30 p-3 rounded-xl border border-slate-700">

                {/* 1. ONLINE: Pide Link */}
                {formData.paymentMethod === 'ONLINE' && (
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-3 text-slate-400/50" size={16} />
                        <input
                        type="text"
                        placeholder="Link de pago (ej. mercadopago.com)"
                        className="input-pro pl-10 text-sm bg-slate-800 border-slate-700"
                        value={formData.paymentLink}
                        onChange={e => setFormData({...formData, paymentLink: e.target.value})}
                        />
                    </div>
                )}

                {/* 2. TRANSFERENCIA: Pide Alias/CBU */}
                {formData.paymentMethod === 'TRANSFER' && (
                    <div className="relative">
                        <ArrowRightLeft className="absolute left-3 top-3 text-slate-400/50" size={16} />
                        <input
                        type="text"
                        placeholder="Alias o CBU (ej. juan.perez.mp)"
                        className="input-pro pl-10 text-sm bg-slate-800 border-slate-700"
                        value={formData.cbuAlias}
                        onChange={e => setFormData({...formData, cbuAlias: e.target.value})}
                        />
                    </div>
                )}

                {/* 3. EFECTIVO: Pide Moneda */}
                {formData.paymentMethod === 'CASH' && (
                    <div className="flex gap-2">
                        {['ARS', 'USD'].map(cur => (
                            <button
                                key={cur}
                                type="button"
                                onClick={() => setFormData({...formData, currency: cur})}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm border transition-all ${
                                    formData.currency === cur
                                    ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                            >
                                {cur === 'ARS' ? '$ Pesos' : 'USD Dólares'}
                            </button>
                        ))}
                    </div>
                )}

                {/* 4. DÉBITO: Pide Nombre Tarjeta */}
                {formData.paymentMethod === 'DEBIT' && (
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-slate-400/50" size={16} />
                        <input
                        type="text"
                        placeholder="Tarjeta adherida (ej. Visa Galicia)"
                        className="input-pro pl-10 text-sm bg-slate-800 border-slate-700"
                        value={formData.autoDebitCard}
                        onChange={e => setFormData({...formData, autoDebitCard: e.target.value})}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                <input
                  type="number"
                  className="input-pro pl-8 font-mono text-lg bg-slate-900 border-slate-700 focus:border-indigo-500"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div className="relative group">
                <input
                  type="number"
                  min="1" max="31"
                  className="input-pro text-center bg-slate-900 border-slate-700 focus:border-indigo-500"
                  value={formData.dayOfMonth}
                  onChange={e => setFormData({...formData, dayOfMonth: e.target.value})}
                  required
                />
                 <label className="absolute left-0 right-0 top-1.5 text-center text-[10px] text-slate-400 pointer-events-none uppercase tracking-wider font-bold">
                  Día del mes
                </label>
              </div>
            </div>

            <select
              className="input-pro appearance-none cursor-pointer bg-slate-900 border-slate-700 focus:border-indigo-500"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
               {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
            </select>

            <SharedExpenseSelector
                totalAmount={formData.amount}
                onChange={setSharedData}
                initialData={initialSharedData}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Guardando...' : (editingId ? 'Actualizar Regla' : 'Crear Regla')}
            </button>
          </form>
        </div>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default FixedExpenseForm;
