import { Home, Activity, Calendar, Menu as MenuIcon, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNavbar = ({ onQuickAdd, onOpenMenu, pendingCount, onOpenNotifications }) => {
    // Definimos la estructura de navegación deseada
    const navItems = [
        { icon: Home, label: 'Inicio', path: '/' },
        { icon: Calendar, label: 'Agenda', path: '/calendar' }, // Calendario restaurado
        { icon: Plus, label: 'Quick Add', action: onQuickAdd, isMain: true },
        { icon: Activity, label: 'Actividad', path: '/history' },
        { 
            icon: MenuIcon, 
            label: 'Más', 
            action: onOpenMenu,
            badge: pendingCount > 0 // Indicador si hay pendientes
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Si quisieras una campana flotante extra para notificaciones, iría aquí, pero por ahora usamos el badge en el menú */}
            
            <div className="mx-4 mb-4 bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl h-16 flex items-center justify-around px-2 relative">
                {navItems.map((item, index) => {
                    if (item.isMain) {
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className="relative -top-6 bg-gradient-to-tr from-primary to-neon p-4 rounded-full shadow-glow transform transition-transform active:scale-95 border-4 border-void"
                            >
                                <item.icon size={28} className="text-white" />
                            </button>
                        );
                    }

                    // Renderizado común para Links
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

                    // Renderizado común para Botones (Menu)
                    return (
                        <button
                            key={index}
                            onClick={item.action}
                            className="relative flex flex-col items-center justify-center w-14 gap-1 text-textMuted hover:text-white transition-colors"
                        >
                            <div className="relative">
                                <item.icon size={20} />
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-surface"></span>
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