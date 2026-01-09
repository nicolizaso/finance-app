import { useState, useEffect } from 'react';
import api from './api/axios';

// Componentes
import PinScreen from './components/PinScreen';
import BalanceCard from './components/BalanceCard';
import ExpenseChart from './components/ExpenseChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FixedExpenseForm from './components/FixedExpenseForm';
import FixedExpensesCard from './components/FixedExpensesCard'; // <--- IMPORTANTE

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFixedForm, setShowFixedForm] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { if (!isLocked) fetchTransactions(); }, [refreshKey, isLocked]);

  useEffect(() => {
    if (!isLocked) {
      const checkRecurring = async () => {
        try { await api.post('/fixed-expenses/generate'); handleRefresh(); } catch (e) {}
      };
      checkRecurring();
    }
  }, [isLocked]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  if (isLocked) return <PinScreen onUnlock={() => setIsLocked(false)} />;

  return (
    <div className="min-h-screen bg-void p-4 md:p-6 lg:p-8 font-sans pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-2">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tighter">
              Finanz<span className="text-primary drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">Apps</span>
            </h1>
            <p className="text-textMuted text-xs font-medium tracking-wide mt-0.5">DASHBOARD</p>
          </div>
          <button 
            onClick={() => setIsLocked(true)}
            className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted hover:text-white hover:border-primary hover:shadow-glow transition-all active:scale-95"
          >
            🔒
          </button>
        </header>

        {/* MODAL/DROPDOWN DE CONFIGURACIÓN (Ahora flota sobre el contenido si está activo) */}
        {showFixedForm && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-md bg-surface border border-primary/50 rounded-3xl p-6 relative shadow-glow">
                    <button 
                        onClick={() => setShowFixedForm(false)} 
                        className="absolute top-4 right-4 text-textMuted hover:text-white"
                    >✕</button>
                    <FixedExpenseForm onClose={() => setShowFixedForm(false)} onSaved={handleRefresh} />
                </div>
            </div>
        )}

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* === COLUMNA IZQUIERDA (Principal) === */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* FILA 1: Balance (Arriba de todo) */}
            <div className="h-[200px]">
                <BalanceCard transactions={transactions} />
            </div>

            {/* FILA 2: Gastos Fijos (Lista Activa) + Formulario de Carga */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                {/* Nueva Tarjeta de Gastos Fijos Pendientes */}
                <FixedExpensesCard 
                    transactions={transactions} 
                    onRefresh={handleRefresh}
                    onOpenConfig={() => setShowFixedForm(true)}
                />

                {/* Formulario para gastos manuales */}
                <TransactionForm onTransactionAdded={handleRefresh} />
            </div>

            {/* FILA 3: Gráfico (Ancho completo para cerrar) */}
            <div className="h-[300px]">
                <ExpenseChart transactions={transactions} />
            </div>
          </div>

          {/* === COLUMNA DERECHA (Historial) === */}
          <div className="lg:col-span-4">
            <div className="bento-card h-[600px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-6 flex flex-col p-0 border-primary/10">
              <div className="p-6 border-b border-border bg-surfaceHighlight/20 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon shadow-[0_0_10px_#d8b4fe]"></span>
                  Historial (Pagados)
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <TransactionList transactions={transactions} onTransactionUpdated={handleRefresh} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;