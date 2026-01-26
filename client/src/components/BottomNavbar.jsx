import { Home, Activity, Calendar, Menu as MenuIcon, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNavbar = ({ onQuickAdd, onOpenMenu, pendingCount }) => {
    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Calendar, label: 'Agenda', path: '/calendar' },
        { icon: Plus, label: 'Quick Add', action: onQuickAdd, isMain: true },
        { icon: Activity, label: 'Actividad', path: '/history' },
        { 
            icon: MenuIcon, 
            label: 'Más', 
            action: onOpenMenu,
            badge: pendingCount > 0
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="mx-4 mb-4 bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl h-16 flex items-center justify-around px-2 relative">
                {navItems.map((item, index) => {
                    if (item.isMain) {
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className="relative -top-6 bg-gradient-to-tr from-indigo-500 to-violet-500 p-4 rounded-full shadow-glow transform transition-transform active:scale-95 border-4 border-slate-900"
                            >
                                <item.icon size={28} className="text-white" />
                            </button>
                        );
                    }

                    if (item.path) {
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) => `flex flex-col items-center justify-center w-14 gap-1 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </NavLink>
                        );
                    }

                    return (
                        <button
                            key={index}
                            onClick={item.action}
                            className="relative flex flex-col items-center justify-center w-14 gap-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <div className="relative">
                                <item.icon size={20} />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-slate-800"></span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavbar;
