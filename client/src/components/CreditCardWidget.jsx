import { useState, useEffect } from 'react';
import { CreditCard, CalendarClock } from 'lucide-react';
import api from '../api/axios';

const CreditCardWidget = ({ isPrivacyMode, refreshTrigger }) => {
  const [data, setData] = useState({ totalDebt: 0, nextMonthBill: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjection = async () => {
      try {
        const res = await api.get('/transactions/projection');
        if (res.data.success) {
            setData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching credit projection", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjection();
  }, [refreshTrigger]); // Re-fetch when transactions change

  const formatMoney = (amount) => {
    if (isPrivacyMode) return '****';
    // Amount is in cents, assuming backend returns cents as calculation base was cents
    // Wait, backend: totalDebt += remainingInstallments * monthlyAmount
    // monthlyAmount = amount (cents) / installments.
    // So result is in cents.
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(data.totalDebt ? amount / 100 : 0); // Handle 0
  };

  // Need separate formatting for nextMonthBill
  const formatValue = (val) => {
     if (isPrivacyMode) return '****';
     return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val / 100);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-card flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <CreditCard size={100} />
      </div>

      <div className="flex items-center gap-3 mb-4 z-10">
        <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <CreditCard size={24} />
        </div>
        <h3 className="text-lg font-bold text-white font-heading">Tarjeta de Crédito</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 z-10">
        {/* Total Debt */}
        <div className="bg-surfaceHighlight/30 p-4 rounded-2xl border border-transparent hover:border-primary/20 transition-colors">
            <p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">Deuda Total</p>
            <p className="text-2xl font-mono font-bold text-white">
                {loading ? '...' : formatValue(data.totalDebt)}
            </p>
        </div>

        {/* Next Month Bill */}
        <div className="bg-surfaceHighlight/30 p-4 rounded-2xl border border-transparent hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-1 mb-1">
                 <CalendarClock size={12} className="text-primary" />
                 <p className="text-textMuted text-xs font-bold uppercase tracking-wider">Próx. Resumen</p>
            </div>
            <p className="text-2xl font-mono font-bold text-rose-400">
                {loading ? '...' : formatValue(data.nextMonthBill)}
            </p>
        </div>
      </div>
    </div>
  );
};

export default CreditCardWidget;