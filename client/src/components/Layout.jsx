import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNavbar from './BottomNavbar';
import SideDrawer from './SideDrawer';
import { Eye, EyeOff, LogOut, Lock, Trophy, Plus, Menu } from 'lucide-react';
import { useState } from 'react';
import QuickAddModal from './QuickAddModal';
import FixedExpenseForm from './FixedExpenseForm';
import AchievementsModal from './AchievementsModal';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Extend childrenContext with layout actions if needed by views
  const extendedContext = {
      ...childrenContext,
      openQuickAdd: () => setShowQuickAdd(true),
      openFixedExpenseForm: () => setShowFixedExpenseForm(true),
      openDrawer: () => setIsDrawerOpen(true)
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    // Simulate a small delay for the loading state to be visible
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        generateReport(currentUser, childrenContext.transactions || []);
    } catch (error) {
        console.error("Error generating PDF", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-void font-sans">
        <div className="max-w-7xl mx-auto min-h-screen flex flex-col">

          {/* DESKTOP HEADER */}
          <header className="hidden md:flex justify-between items-center px-8 py-4 border-b border-white/5 sticky top-0 bg-void/90 backdrop-blur-md z-40">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-primary/30 object-contain shadow-glow bg-surface" />
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tighter">
                  Finanz<span className="text-primary drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">App</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center">
              <Navbar currentUser={currentUser} mobile={false} />

              <div className="flex gap-3 ml-6 border-l border-white/10 pl-6">
                  <button
                      onClick={() => setShowQuickAdd(true)}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon flex items-center justify-center text-white shadow-glow hover:scale-105 transition-all active:scale-95"
                      title="Nuevo Movimiento"
                  >
                      <Plus size={20} />
                  </button>
                  <button
                      onClick={() => childrenContext.setShowAchievements(true)}
                      className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted hover:text-yellow-400 hover:border-yellow-500 transition-all active:scale-95"
                      title="Logros"
                  >
                      <Trophy size={18} />
                  </button>
                  <button
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  className={`w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center transition-all active:scale-95 ${isPrivacyMode ? 'text-primary border-primary shadow-glow' : 'text-textMuted hover:text-white hover:border-primary'}`}
                  title="Modo Privacidad"
                  >
                  {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                      onClick={handleLogout}
                      className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted hover:text-rose-400 hover:border-rose-500 transition-all active:scale-95"
                      title="Cerrar Sesión"
                  >
                  <LogOut size={18} />
                  </button>
                  <button
                  onClick={() => setIsLocked(true)}
                  className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted hover:text-white hover:border-primary hover:shadow-glow transition-all active:scale-95"
                  title="Bloquear"
                  >
                  <Lock size={18} />
                  </button>
              </div>
            </div>
          </header>

          {/* MOBILE HEADER */}
          <header className="md:hidden flex justify-between items-center px-4 py-3 bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
             <div className="flex items-center gap-2">
                 <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-primary/30" />
                 <h1 className="text-xl font-bold text-white">Finanz<span className="text-primary">App</span></h1>
             </div>
             <div className="flex items-center gap-3">
                 <button
                    onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                    className={`p-2 rounded-full transition-colors ${isPrivacyMode ? 'text-primary' : 'text-textMuted'}`}
                 >
                    {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
                 <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 text-textMuted hover:text-white transition-colors"
                 >
                     <Menu size={24} />
                 </button>
             </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
              <Outlet context={extendedContext} />
          </main>
        </div>
      </div>

      {/* GLOBAL MODALS */}
      {showQuickAdd && (
        <QuickAddModal
            onClose={() => setShowQuickAdd(false)}
            onSuccess={(data) => {
                childrenContext.onRefresh();
                setShowQuickAdd(false);
                if (data?.gamification) childrenContext.handleGamification(data.gamification);
            }}
        />
      )}

      {showFixedExpenseForm && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <div className="w-full max-w-md bg-surface border border-primary/50 rounded-3xl p-6 relative shadow-glow">
                 <button onClick={() => setShowFixedExpenseForm(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">✕</button>
                 <FixedExpenseForm onClose={() => setShowFixedExpenseForm(false)} onSaved={childrenContext.onRefresh} />
             </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION (Mobile) */}
      <BottomNavbar
         onQuickAdd={() => setShowQuickAdd(true)}
         onOpenMenu={() => setIsDrawerOpen(true)}
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
             childrenContext.setShowAchievements(true);
         }}
         onExportPDF={handleExportPDF}
      />

      {/* PDF Loading Overlay */}
      {isGeneratingPDF && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-surface border border-primary/50 p-6 rounded-2xl flex flex-col items-center gap-4 animate-scale-in">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white font-bold animate-pulse">Generando Reporte PDF...</p>
              </div>
          </div>
      )}
    </>
  );
};

export default Layout;
