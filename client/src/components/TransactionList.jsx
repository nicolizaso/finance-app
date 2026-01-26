import { Trash2, TrendingUp, TrendingDown, Clock, Check, FileText, CreditCard, AlertCircle, X, Users } from 'lucide-react';
import api from '../api/axios';
import { useState } from 'react';
import { getEffectiveAmount } from '../utils/financeHelpers';
import { Virtuoso } from 'react-virtuoso';

const TransactionList = ({ transactions, onTransactionUpdated, isPrivacyMode, onTransactionClick }) => {
  const [selectedTag, setSelectedTag] = useState(null);

  const historyData = selectedTag
    ? transactions.filter(t => t.tags && t.tags.includes(selectedTag))
    : transactions;

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

  // Item renderer for Virtuoso
  const itemContent = (index, t) => {
      return (
        <div className="px-4 py-2">
            <div 
              onClick={() => onTransactionClick && onTransactionClick(t)}
              className={`group relative p-4 rounded-2xl flex justify-between items-center transition-all duration-200 cursor-pointer overflow-hidden
                ${t.needsReview
                    ? 'bg-orange-500/10 hover:bg-orange-500/20 border-l-4 border-orange-500'
                    : 'bg-slate-700/30 hover:bg-slate-700 border border-transparent hover:border-slate-600'
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

              <div className="flex items-center gap-4 overflow-hidden flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.needsReview
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : t.type === 'INCOME'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : t.paymentMethod === 'CREDIT'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {t.needsReview ? <AlertCircle size={18} /> :
                    (t.type === 'INCOME' ? <TrendingUp size={18} />
                    : t.paymentMethod === 'CREDIT' ? <CreditCard size={18} />
                    : <TrendingDown size={18} />)
                  }
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className={`font-bold text-sm md:text-base leading-tight truncate ${t.needsReview ? 'text-orange-200' : 'text-white'}`}>
                    {t.description}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    {t.isShared && (
                         <div className="flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded w-fit">
                            <Users size={10} />
                            <span>Compartido</span>
                         </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 whitespace-nowrap">
                            {t.category}
                        </span>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{formatDate(t.date)}</span>
                    </div>
                    {t.tags && t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {t.tags.map(tag => (
                                <span
                                    key={tag}
                                    onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                                    className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full hover:bg-indigo-500/30 cursor-pointer whitespace-nowrap"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end shrink-0 ml-2">
                <span className={`font-mono font-bold text-sm md:text-base ${
                    t.type === 'INCOME' ? 'text-teal-400' : 'text-slate-50'
                } ${isPrivacyMode ? 'blur-sm' : ''}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${isPrivacyMode ? '***' : formatMoney(t.amount)}
                </span>
                
                {t.isShared && (
                    <div className="flex flex-col items-end mt-1">
                        {t.totalAmount ? (
                             <>
                                {t.paidBy && (
                                     <span className="text-[10px] text-slate-400/80 mb-0.5 whitespace-nowrap">
                                        Pagado por: <strong className="text-white">{t.paidBy.name || 'Otro'}</strong>
                                     </span>
                                )}
                                <span className="text-[10px] text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                                    Total: ${isPrivacyMode ? '***' : formatMoney(t.totalAmount)}
                                </span>
                             </>
                        ) : (
                             <span className="text-[10px] text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
                                Tu parte: ${isPrivacyMode ? '***' : formatMoney(getEffectiveAmount(t))}
                            </span>
                        )}
                    </div>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(t._id); }}
                  className="mt-1 opacity-0 group-hover:opacity-100 text-rose-500/50 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
        </div>
      );
  };

  return (
      <div className="h-full flex flex-col">
        {selectedTag && (
            <div className="flex items-center gap-2 mb-2 px-4 pt-2 shrink-0">
                <span className="text-xs text-slate-400">Filtrado por:</span>
                <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {selectedTag}
                    <button onClick={() => setSelectedTag(null)} className="hover:text-white"><X size={12} /></button>
                </span>
            </div>
        )}

        {historyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-50 border-2 border-dashed border-slate-700 rounded-2xl mx-4 mt-2">
            <FileText size={32} className="mb-2" />
            <p>Historial vacío</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 pt-2">
             <Virtuoso
                data={historyData}
                itemContent={itemContent}
                computeItemKey={(index, item) => item._id}
                className="custom-scrollbar"
                style={{ height: '100%' }}
             />
          </div>
        )}
      </div>
  );
};

export default TransactionList;
