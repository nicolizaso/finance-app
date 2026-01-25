import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavbar from './BottomNavbar';
import SideDrawer from './SideDrawer';
import { useState } from 'react';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import FixedExpenseForm from './FixedExpenseForm';
import AchievementsModal from './AchievementsModal';
import NotificationPopup from './NotificationPopup';
import { generateReport } from '../utils/generateReport';

const Layout = ({
  currentUser,
  isPrivacyMode,
  setIsPrivacyMode,
  handleLogout,
  setIsLocked,
  childrenContext
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFixedExpenseForm, setShowFixedExpenseForm] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Estado para PDF
  const [showNotifications, setShowNotifications] = useState(false); // Estado para Notificaciones

  // Calculate pending transactions for the badge
  const pendingCount = childrenContext?.transactions 
    ? childrenContext.transactions.filter(t => t.needsReview).length 
    : 0;

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Aseguramos pasar las transacciones y el usuario
      await generateReport(childrenContext.transactions, currentUser);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error al generar el reporte PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-void text-textMain font-sans selection:bg-primary/30">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-void/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
               <img src="/logo.png" alt="Eco" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-wide">Eco</span>
        </div>
        <button
           onClick={() => setIsPrivacyMode(!isPrivacyMode)}
           className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-textMuted hover:text-white transition-colors"
        >
            {isPrivacyMode ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>

      {/* NAVBAR (Desktop) */}
      <div className="hidden md:flex">
        <Navbar
          user={currentUser}
          isPrivacyMode={isPrivacyMode}
          togglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
          onLogout={handleLogout}
          onLock={() => setIsLocked(true)}
        />
      </div>

      {/* MAIN CONTENT */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto pt-20 md:pt-24 animate-fade-in">
         <Outlet context={{ ...childrenContext, onOpenFixedExpense: () => setShowFixedExpenseForm(true) }} />
      </main>

      {/* GLOBAL MODALS */}
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onSuccess={childrenContext.onRefresh}
        />
      )}

      {showFixedExpenseForm && (
        <FixedExpenseForm
           onClose={() => setShowFixedExpenseForm(false)}
           onSuccess={childrenContext.onRefresh}
        />
      )}
      
      {/* Achievements Modal logic via context/props if needed */}
      {childrenContext.showAchievements && (
        <AchievementsModal
           isOpen={childrenContext.showAchievements}
           onClose={() => childrenContext.setShowAchievements(false)}
           transactions={childrenContext.transactions}
        />
      )}

      {/* Notifications Popup */}
      {showNotifications && (
        <NotificationPopup 
          pendingCount={pendingCount} 
          onClose={() => setShowNotifications(false)} 
        />
      )}

      {/* BOTTOM NAVIGATION (Mobile) */}
      <BottomNavbar
         onQuickAdd={() => setShowQuickAdd(true)}
         onOpenMenu={() => setIsDrawerOpen(true)}
         pendingCount={pendingCount}
         onOpenNotifications={() => setShowNotifications(!showNotifications)}
      />

      {/* SIDE DRAWER (Mobile) */}
      <SideDrawer
         isOpen={isDrawerOpen}
         onClose={() => setIsDrawerOpen(false)}
         currentUser={currentUser}
         handleLogout={handleLogout}
         updateCurrencyRate={childrenContext.updateCurrencyRate}
         selectedCurrencyRate={childrenContext.selectedCurrencyRate}
         onShowAchievements={() => {
             setIsDrawerOpen(false);
             if (childrenContext.setShowAchievements) {
                childrenContext.setShowAchievements(true);
             }
         }}
         onExportPDF={handleExportPDF}
      />

      {/* PDF Loading Overlay */}
      {isGeneratingPDF && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
              <div className="bg-surface border border-primary/50 p-6 rounded-2xl flex flex-col items-center gap-4 animate-scale-in">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white font-bold animate-pulse">Generando Reporte PDF...</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Layout;