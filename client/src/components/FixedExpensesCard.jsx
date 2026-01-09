import { useState, useMemo } from 'react';
import api from '../api/axios';
import { Calendar, Plus, PartyPopper, Check, X, Wallet, AlertCircle, ExternalLink } from 'lucide-react';

const FixedExpensesCard = ({ transactions, onRefresh, onOpenConfig }) => {
  const [payingTransaction, setPayingTransaction] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const pendingExpenses = useMemo(() => {
    return transactions
      .filter(t => t.status === 'PENDING' && t.type === 'EXPENSE')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions]);

  const totalDebt = useMemo(() => {
    return pendingExpenses.reduce((acc, t) => acc + t.amount, 0);
  }, [pendingExpenses]);

  const formatMoney = (amount) => Math.round(amount / 100).toLocaleString('es-AR');

  // --- FUNCIÓN DE LIMPIEZA DE URL ---
  const getSafeLink = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };
  // ----------------------------------

  const openPayModal = (t) => {
    setPayingTransaction(t);
    setPaymentAmount(formatMoney(t.amount));
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') { setPaymentAmount(''); return; }
    const numericValue = parseInt(rawValue, 10);
    setPaymentAmount(numericValue.toLocaleString('es-AR'));
  };

  const confirmPay = async (e) => {
    e.preventDefault();
    const cleanAmount = parseInt(paymentAmount.replace(/\./g, ''), 10);
    
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
        alert("Por favor ingresa un monto válido"); return;
    }

    try {
      await api.put(`/transactions/${payingTransaction._id}`, { 
          ...payingTransaction, 
          amount: cleanAmount * 100, 
          status: 'COMPLETED' 
      });
      onRefresh(); 
      setPayingTransaction(null);
    } catch (error) { console.error(error); }
  };

  return (
    <>
      <div className="bento-card h-full flex flex-col w-full relative min-h-[300px]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b border-border pb-3 shrink-0">
          <div>
            <h3 className="text-white font-bold font-heading text-lg flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Gastos del Mes
            </h3>
            <p className="text-textMuted text-xs mt-1">
              Por pagar: <span className="text-rose-400 font-mono font-bold">${formatMoney(totalDebt)}</span>
            </p>
          </div>
          
          <button 
            onClick={onOpenConfig}
            className="w-8 h-8 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-textMuted hover:text-white hover:bg-primary hover:border-primary transition-all shadow-lg"
            title="Agregar Gasto Fijo"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[250px]">
          {pendingExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
                <PartyPopper size={24} />
              </div>
              <p className="text-textMuted text-sm font-medium">¡Estás al día!</p>
              <p className="text-textMuted/50 text-xs">Sin deudas pendientes.</p>
            </div>
          ) : (
            pendingExpenses.map(t => (
              <div key={t._id} className="flex justify-between items-center bg-surfaceHighlight/30 p-3 rounded-xl border border-transparent hover:border-primary/30 transition-all group shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button 
                    onClick={() => openPayModal(t)}
                    className="w-6 h-6 rounded-full border-2 border-textMuted/50 hover:border-primary hover:bg-primary/20 flex items-center justify-center transition-all shrink-0 text-white"
                  >
                    <Check size={12} className="opacity-0 group-hover:opacity-100" />
                  </button>
                  
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate" title={t.description}>
                      {t.description.length > 20 ? t.description.slice(0, 20) + '...' : t.description}
                    </p>
                    <div className="flex items-center gap-1 text-textMuted text-[10px]">
                       <AlertCircle size={10} />
                       <span>Vence: {new Date(t.date).getDate()}/{new Date().getMonth()+1}</span>
                    </div>
                  </div>
                </div>

                <span className="font-mono text-white font-bold text-sm whitespace-nowrap ml-3 bg-surface/50 px-2 py-1 rounded-lg border border-white/5">
                  ${formatMoney(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {payingTransaction && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-primary/30 rounded-3xl p-6 w-full max-w-sm shadow-glow relative transform transition-all scale-100">
            <button 
              onClick={() => setPayingTransaction(null)}
              className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                 <Wallet size={20} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white font-heading leading-tight">Confirmar Pago</h3>
                  <p className="text-xs text-textMuted">Finalizar transacción</p>
               </div>
            </div>

            <div className="bg-surfaceHighlight/50 p-3 rounded-xl mb-5 border border-white/5">
               <p className="text-xs text-textMuted uppercase font-bold tracking-wider mb-1">Concepto</p>
               <p className="text-white font-medium truncate">{payingTransaction.description}</p>
            </div>

            {/* BOTÓN DE LINK (Con href sanitizado) */}
            {payingTransaction.paymentLink && (
              <a 
                href={getSafeLink(payingTransaction.paymentLink)} // <--- Aquí usamos la función
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-surface border border-primary text-primary hover:bg-primary hover:text-white font-bold py-2.5 rounded-xl mb-4 transition-all"
              >
                <ExternalLink size={18} />
                Ir a Pagar Servicio
              </a>
            )}
            
            <form onSubmit={confirmPay} className="space-y-4">
              <div>
                <label className="block text-xs text-textMuted/70 mb-1 ml-1 uppercase tracking-wider font-bold">Monto Final</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-textMuted">$</span>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    className="input-pro pl-8 font-mono text-lg bg-void border-primary/30 focus:border-primary"
                    value={paymentAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full shadow-glow">
                Confirmar y Pagar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FixedExpensesCard;