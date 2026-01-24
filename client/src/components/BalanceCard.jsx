import { useMemo } from 'react';

const BalanceCard = ({ stats, isPrivacyMode }) => {
  // Función auxiliar para formatear: de centavos a entero con puntos
  const format = (val) => Math.round(val / 100).toLocaleString('es-AR');

  const displayStats = useMemo(() => {
      if (!stats) return { income: '0', expense: '0', total: '0' };
      return {
          income: format(stats.income),
          expense: format(stats.expense),
          total: format(stats.total)
      };
  }, [stats]);

  return (
    <div className="bento-card h-full flex flex-col justify-between group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <h2 className="text-textMuted text-sm font-medium uppercase tracking-wider mb-1">Saldo Total</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-5xl font-bold text-white tracking-tight">$</span>
          <span className={`text-4xl sm:text-6xl font-bold text-white tracking-tight ${isPrivacyMode ? 'blur-sm' : ''}`}>
             {isPrivacyMode ? '*****' : displayStats.total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
        <div className="bg-surfaceHighlight/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            <span className="text-xs text-textMuted font-bold">Ingresos</span>
          </div>
          <p className={`text-lg font-bold text-emerald-400 ${isPrivacyMode ? 'blur-sm' : ''}`}>
            +${isPrivacyMode ? '***' : displayStats.income}
          </p>
        </div>

        <div className="bg-surfaceHighlight/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
            <span className="text-xs text-textMuted font-bold">Gastos</span>
          </div>
          <p className={`text-lg font-bold text-rose-500 ${isPrivacyMode ? 'blur-sm' : ''}`}>
            -${isPrivacyMode ? '***' : displayStats.expense}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
