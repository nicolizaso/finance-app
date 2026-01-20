import { X, User, Gift, DollarSign, FileText, Trophy, LogOut, Wallet, Calendar, PieChart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const SideDrawer = ({ isOpen, onClose, currentUser, handleLogout, updateCurrencyRate, selectedCurrencyRate }) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-[70] w-3/4 max-w-xs bg-surface border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surfaceHighlight/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon p-[1px]">
                                <img src="/logo.png" alt="Profile" className="w-full h-full rounded-full bg-surface object-contain" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{currentUser?.username || 'Usuario'}</h3>
                                <p className="text-xs text-textMuted">Perfil</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-textMuted hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {/* Profile (Placeholder) */}
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <User size={20} />
                            <span className="font-medium">Perfil</span>
                        </button>

                         {/* Calendar - Added here for mobile drawer completeness though it's in bottom bar too */}
                        <NavLink
                            to="/calendar"
                            onClick={onClose}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                        >
                            <Calendar size={20} />
                            <span className="font-medium">Calendario</span>
                        </NavLink>

                        <NavLink
                            to="/stats"
                            onClick={onClose}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                        >
                            <PieChart size={20} />
                            <span className="font-medium">Análisis</span>
                        </NavLink>

                        {/* Planning / Wishlist */}
                        <NavLink
                            to="/planning"
                            onClick={onClose}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                        >
                            <Gift size={20} />
                            <span className="font-medium">Lista de Deseos</span>
                        </NavLink>

                        {/* Wealth */}
                        <NavLink
                            to="/wealth"
                            onClick={onClose}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                        >
                            <Wallet size={20} />
                            <span className="font-medium">Patrimonio</span>
                        </NavLink>

                        <div className="my-2 border-t border-white/5 mx-4"></div>

                        {/* Currency Converter */}
                        <div className="px-4 py-2">
                            <div className="flex items-center gap-2 text-textMuted mb-3">
                                <DollarSign size={18} />
                                <span className="font-medium text-sm">Cotización Dólar</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['Official', 'Blue', 'MEP'].map(rate => (
                                    <button
                                        key={rate}
                                        onClick={() => updateCurrencyRate(rate)}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                                            selectedCurrencyRate === rate
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                                            : 'bg-surfaceHighlight/50 text-textMuted border-transparent hover:text-white'
                                        }`}
                                    >
                                        {rate}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="my-2 border-t border-white/5 mx-4"></div>

                        {/* Other Items */}
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <FileText size={20} />
                            <span className="font-medium">Exportar PDF</span>
                        </button>
                         <button className="w-full flex items-center gap-3 px-4 py-3 text-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <Trophy size={20} />
                            <span className="font-medium">Logros</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5">
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
