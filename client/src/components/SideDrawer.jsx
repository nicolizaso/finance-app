import { X, User, Gift, DollarSign, FileText, Trophy, LogOut, Wallet, Calendar, PieChart, PiggyBank } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const SideDrawer = ({ isOpen, onClose, currentUser, handleLogout, updateCurrencyRate, selectedCurrencyRate, onShowAchievements, onExportPDF }) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-[70] w-3/4 max-w-xs bg-slate-800 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg border border-indigo-500/30">
                                {currentUser?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-white leading-tight">{currentUser?.name}</h3>
                                <p className="text-xs text-slate-400">Configuración</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Finanzas</p>
                            
                            <NavLink to="/wealth" onClick={onClose} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Wallet size={20} />
                                <span className="font-medium">Patrimonio</span>
                            </NavLink>
                            
                            <NavLink to="/planning" onClick={onClose} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Gift size={20} />
                                <span className="font-medium">Wishlist & Planes</span>
                            </NavLink>

                            <NavLink to="/savings" onClick={onClose} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <PiggyBank size={20} />
                                <span className="font-medium">Metas de Ahorro</span>
                            </NavLink>

                            <NavLink to="/stats" onClick={onClose} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <PieChart size={20} />
                                <span className="font-medium">Análisis</span>
                            </NavLink>
                        </div>

                        <div className="h-px bg-slate-700 my-2"></div>

                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Herramientas</p>
                            
                            {/* Selector de Moneda */}
                            <div className="px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <DollarSign size={20} />
                                    <span className="font-medium">Referencia USD</span>
                                </div>
                                <select 
                                    value={selectedCurrencyRate} 
                                    onChange={(e) => updateCurrencyRate(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2 py-1 text-white focus:border-indigo-500 outline-none"
                                >
                                    <option value="blue">Blue</option>
                                    <option value="oficial">Oficial</option>
                                    <option value="mep">MEP</option>
                                    <option value="crypto">Cripto</option>
                                </select>
                            </div>

                            <button
                                onClick={() => { onClose(); onExportPDF(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left"
                            >
                                <FileText size={20} />
                                <span className="font-medium">Exportar PDF</span>
                            </button>

                            <button
                                onClick={onShowAchievements}
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left"
                            >
                                <Trophy size={20} />
                                <span className="font-medium">Logros</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-700 bg-slate-700/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white py-3 rounded-xl transition-all font-bold"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideDrawer;
