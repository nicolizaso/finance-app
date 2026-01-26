import { useState } from 'react';
import { ArrowRight, User } from 'lucide-react';

const UserScreen = ({ onUserSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim().length < 3) {
        setError(true);
        return;
    }
    onUserSubmit(username);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
            <img src="/logo.png" alt="Logo" className="w-28 h-28 relative z-10 rounded-full border-4 border-slate-800 shadow-2xl p-6 bg-slate-900" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-2">
            Nebula
        </h1>
        <p className="text-slate-400 text-sm">Identifícate para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="relative group">
            <User className="absolute left-4 top-3.5 text-indigo-500" size={20} />
            <input 
                type="text" 
                value={username}
                onChange={(e) => {setUsername(e.target.value); setError(false);}}
                placeholder="Nombre de usuario"
                className={`input-pro pl-12 text-center text-lg capitalize bg-slate-900 border-slate-700 focus:border-indigo-500 ${error ? 'border-rose-500 animate-shake' : ''}`}
                autoFocus
            />
        </div>

        <button 
            type="submit" 
            className="btn-primary w-full group"
        >
            Continuar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default UserScreen;
