import { Trash2 } from 'lucide-react';
import api from '../api/axios';

const TransactionList = ({ transactions, onTransactionUpdated }) => {

  // NUEVO FORMATO: Redondeado y con puntos de mil
  const formatMoney = (amount) => Math.round(amount / 100).toLocaleString('es-AR');
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const handleMarkAsPaid = async (t) => {
    // Al pagar, mostramos el valor exacto actual para que el usuario sepa
    const currentAmount = (t.amount / 100).toFixed(2);
    const realAmountStr = window.prompt(`Confirmar pago de: ${t.description}\n\nMonto final:`, currentAmount);
    
    if (realAmountStr === null) return;
    
    const realAmount = parseFloat(realAmountStr);
    if (isNaN(realAmount) || realAmount <= 0) { alert("Monto inválido"); return; }

    try {
      await api.put(`/transactions/${t._id}`, { ...t, amount: realAmount * 100, status: 'COMPLETED' });
      if (onTransactionUpdated) onTransactionUpdated(); 
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      if (onTransactionUpdated) onTransactionUpdated(); 
    } catch (error) { console.error(error); }
  };

  return (
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-textMuted opacity-50 border-2 border-dashed border-border rounded-2xl">
            <span className="text-3xl mb-2">💸</span>
            <p>Sin movimientos</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div 
              key={t._id} 
              className="group bg-surfaceHighlight/30 hover:bg-surfaceHighlight border border-transparent hover:border-border p-4 rounded-2xl flex justify-between items-center transition-all duration-200 animate-fade-in"
            >
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
                    <span className="text-[11px] text-textMuted bg-surface px-2 py-0.5 rounded-md border border-border">
                        {t.category}
                    </span>
                    <span className="text-[11px] text-textMuted/60">{formatDate(t.date)}</span>
                    {t.status === 'PENDING' && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-1.5 rounded">
                           ⏳
                        </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className={`font-mono font-bold text-sm md:text-base ${
                    t.type === 'INCOME' ? 'text-emerald-400' : 'text-textMain'
                } ${t.status === 'PENDING' ? 'opacity-60' : ''}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${formatMoney(t.amount)}
                </span>

                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.status === 'PENDING' && (
                    <button onClick={() => handleMarkAsPaid(t)} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary hover:text-white transition-colors" title="Pagar">
                      ✓
                    </button>
                  )}
                  <button onClick={() => handleDelete(t._id)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500 hover:text-white transition-colors" title="Borrar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
  );
};

export default TransactionList;