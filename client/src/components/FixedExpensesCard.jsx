import { useMemo } from 'react';
import api from '../api/axios';

const FixedExpensesCard = ({ transactions, onRefresh, onOpenConfig }) => {
  
  const pendingExpenses = useMemo(() => {
    return transactions
      .filter(t => t.status === 'PENDING' && t.type === 'EXPENSE')
      // LÓGICA DE ORDENAMIENTO: Fecha más antigua (menor) primero
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions]);

  const totalDebt = useMemo(() => {
    return pendingExpenses.reduce((acc, t) => acc + t.amount, 0);
  }, [pendingExpenses]);

  const formatMoney = (amount) => Math.round(amount / 100).toLocaleString('es-AR');

  const handlePay = async (t) => {
    const currentAmount = (t.amount / 100).toFixed(2);
    const realAmountStr = window.prompt(`Pagar: ${t.description}\n\n¿Monto final?`, currentAmount);
    
    if (realAmountStr === null) return;
    const realAmount = parseFloat(realAmountStr);
    
    if (isNaN(realAmount) || realAmount <= 0) {
        alert("Monto inválido"); return;
    }

    try {
      await api.put(`/transactions/${t._id}`, { 
          ...t, 
          amount: realAmount * 100, 
          status: 'COMPLETED' 
      });
      onRefresh(); 
    } catch (error) { console.error(error); }
  };

  return (
    <div className="bento-card h-full flex flex-col w-full">
      
      {/* Header Fijo */}
      <div className="flex justify-between items-start mb-4 border-b border-border pb-3 shrink-0">
        <div>
          <h3 className="text-white font-bold font-heading text-lg flex items-center gap-2">
            <span className="text-xl">📅</span> Gastos del Mes
          </h3>
          <p className="text-textMuted text-xs mt-1">
            Por pagar: <span className="text-rose-400 font-mono font-bold">${formatMoney(totalDebt)}</span>
          </p>
        </div>
        
        <button 
          onClick={onOpenConfig}
          className="bg-surfaceHighlight p-2 rounded-xl text-textMuted hover:text-white hover:bg-primary/20 transition-all"
          title="Configurar Gastos Fijos"
        >
          ⚙️
        </button>
      </div>

      {/* LISTA SCROLLEABLE (Con límite de altura) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[250px]">
        {pendingExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-2xl mb-2 animate-bounce">🎉</div>
             <p className="text-textMuted text-sm font-medium">¡Estás al día!</p>
             <p className="text-textMuted/50 text-xs">Sin deudas pendientes.</p>
          </div>
        ) : (
          pendingExpenses.map(t => (
            <div key={t._id} className="flex justify-between items-center bg-surfaceHighlight/30 p-3 rounded-xl border border-transparent hover:border-primary/30 transition-all group shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handlePay(t)}
                  className="w-6 h-6 rounded-full border-2 border-textMuted/50 hover:border-primary hover:bg-primary/20 flex items-center justify-center transition-all shrink-0"
                  title="Marcar como pagado"
                >
                  <div className="w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{t.description}</p>
                  <p className="text-textMuted text-[10px]">Vence: {new Date(t.date).getDate()}/{new Date().getMonth()+1}</p>
                </div>
              </div>

              <span className="font-mono text-white font-bold text-sm whitespace-nowrap ml-2">
                ${formatMoney(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FixedExpensesCard;