import { Trash2 } from 'lucide-react';
import api from './api/axios';

// Recibimos 'transactions' (datos) y 'onTransactionUpdated' (función para recargar)
const TransactionList = ({ transactions, onTransactionUpdated }) => {

  // --- LÓGICA DE VISUALIZACIÓN ---
  const formatMoney = (amount) => (amount / 100).toFixed(2);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  // --- LÓGICA DE ACCIONES (Pagar y Borrar) ---
  
  // 1. Marcar como PAGADO
  // Función para marcar como pagado (Con confirmación de monto)
  const handleMarkAsPaid = async (t) => {
    // 1. Calculamos el valor actual en decimales para mostrárselo al usuario
    const currentAmount = (t.amount / 100).toFixed(2);
    
    // 2. Pedimos confirmación del monto real
    const realAmountStr = window.prompt(
      `Confirmar pago de: ${t.description}\n\n¿Cuál es el monto final?`, 
      currentAmount
    );

    // Si el usuario cancela, no hacemos nada
    if (realAmountStr === null) return;

    // 3. Validamos que sea un número
    const realAmount = parseFloat(realAmountStr);
    if (isNaN(realAmount) || realAmount <= 0) {
      alert("Por favor ingresa un monto válido");
      return;
    }

    try {
      // 4. Actualizamos: Estado COMPLETED y el Monto Final (en centavos)
      await api.put(`/transactions/${t._id}`, {
        ...t, 
        amount: realAmount * 100, // Guardamos el nuevo monto confirmado
        status: 'COMPLETED' 
      });
      if (onTransactionUpdated) onTransactionUpdated();
    } catch (error) {
      console.error("Error actualizando:", error);
    }
  };

  // 2. BORRAR transacción
  const handleDelete = async (id) => {
    if(!window.confirm('¿Seguro que quieres borrar esto?')) return;
    
    try {
      await api.delete(`transactions/${id}`);
      // Avisamos al padre (App) que recargue
      if (onTransactionUpdated) onTransactionUpdated(); 
    } catch (error) {
      console.error("Error borrando:", error);
    }
  };

  return (
    <div className="mt-8 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-300 mb-4 px-2">Historial Reciente</h3>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-xl border border-dashed border-gray-600">
            <p className="text-gray-400">No hay movimientos aún</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div 
              key={t._id} 
              className="bg-gray-800 p-4 rounded-xl flex justify-between items-center shadow-md border-l-4 border-transparent hover:border-blue-500 transition-all"
            >
              {/* --- LADO IZQUIERDO: Icono y Texto --- */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20 ${t.type === 'INCOME' ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-400'}`}>
                  {t.type === 'INCOME' ? '💰' : '💸'}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{t.description}</p>
                  
                  {/* Fecha y Badge de Pendiente */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{formatDate(t.date)} • {t.category}</p>
                    {t.status === 'PENDING' && (
                        <span className="bg-yellow-900 text-yellow-200 text-[10px] px-2 py-0.5 rounded-full border border-yellow-700">
                        ⏳ Pendiente
                        </span>
                    )}
                  </div>
                </div>
              </div>

              {/* --- LADO DERECHO: Precio y Botones (Aquí hicimos el cambio) --- */}
              <div className="flex flex-col items-end gap-1">
                {/* 1. El Precio */}
                <p className={`font-mono font-bold ${t.type === 'INCOME' ? 'text-green-400' : 'text-white'} ${t.status === 'PENDING' ? 'opacity-50' : ''}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${formatMoney(t.amount)}
                </p>
                
                {/* 2. Los Botones (Pagar y Borrar) */}
                <div className="flex gap-2 mt-1">
                  
                  {/* Botón PAGAR (Solo se muestra si está pendiente) */}
                  {t.status === 'PENDING' && (
                    <button 
                      onClick={() => handleMarkAsPaid(t)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors font-semibold"
                    >
                      ✓ Pagar
                    </button>
                  )}
                  
                  {/* Botón BORRAR (Siempre visible) */}
                  <button 
                    onClick={() => handleDelete(t._id)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    title="Borrar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;