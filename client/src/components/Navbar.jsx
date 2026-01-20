import { NavLink } from 'react-router-dom';
import { Home, PieChart, Calendar, Briefcase, Gift, Menu as MenuIcon, Activity, PiggyBank } from 'lucide-react';

const Navbar = ({ mobile, currentUser }) => {
  // Desktop Menu Items
  // "Sidebar / Hamburger Menu ... Desktop: A clean sidebar or integrated top-menu."
  // I will use the integrated top-menu for Desktop as before, but with new links.
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Actividad', path: '/history', icon: Activity },
    { name: 'Calendario', path: '/calendar', icon: Calendar },
    { name: 'Metas', path: '/savings', icon: PiggyBank },
    { name: 'Análisis', path: '/stats', icon: PieChart },
    { name: 'Planning', path: '/planning', icon: Gift }, // Map Planning to Wishlist/Planning icon
    { name: 'Patrimonio', path: '/wealth', icon: Briefcase },
  ];

  if (mobile) {
      // Mobile is now handled by BottomNavbar and SideDrawer.
      // Layout.jsx should not be rendering this for mobile if my Layout update was correct.
      // But if it is rendered, I should probably return null or a simplified version.
      // However, `Layout.jsx` still has:
      // <div className="md:hidden"> <Navbar currentUser={currentUser} mobile={true} /> </div>
      // Wait, I replaced that with <BottomNavbar /> in my thought process, but did I write it to Layout.jsx?
      // Let's check the Layout.jsx I wrote.
      // I wrote:
      // {/* BOTTOM NAVIGATION (Mobile) */}
      // <BottomNavbar ... />
      // And I REMOVED the old Navbar mobile call at the bottom.
      // So this mobile prop logic might be obsolete, but keeping it safe won't hurt.
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
