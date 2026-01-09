import { Trash2 } from 'lucide-react';
import api from '../api/axios';

const TransactionList = ({ transactions, onTransactionUpdated }) => {

  // FILTRO: Solo mostramos lo que ya está COMPLETED
  const historyData = transactions.filter(t => t.status === 'COMPLETED');

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
            <span className="text-3xl mb-2">📜</span>
            <p>Historial vacío</p>
          </div>
        ) : (
          historyData.map((t) => (
            <div 
              key={t._id} 
              className="group bg-surfaceHighlight/30 hover:bg-surfaceHighlight border border-transparent hover:border-border p-4 rounded-2xl flex justify-between items-center transition-all duration-200 animate-fade-in"
            >
              {/* IZQUIERDA */}
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    t.type === 'INCOME' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {t.type === 'INCOME' ? '↓' : '↑'}
                </div>
                
                <div>
                  <p className="font-bold text-white text-sm md:text-base leading-tight">{t.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-textMuted bg-surface px-2 py-0.5 rounded-md border border-border">
                        {t.category}
                    </span>
                    <span className="text-[10px] text-textMuted/60">{formatDate(t.date)}</span>
                  </div>
                </div>
              </div>

              {/* DERECHA */}
              <div className="text-right flex flex-col items-end">
                <span className={`font-mono font-bold text-sm md:text-base ${
                    t.type === 'INCOME' ? 'text-emerald-400' : 'text-textMain'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'}${formatMoney(t.amount)}
                </span>
                
                <button 
                  onClick={() => handleDelete(t._id)}
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