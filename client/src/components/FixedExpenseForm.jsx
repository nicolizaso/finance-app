import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Repeat, Link as LinkIcon, Save, Trash2, Edit2, Plus, ArrowLeft, CreditCard, Banknote, ArrowRightLeft, Globe } from 'lucide-react';
import SharedExpenseSelector from './SharedExpenseSelector';

const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const FixedExpenseForm = ({ onClose, onSaved }) => {
  const [view, setView] = useState('list'); 
  const [loading, setLoading] = useState(false);
  const [fixedList, setFixedList] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dayOfMonth: 1,
    category: 'Casa',
    paymentMethod: 'ONLINE', // Default
    paymentLink: '',
    cbuAlias: '',
    currency: 'ARS',
    autoDebitCard: ''
  });
  const [sharedData, setSharedData] = useState(null);

  const fetchFixedExpenses = async () => {
    try {
      const res = await api.get('/fixed-expenses');
      setFixedList(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchFixedExpenses(); }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    // Si es compartido, reconstruimos el Total (Mi Parte + Su Parte) para mostrar en el input
    const totalAmount = item.isShared
        ? ((item.amount + (item.otherShare || 0)) / 100)
        : (item.amount / 100);

    setFormData({
      title: item.title,
      amount: (item.amount / 100).toString(), // Muestra MI parte. Si es compartido, SharedSelector recalculará el total.
      dayOfMonth: item.dayOfMonth,
      category: item.category,
      paymentMethod: item.paymentMethod || 'ONLINE',
      paymentLink: item.paymentLink || '',
      cbuAlias: item.cbuAlias || '',
      currency: item.currency || 'ARS',
      autoDebitCard: item.autoDebitCard || ''
    });
    // Pasamos los datos crudos para que el selector se inicialice
    setSharedData(item);
    setView('form');
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ 
        title: '', amount: '', dayOfMonth: 1, category: 'Casa', 
        paymentMethod: 'ONLINE', paymentLink: '', cbuAlias: '', currency: 'ARS', autoDebitCard: '' 
    });
    setSharedData(null);
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta regla? También se borrará el gasto pendiente de este mes.")) return;
    try {
      await api.delete(`/fixed-expenses/${id}`);
      fetchFixedExpenses(); 
      if (onSaved) onSaved(); 
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let payload = { ...formData, amount: parseFloat(formData.amount) * 100 };

    if (sharedData && sharedData.isShared) {
        payload = { ...payload, ...sharedData };
    }

    try {
      if (editingId) {
        await api.put(`/fixed-expenses/${editingId}`, payload);
      } else {
        await api.post('/fixed-expenses', payload);
      }
      await api.post('/fixed-expenses/generate');
      
      if (onSaved) onSaved();
      fetchFixedExpenses();
      setView('list');
    } catch (error) {
      console.error(error);
      alert('Error guardando');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'list') {
    return (
      <div className="animate-fade-in h-[450px] flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Repeat className="text-primary" size={24} /> Reglas Mensuales
          </h3>
          <button 
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primaryHover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Plus size={14} /> Nueva
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {fixedList.length === 0 ? (
            <div className="text-center text-textMuted py-10 opacity-60">
              <p>No tienes gastos fijos configurados.</p>
            </div>
          ) : (
            fixedList.map(item => (
              <div key={item._id} className="bg-surfaceHighlight/30 border border-border p-3 rounded-xl flex justify-between items-center group hover:border-primary/30 transition-colors">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-white font-bold text-sm truncate" title={item.title}>{item.title}</p>
                  <p className="text-textMuted text-[10px]">
                    Día {item.dayOfMonth} • {item.paymentMethod}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg bg-surface hover:text-primary transition-colors text-textMuted">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-surface hover:text-rose-500 transition-colors text-textMuted">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-auto">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setView('list')} className="text-textMuted hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-xl font-bold text-white font-heading">
          {editingId ? 'Editar Regla' : 'Nuevo Gasto Fijo'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder=" " 
            className="input-pro peer pt-6 pb-2"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
            autoFocus
          />
          <label className="absolute left-4 top-4 text-textMuted/60 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-textMuted/40 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary pointer-events-none">
            Nombre (ej. Internet)
          </label>
        </div>

        {/* --- SELECTOR DE MEDIO DE PAGO --- */}
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="text-xs text-textMuted font-bold uppercase tracking-wider mb-1 block">Medio de Pago</label>
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
                                ? 'bg-primary/20 border-primary text-white' 
                                : 'bg-surfaceHighlight border-transparent text-textMuted hover:text-white'
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
        <div className="bg-surfaceHighlight/30 p-3 rounded-xl border border-border">
            
            {/* 1. ONLINE: Pide Link */}
            {formData.paymentMethod === 'ONLINE' && (
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 text-textMuted/50" size={16} />
                    <input 
                    type="text" 
                    placeholder="Link de pago (ej. mercadopago.com)" 
                    className="input-pro pl-10 text-sm bg-surface"
                    value={formData.paymentLink}
                    onChange={e => setFormData({...formData, paymentLink: e.target.value})}
                    />
                </div>
            )}

            {/* 2. TRANSFERENCIA: Pide Alias/CBU */}
            {formData.paymentMethod === 'TRANSFER' && (
                <div className="relative">
                    <ArrowRightLeft className="absolute left-3 top-3 text-textMuted/50" size={16} />
                    <input 
                    type="text" 
                    placeholder="Alias o CBU (ej. juan.perez.mp)" 
                    className="input-pro pl-10 text-sm bg-surface"
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
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-surface border-border text-textMuted'
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
                    <CreditCard className="absolute left-3 top-3 text-textMuted/50" size={16} />
                    <input 
                    type="text" 
                    placeholder="Tarjeta adherida (ej. Visa Galicia)" 
                    className="input-pro pl-10 text-sm bg-surface"
                    value={formData.autoDebitCard}
                    onChange={e => setFormData({...formData, autoDebitCard: e.target.value})}
                    />
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-textMuted">$</span>
            <input 
              type="number" 
              className="input-pro pl-8 font-mono text-lg"
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
              className="input-pro text-center"
              value={formData.dayOfMonth}
              onChange={e => setFormData({...formData, dayOfMonth: e.target.value})}
              required
            />
             <label className="absolute left-0 right-0 top-1.5 text-center text-[10px] text-textMuted pointer-events-none uppercase tracking-wider font-bold">
              Día del mes
            </label>
          </div>
        </div>

        <select 
          className="input-pro appearance-none cursor-pointer"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
        >
           {CATEGORIES.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
        </select>

        {/* SELECTOR DE COMPARTIDO */}
        <SharedExpenseSelector
            totalAmount={formData.amount}
            onChange={setSharedData}
            initialData={editingId ? sharedData : null} // Pasar datos si estamos editando
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
};

export default FixedExpenseForm;