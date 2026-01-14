import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Eye, EyeOff, LogOut, Lock, Trophy } from 'lucide-react';

const Layout = ({
  currentUser,
  isPrivacyMode,
  setIsPrivacyMode,
  handleLogout,
  setIsLocked,
  childrenContext
}) => {
  const location = useLocation();

  return (
    <>
      <div className="min-h-screen bg-void p-4 md:p-6 lg:p-8 font-sans pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">

          {/* HEADER */}
          <header className="flex justify-between items-center px-2 sticky top-0 z-40 bg-void/80 backdrop-blur-md py-2 border-b border-white/5 md:static md:bg-transparent md:border-none md:py-0">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-primary/30 object-contain shadow-glow bg-surface" />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter">
                  Finanz<span className="text-primary drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">App</span>
                </h1>
                <p className="hidden md:block text-textMuted text-xs font-medium tracking-wide mt-0.5 uppercase">
                  Hola, {currentUser?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {/* Desktop Navigation (Only rendered here for desktop) */}
              <div className="hidden md:block">
                  <Navbar currentUser={currentUser} mobile={false} />
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex gap-3 ml-4 border-l border-white/10 pl-4">
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

              {/* Mobile Header Actions */}
               <div className="flex md:hidden gap-2">
                  <button
                      onClick={() => childrenContext.setShowAchievements(true)}
                      className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center transition-all active:scale-95 text-textMuted hover:text-yellow-400"
                  >
                      <Trophy size={16} />
                  </button>
                  <button
                  onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                  className={`w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center transition-all active:scale-95 ${isPrivacyMode ? 'text-primary border-primary shadow-glow' : 'text-textMuted hover:text-white hover:border-primary'}`}
                  >
                  {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
               </div>
            </div>
          </header>

          {/* CONTENT */}
          <main>
              <Outlet context={childrenContext} />
          </main>
        </div>
      </div>

      {/* Mobile Navigation (Outside of the slide-up container) */}
      <div className="md:hidden">
          <Navbar currentUser={currentUser} mobile={true} />
      </div>
    </>
  );
};

export default Layout;
