import { useState, useEffect } from 'react';
import api from './api/axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componentes
import UserScreen from './components/UserScreen';
import PinScreen from './components/PinScreen';
import Layout from './components/Layout';
import QuickAddButton from './components/QuickAddButton'; // <--- Importar
import QuickAddModal from './components/QuickAddModal';   // <--- Importar
import AchievementsModal from './components/AchievementsModal';
import confetti from 'canvas-confetti';

// Páginas
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import CalendarPage from './pages/Calendar';
import Assets from './pages/Assets';
import Menu from './pages/Menu';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false); // <--- Estado para Quick Add
  const [showAchievements, setShowAchievements] = useState(false);

  // Datos
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

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
                    childrenContext={{ transactions, onRefresh: handleRefresh, isPrivacyMode, currentUser, handleLogout, setIsLocked, handleGamification, setShowAchievements }}
                />
            }
        >
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/menu" element={<Menu />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FAB & Modal */}
      {!isLocked && (
          <>
            <QuickAddButton onClick={() => setShowQuickAdd(true)} />
            {showQuickAdd && (
                <QuickAddModal
                    onClose={() => setShowQuickAdd(false)}
                    onSuccess={(data) => {
                        handleRefresh(); // Recargar datos
                        setShowQuickAdd(false);
                        if (data?.gamification) handleGamification(data.gamification);
                    }}
                />
            )}
            {showAchievements && currentUser && (
                <AchievementsModal user={currentUser} onClose={() => setShowAchievements(false)} />
            )}
          </>
      )}

    </BrowserRouter>
  );
}

export default App;
