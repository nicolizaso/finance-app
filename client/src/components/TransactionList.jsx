import { Trash2, TrendingUp, TrendingDown, Clock, Check, FileText, CreditCard, AlertCircle } from 'lucide-react'; // <--- Iconos
import api from '../api/axios';

const TransactionList = ({ transactions, onTransactionUpdated, isPrivacyMode, onTransactionClick }) => {

  const historyData = transactions; // .filter(t => t.status === 'COMPLETED'); // <-- MODIFICADO: Mostrar todo para ver lo pendiente
  const formatMoney = (amount) => Math.round(amount / 100).toLocaleString('es-AR');
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar del historial?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      if (onTransactionUpdated) onTransactionUpdated(); 
    } catch (error) { console.error(error); }
  };

  return (
      <div className="space-y-3">
        {historyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-textMuted opacity-50 border-2 border-dashed border-border rounded-2xl">
            <FileText size={32} className="mb-2" />
            <p>Historial vacío</p>
          </div>
        ) : (
          historyData.map((t) => (
            <div 
              key={t._id} 
              onClick={() => onTransactionClick && onTransactionClick(t)}
              className={`group relative p-4 rounded-2xl flex justify-between items-center transition-all duration-200 animate-fade-in cursor-pointer
                ${t.needsReview
                    ? 'bg-orange-500/10 hover:bg-orange-500/20 border-l-4 border-orange-500'
                    : 'bg-surfaceHighlight/30 hover:bg-surfaceHighlight border border-transparent hover:border-border'
                }
              `}
            >
              {/* Indicador de revisión */}
              {t.needsReview && (
                  <div className="absolute -top-1 -right-1">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                  </div>
              )}

              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.needsReview
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : t.type === 'INCOME'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : t.paymentMethod === 'CREDIT'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' // Color distinto para tarjeta
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {/* Iconos de Tendencia en lugar de flechas de texto */}
                  {t.needsReview ? <AlertCircle size={18} /> :
                    (t.type === 'INCOME' ? <TrendingUp size={18} />
                    : t.paymentMethod === 'CREDIT' ? <CreditCard size={18} />
                    : <TrendingDown size={18} />)
                  }
                </div>
                
                <div>
                  <p className={`font-bold text-sm md:text-base leading-tight ${t.needsReview ? 'text-orange-200' : 'text-white'}`}>
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-textMuted bg-surface px-2 py-0.5 rounded-md border border-border">
                        {t.category}
                    </span>
                    <span className="text-[10px] text-textMuted/60">{formatDate(t.date)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className={`font-mono font-bold text-sm md:text-base ${
                    t.type === 'INCOME' ? 'text-emerald-400' : 'text-textMain'
                } ${isPrivacyMode ? 'blur-sm' : ''}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${isPrivacyMode ? '***' : formatMoney(t.amount)}
                </span>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(t._id); }}
                  className="mt-1 opacity-0 group-hover:opacity-100 text-rose-500/50 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
  );
};

export default TransactionList;