import React, { useEffect } from 'react';
import { X, Trophy, Lock } from 'lucide-react';

const BADGES_META = {
    TRACKER_NOVICE: { label: 'Novato', desc: 'Registra tu primer gasto', icon: '🌱', color: 'bg-emerald-500' },
    CONSISTENCY_KING: { label: 'Constante', desc: 'Racha de 7 días', icon: '🔥', color: 'bg-amber-500' },
    DEBT_DESTROYER: { label: 'Libre de Deudas', desc: 'Paga una deuda', icon: '🛡️', color: 'bg-indigo-500' },
};

const AchievementsModal = ({ onClose, user }) => {

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose} // Allow clicking backdrop to close
        >
            <div
                className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in"
                onClick={e => e.stopPropagation()} // Prevent close when clicking inside modal
            >
                {/* Header */}
                <div className="bg-void/50 p-4 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <Trophy className="text-yellow-400" size={24} />
                         <h2 className="text-xl font-bold text-white">Logros y Nivel</h2>
                    </div>
                    <button onClick={onClose} type="button" className="p-2 hover:bg-white/10 rounded-full transition-colors text-textMuted hover:text-white" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* XP & Level */}
                    <div className="text-center">
                         <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-500 drop-shadow-lg mb-1">
                            {user?.xp || 0} XP
                         </div>
                         <p className="text-textMuted text-sm font-medium uppercase tracking-widest">Experiencia Total</p>
                    </div>

                    {/* Streak */}
                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                <span className="text-xl">🔥</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Racha Actual</h3>
                                <p className="text-xs text-textMuted">Días consecutivos registrando</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-white">{user?.streak || 0}</span>
                    </div>

                    {/* Badges Grid */}
                    <div>
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full"></span>
                            Insignias
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.keys(BADGES_META).map(key => {
                                const meta = BADGES_META[key];
                                const isUnlocked = user?.badges?.some(b => b.id === key);

                                return (
                                    <div key={key} className={`relative group p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all duration-300 ${
                                        isUnlocked
                                        ? 'bg-white/5 border-primary/30 shadow-[0_0_15px_-3px_rgba(124,58,237,0.3)]'
                                        : 'bg-void border-white/5 opacity-60 grayscale'
                                    }`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner ${isUnlocked ? 'bg-gradient-to-br from-white/10 to-white/5' : 'bg-white/5'}`}>
                                            {isUnlocked ? meta.icon : <Lock size={20} />}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-textMuted'}`}>{meta.label}</p>
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <p className="text-xs text-white font-medium text-center">{meta.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementsModal;
