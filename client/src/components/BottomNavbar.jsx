import { Home, Activity, PieChart, Menu as MenuIcon, Plus, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNavbar = ({ onQuickAdd, onOpenMenu }) => {
    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Calendar, label: 'Agenda', path: '/calendar' },
        { icon: Plus, label: 'Quick Add', action: onQuickAdd, isMain: true },
        { icon: Activity, label: 'Actividad', path: '/history' },
        { icon: MenuIcon, label: 'Más', action: onOpenMenu },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-lg border-t border-white/10"></div>
            <div className="relative flex justify-around items-center h-[70px] pb-2 px-2">
                {navItems.map((item, index) => {
                    if (item.isMain) {
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className="relative -top-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-neon shadow-[0_0_15px_rgba(124,58,237,0.5)] flex items-center justify-center text-white transform transition-transform active:scale-95 border-4 border-void"
                            >
                                <item.icon size={28} />
                            </button>
                        );
                    }

                    if (item.path) {
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) => `flex flex-col items-center justify-center w-14 gap-1 transition-colors ${isActive ? 'text-primary' : 'text-textMuted hover:text-white'}`}
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
                            className="flex flex-col items-center justify-center w-14 gap-1 text-textMuted hover:text-white transition-colors"
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavbar;
