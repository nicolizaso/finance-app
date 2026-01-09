import { useState, useEffect } from 'react';
import api from './api/axios';

// Componentes
import PinScreen from './components/PinScreen';
import BalanceCard from './components/BalanceCard';
import ExpenseChart from './components/ExpenseChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FixedExpenseForm from './components/FixedExpenseForm';

function App() {
  const [isLocked, setIsLocked] = useState(true); // Estado de seguridad
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFixedForm, setShowFixedForm] = useState(false);

  // Carga inicial de datos
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Error datos:", error);
    }
  };

  useEffect(() => {
    if (!isLocked) fetchTransactions();
  }, [refreshKey, isLocked]);

  // Generador automático de gastos fijos
  useEffect(() => {
    if (!isLocked) {
      const checkRecurring = async () => {
        try {
          await api.post('/fixed-expenses/generate');
          handleRefresh();
        } catch (error) { console.error(error); }
      };
      checkRecurring();
    }
  }, [isLocked]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Si está bloqueado, mostrar pantalla de PIN
  if (isLocked) {
    return <PinScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-void p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              Finanz<span className="text-primary">Apps</span>
            </h1>
            <p className="text-gray-500 text-sm">Tu universo financiero</p>
          </div>
          <div 
            onClick={() => setIsLocked(true)}
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-lg cursor-pointer hover:border-primary transition-colors"
          >
            🔒
          </div>
        </header>

        {/* --- BENTO GRID --- */}
        {/* Layout Master: 12 columnas en escritorio, 1 en móvil */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* === BLOQUE PRINCIPAL (Izquierda - 8/12) === */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Fila 1: Balance + Acceso Rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance (Ocupa 2 espacios) */}
              <div className="md:col-span-2 bg-surface border border-border rounded-3xl p-1 overflow-hidden shadow-2xl shadow-black/50">
                <BalanceCard transactions={transactions} />
              </div>

              {/* Botón Gastos Fijos (Ocupa 1 espacio) */}
              <button 
                onClick={() => setShowFixedForm(!showFixedForm)}
                className="bg-surface border border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-surfaceHighlight hover:border-primary/50 transition-all group active:scale-95"
              >
                <div className="w-14 h-14 bg-void rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner shadow-primary/20">
                  ⚙️
                </div>
                <div className="text-center">
                  <span className="block font-bold text-neon">Fijos</span>
                  <span className="text-xs text-gray-500">Configurar</span>
                </div>
              </button>
            </div>

            {/* Formulario Desplegable */}
            {showFixedForm && (
              <div className="animate-fade-in bg-surface border border-border rounded-3xl p-6 relative">
                <button 
                  onClick={() => setShowFixedForm(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >✕</button>
                <FixedExpenseForm onClose={() => setShowFixedForm(false)} onSaved={handleRefresh} />
              </div>
            )}

            {/* Fila 2: Gráfico + Carga (Mitad y Mitad) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Gráfico */}
              <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col min-h-[320px]">
                <ExpenseChart transactions={transactions} />
              </div>

              {/* Formulario de Carga */}
              <div className="bg-surface border border-border rounded-3xl p-1 h-full">
                <TransactionForm onTransactionAdded={handleRefresh} />
              </div>
            </div>

          </div>

          {/* === BLOQUE LATERAL (Derecha - 4/12) === */}
          <div className="lg:col-span-4">
            <div className="bg-surface border border-border rounded-3xl p-6 h-[calc(100vh-140px)] lg:sticky lg:top-6 flex flex-col shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <h3 className="font-heading text-xl font-bold text-white">Historial</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <TransactionList 
                  transactions={transactions} 
                  onTransactionUpdated={handleRefresh} 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App;