import { useOutletContext } from 'react-router-dom';
import { LogOut, Lock } from 'lucide-react';

const Menu = () => {
    const { handleLogout, setIsLocked, currentUser } = useOutletContext();

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="bento-card p-6 flex flex-col items-center gap-4">
                 <div className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center bg-surface shadow-glow">
                    <img src="/logo.png" alt="User" className="w-16 h-16 object-contain" />
                 </div>
                 <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">{currentUser?.name}</h2>
                    <p className="text-textMuted text-sm">{currentUser?.username}</p>
                 </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setIsLocked(true)}
                    className="w-full bento-card p-4 flex items-center justify-between group hover:border-primary transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-textMuted group-hover:text-white group-hover:bg-primary transition-colors">
                            <Lock size={20} />
                        </div>
                        <span className="text-white font-medium">Bloquear Pantalla</span>
                    </div>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full bento-card p-4 flex items-center justify-between group hover:border-rose-500 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-textMuted group-hover:text-white group-hover:bg-rose-500 transition-colors">
                            <LogOut size={20} />
                        </div>
                        <span className="text-white font-medium">Cerrar Sesión</span>
                    </div>
                </button>
            </div>

            <div className="text-center text-textMuted text-xs mt-8">
                FinanzApp v1.0.0
            </div>
        </div>
    );
};

export default Menu;
