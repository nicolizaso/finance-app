import { useState, useEffect } from 'react'; // <--- ESTA ES LA LÍNEA QUE FALTABA
import api from './api/axios';
import { User, Lock, History, LogOut, Eye, EyeOff } from 'lucide-react';

// Componentes
import UserScreen from './components/UserScreen';
import PinScreen from './components/PinScreen';
import BalanceCard from './components/BalanceCard';
import ExpenseChart from './components/ExpenseChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FixedExpenseForm from './components/FixedExpenseForm';
import FixedExpensesCard from './components/FixedExpensesCard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // Datos
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFixedForm, setShowFixedForm] = useState(false);

  // 1. Al iniciar, chequeamos si hay usuario guardado en localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('finanzapp_user');
    if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsLocked(true); // Si recarga, pedimos PIN de nuevo por seguridad
    } else {
        setCurrentUser(null);
        setIsLocked(true);
    }
  }, []);

  // 2. Función Login exitoso
  const handleLoginSuccess = (user) => {
      setCurrentUser(user);
      setIsLocked(false);
      setRefreshKey(prev => prev + 1); // Forzar carga de datos
  };

  // 3. Función Logout (Cambiar usuario)
  const handleLogout = () => {
      localStorage.removeItem('finanzapp_user');
      setCurrentUser(null);
      setIsLocked(true);
      setTransactions([]); // Limpiar datos en memoria
  };

  // Carga de datos (Solo si está desbloqueado)
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { 
      if (!isLocked && currentUser) fetchTransactions(); 
  }, [refreshKey, isLocked, currentUser]);

  // Generador recurrente
  useEffect(() => {
    if (!isLocked && currentUser) {
      const checkRecurring = async () => {
        try { await api.post('/fixed-expenses/generate'); handleRefresh(); } catch (e) {}
      };
      checkRecurring();
    }
  }, [isLocked, currentUser]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // --- RENDERIZADO CONDICIONAL DE PANTALLAS ---

  // A. Si no hay usuario seleccionado -> USER SCREEN
  if (!currentUser) {
      return <UserScreen onUserSubmit={(name) => setCurrentUser({ username: name })} />;
  }

  // B. Si hay usuario pero está bloqueado -> PIN SCREEN
  if (isLocked) {
      return (
        <PinScreen 
            username={currentUser.username} 
            onLoginSuccess={handleLoginSuccess}
            onBack={handleLogout}
        />
      );
  }

  // C. Si está todo OK -> DASHBOARD
  return (
    <div className="min-h-screen bg-void p-4 md:p-6 lg:p-8 font-sans pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-11 h-11 rounded-full border-2 border-primary/30 object-contain shadow-glow bg-surface" />
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tighter">
                Finanz<span className="text-primary drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">App</span>
              </h1>
              <p className="text-textMuted text-xs font-medium tracking-wide mt-0.5 uppercase">
                Hola, {currentUser.name}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPrivacyMode(!isPrivacyMode)}
              className={`w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center transition-all active:scale-95 ${isPrivacyMode ? 'text-primary border-primary shadow-glow' : 'text-textMuted hover:text-white hover:border-primary'}`}
              title="Modo Privacidad"
            >
              {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button 
                onClick={handleLogout}
                className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted hover:text-rose-400 hover:border-rose-500 transition-all active:scale-95"
                title="Cerrar Sesión"
            >
               <LogOut size={20} />
            </button>
            <button 
              onClick={() => setIsLocked(true)}
              className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted hover:text-white hover:border-primary hover:shadow-glow transition-all active:scale-95"
              title="Bloquear"
            >
              <Lock size={20} />
            </button>
          </div>
        </header>

        {/* MODAL CONFIG */}
        {showFixedForm && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="w-full max-w-md bg-surface border border-primary/50 rounded-3xl p-6 relative shadow-glow">
                    <button onClick={() => setShowFixedForm(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">✕</button>
                    <FixedExpenseForm onClose={() => setShowFixedForm(false)} onSaved={handleRefresh} />
                </div>
            </div>
        )}

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COL */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* ROW 1: BALANCE */}
            <div className="min-h-[220px]">
              <BalanceCard transactions={transactions} isPrivacyMode={isPrivacyMode} />
            </div>

            {/* ROW 2: GASTOS FIJOS Y CARGA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <FixedExpensesCard 
                    transactions={transactions} 
                    onRefresh={handleRefresh}
                    onOpenConfig={() => setShowFixedForm(true)}
                    isPrivacyMode={isPrivacyMode}
                />
                <div className="h-full">
                  <TransactionForm onTransactionAdded={handleRefresh} />
                </div>
            </div>

            {/* ROW 3: GRÁFICO */}
            <div className="h-[300px]">
                <ExpenseChart transactions={transactions} isPrivacyMode={isPrivacyMode} />
            </div>
          </div>

          {/* RIGHT COL: HISTORIAL */}
          <div className="lg:col-span-4">
            <div className="bento-card h-[600px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-6 flex flex-col p-0 border-primary/10">
              <div className="p-6 border-b border-border bg-surfaceHighlight/20 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="text-neon" size={20} />
                  Historial (Pagados)
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <TransactionList transactions={transactions} onTransactionUpdated={handleRefresh} isPrivacyMode={isPrivacyMode} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;