import { Zap } from 'lucide-react';

const QuickAddButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-neon to-primary flex items-center justify-center text-white shadow-glow hover:scale-110 active:scale-95 transition-all duration-300 animate-slide-up group"
    >
      <Zap size={32} className="fill-white group-hover:animate-pulse" />
      <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse-slow"></span>
    </button>
  );
};

export default QuickAddButton;
