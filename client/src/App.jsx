import { useState, useEffect } from 'react';
import axios from 'axios';

// Importación de Componentes
import BalanceCard from './components/BalanceCard';
import ExpenseChart from './components/ExpenseChart';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Lógica de carga de datos (El Cerebro)
  const fetchTransactions = async () => {
    try {
      // Usamos 127.0.0.1 para evitar problemas de red en Windows
      const res = await axios.get('http://127.0.0.1:3000/api/transactions');
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  // 2. Efecto: Recargar cuando cambie refreshKey
  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  // 3. Función interruptor para recargar datos desde los hijos
  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto"> {/* Aumenté el ancho máximo a 6xl para que quepa mejor el gráfico */}
        
        {/* --- HEADER --- */}
        <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
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

        {/* --- SECCIÓN 1: BALANCE GLOBAL --- */}
        <BalanceCard transactions={transactions} />

        {/* --- SECCIÓN 2: GRID PRINCIPAL --- */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: Visualización e Ingreso */}
          <div className="space-y-6">
            
            {/* A. Gráfico de Gastos (Nuevo) */}
            <ExpenseChart transactions={transactions} />
            
            {/* B. Formulario de Carga */}
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
            
          </div>

          {/* COLUMNA DERECHA: Historial */}
          <div className="lg:sticky lg:top-8"> {/* Sticky para que el historial te siga al bajar */}
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