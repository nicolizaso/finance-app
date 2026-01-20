import { useState, useEffect } from 'react';
import api from './api/axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componentes
import UserScreen from './components/UserScreen';
import PinScreen from './components/PinScreen';
import Layout from './components/Layout';
import AchievementsModal from './components/AchievementsModal';
import confetti from 'canvas-confetti';

// Vistas (New Views)
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import StatsView from './views/StatsView';
import WealthView from './views/WealthView';
import PlanningView from './views/PlanningView';
import CalendarView from './views/CalendarView';
import SavingsView from './views/SavingsView';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Datos
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para Moneda
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedCurrencyRate, setSelectedCurrencyRate] = useState('Blue'); // Default

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

    // Cargar preferencia de moneda
    const savedRate = localStorage.getItem('finanzapp_currency_rate');
    if (savedRate) setSelectedCurrencyRate(savedRate);

    // Fetch Cotizaciones
    fetch('https://dolarapi.com/v1/dolares')
      .then(res => res.json())
      .then(data => {
        // Transformar array a objeto para acceso fácil
        // data es array de objetos con { casa: "oficial" | "blue" | "bolsa" (MEP), ... }
        const rates = {};
        data.forEach(item => {
            // Mapeo de nombres API a nuestras claves
            if (item.casa === 'oficial') rates.Official = item;
            if (item.casa === 'blue') rates.Blue = item;
            if (item.casa === 'bolsa') rates.MEP = item;
        });
        setExchangeRates(rates);
      })
      .catch(err => console.error("Error fetching rates:", err));
  }, []);

  // Guardar preferencia de moneda
  const updateCurrencyRate = (rateName) => {
      setSelectedCurrencyRate(rateName);
      localStorage.setItem('finanzapp_currency_rate', rateName);
  };

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

  const fetchUserProfile = async () => {
      try {
          const res = await api.get('/users/profile');
          if (res.data.success) {
              setCurrentUser(res.data.user);
          }
      } catch (e) { console.error(e); }
  };

  const handleGamification = (gamificationData) => {
      if (!gamificationData) return;

      if (gamificationData.newBadges && gamificationData.newBadges.length > 0) {
          confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#22c55e', '#eab308', '#ec4899', '#3b82f6']
          });
          setShowAchievements(true);
          fetchUserProfile(); // Asegurar datos frescos
      } else if (gamificationData.xpGained > 0) {
          // Solo actualizar si hubo XP (opcional, refrescamos silenciosamente)
          fetchUserProfile();
      }
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

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Generador recurrente
  useEffect(() => {
    if (!isLocked && currentUser) {
      const checkRecurring = async () => {
        try { await api.post('/fixed-expenses/generate'); handleRefresh(); } catch { /* ignore */ }
      };
      checkRecurring();
    }
  }, [isLocked, currentUser]);

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

  // C. Si está todo OK -> ROUTES (Main App)
  return (
    <BrowserRouter>
      <Routes>
        <Route
            element={
                <Layout
                    currentUser={currentUser}
                    isPrivacyMode={isPrivacyMode}
                    setIsPrivacyMode={setIsPrivacyMode}
                    handleLogout={handleLogout}
                    setIsLocked={setIsLocked}
                    childrenContext={{
                        transactions,
                        onRefresh: handleRefresh,
                        isPrivacyMode,
                        currentUser,
                        handleLogout,
                        setIsLocked,
                        handleGamification,
                        setShowAchievements,
                        exchangeRates,
                        selectedCurrencyRate,
                        updateCurrencyRate
                    }}
                />
            }
        >
            <Route path="/" element={<DashboardView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/savings" element={<SavingsView />} />
            <Route path="/wealth" element={<WealthView />} />
            <Route path="/planning" element={<PlanningView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Modals that live outside Layout if needed, but Layout handles them now */}
      {showAchievements && currentUser && (
        <AchievementsModal user={currentUser} onClose={() => setShowAchievements(false)} />
      )}

    </BrowserRouter>
  );
}

export default App;
