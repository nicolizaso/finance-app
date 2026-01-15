import { NavLink } from 'react-router-dom';
import { Home, PieChart, Calendar, Briefcase, Menu as MenuIcon } from 'lucide-react';

const Navbar = ({ mobile }) => {
  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Analíticas', path: '/analytics', icon: PieChart },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Patrimonio', path: '/assets', icon: Briefcase },
    { name: 'Menú', path: '/menu', icon: MenuIcon },
  ];

  if (mobile) {
      return (
        <nav className="fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg px-2 py-3 flex justify-around items-center">
            {navItems.map((item) => (
                <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                    flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                    ${isActive ? 'text-primary' : 'text-textMuted hover:text-white'}
                `}
                >
                {({ isActive }) => (
                    <>
                    <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]' : ''} />
                    <span className="text-[10px] font-medium">{item.name}</span>
                    </>
                )}
                </NavLink>
            ))}
            </div>
        </nav>
      );
  }

  // Desktop
  return (
      <div className="flex items-center gap-6 mr-6">
        {navItems.filter(i => i.name !== 'Menú').map((item) => (
             <NavLink
             key={item.path}
             to={item.path}
             className={({ isActive }) => `
               flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium
               ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow' : 'text-textMuted hover:text-white hover:bg-white/5'}
             `}
           >
             <item.icon size={18} />
             {item.name}
           </NavLink>
        ))}
      </div>
  );
};

export default Navbar;
