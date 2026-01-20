import { Home, Activity, Calendar, Menu as MenuIcon, Plus, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNavbar = ({ onQuickAdd, onOpenMenu, pendingCount, onOpenNotifications }) => {
    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Activity, label: 'Actividad', path: '/history' },
        { icon: Plus, label: 'Quick Add', action: onQuickAdd, isMain: true },
        { icon: Calendar, label: 'Agenda', path: '/calendar' }, // Swapped Analysis with Calendar
        { icon: MenuIcon, label: 'Más', action: onOpenMenu },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Notification Icon (Absolute positioned on top right of Navbar) */}
            {pendingCount > 0 && (
                <motion.button
                    onClick={onOpenNotifications}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-3 right-4 z-50 bg-surface border border-orange-500 rounded-full p-2 text-orange-400 shadow-glow flex items-center justify-center"
                >
                     <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                     >
                        <AlertCircle size={20} />
                     </motion.div>
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-surface">
                        {pendingCount}
                     </span>
                </motion.button>
            )}

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
