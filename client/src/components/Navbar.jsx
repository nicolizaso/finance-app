import { NavLink } from 'react-router-dom';
import { Home, PieChart, Calendar, Briefcase, Gift, Activity, PiggyBank } from 'lucide-react';

const Navbar = ({ mobile }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Actividad', path: '/history', icon: Activity },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Metas', path: '/savings', icon: PiggyBank },
    { name: 'Análisis', path: '/stats', icon: PieChart },
    { name: 'Planning', path: '/planning', icon: Gift },
    { name: 'Patrimonio', path: '/wealth', icon: Briefcase },
  ];

  if (mobile) {
      return null;
  }

  // Desktop
  return (
      <div className="flex items-center gap-6 mr-6">
        {navItems.map((item) => (
             <NavLink
             key={item.path}
             to={item.path}
             className={({ isActive }) => `
               flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium
               ${isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}
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
