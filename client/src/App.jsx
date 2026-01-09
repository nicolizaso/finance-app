import { useState, useEffect } from 'react';
import api from './api/axios';

// Importación de Componentes
import BalanceCard from './components/BalanceCard';
import ExpenseChart from './components/ExpenseChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import FixedExpenseForm from './components/FixedExpenseForm'; // <--- Importado

function App() {
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFixedForm, setShowFixedForm] = useState(false); // <--- Estado para mostrar/ocultar

  // 1. Lógica de carga de datos (El Cerebro)
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions'); 
    setTransactions(res.data.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  // 2. Efecto: Recargar cuando cambie refreshKey
  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  // 3. NUEVO EFECTO: Generar gastos recurrentes automáticos al iniciar
  useEffect(() => {
    const checkRecurring = async () => {
      try {
        // Pedimos al backend que verifique si hay que crear gastos de este mes
        await api.post('/fixed-expenses/generate');
        // Si generó algo nuevo, recargamos la lista
        handleTransactionAdded(); 
      } catch (error) {
        console.error("Error generando fijos:", error);
      }
    };
    checkRecurring();
  }, []); // Array vacío = Se ejecuta solo una vez al abrir la app

  // 4. Función interruptor para recargar datos desde los hijos
  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-4 flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-500 tracking-tight">
              Finanzas Vector
            </h1>
            <p className="text-gray-400 text-sm mt-1">Panel de Control Inteligente</p>
          </div>
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xl cursor-default" title="Usuario">
            👤
          </div>
        </header>

        {/* --- NUEVO: BARRA DE HERRAMIENTAS --- */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowFixedForm(!showFixedForm)}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
          >
            {showFixedForm ? 'Cancelar Configuración' : '⚙️ Configurar Gastos Fijos'}
          </button>
        </div>

        {/* --- NUEVO: FORMULARIO DESPLEGABLE --- */}
        {showFixedForm && (
            <FixedExpenseForm 
                onClose={() => setShowFixedForm(false)} 
                onSaved={handleTransactionAdded} 
            />
        )}

        {/* --- SECCIÓN 1: BALANCE GLOBAL --- */}
        <BalanceCard transactions={transactions} />

        {/* --- SECCIÓN 2: GRID PRINCIPAL --- */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: Visualización e Ingreso */}
          <div className="space-y-6">
            
            {/* A. Gráfico de Gastos */}
            <ExpenseChart transactions={transactions} />
            
            {/* B. Formulario de Carga */}
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
            
          </div>

          {/* COLUMNA DERECHA: Historial */}
          <div className="lg:sticky lg:top-8">
            <TransactionList 
              transactions={transactions} 
              onTransactionUpdated={handleTransactionAdded} 
            />
          </div>

        </div>

      </div>
    </div>
  )
}

export default App;