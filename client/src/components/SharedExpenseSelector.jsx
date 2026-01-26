import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, User, Percent, Search, ArrowRightLeft } from 'lucide-react';

const SharedExpenseSelector = ({ totalAmount, onChange, initialData }) => {
  const [enabled, setEnabled] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [customName, setCustomName] = useState('');

  const [myPercentage, setMyPercentage] = useState(50);

  useEffect(() => {
    if (initialData && initialData.isShared) {
        setEnabled(true);

        if (typeof initialData.sharedWith === 'object' && initialData.sharedWith !== null && initialData.sharedWith._id) {
             setSelectedUser({
                 _id: initialData.sharedWith._id,
                 username: initialData.sharedWith.name || initialData.sharedWith.username || 'Usuario'
             });
        }
        else if (typeof initialData.sharedWith === 'string' && initialData.sharedWith.length === 24) {
             setSelectedUser({ _id: initialData.sharedWith, username: 'Usuario (ID)' });
        } else {
             setSelectedUser({ _id: null, username: 'Otro' });
             setCustomName(typeof initialData.sharedWith === 'string' ? initialData.sharedWith : '');
        }

        const total = initialData.amount + (initialData.otherShare || 0);
        if (total > 0) {
            setMyPercentage(Math.round((initialData.amount / total) * 100));
        }
    }
  }, [initialData]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
        if (searchTerm.length >= 2 && !selectedUser) {
            setIsSearching(true);
            try {
                const res = await api.get(`/users/search?q=${searchTerm}`);
                setSearchResults(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedUser]);

  const total = parseFloat(totalAmount) || 0;
  const myShare = Math.round((total * myPercentage) / 100);
  const otherShare = Math.round(total - myShare);

  useEffect(() => {
    if (!enabled) {
        onChange(null);
        return;
    }

    let finalSharedWith = '';
    if (selectedUser) {
        if (selectedUser._id) finalSharedWith = selectedUser._id;
        else finalSharedWith = customName;
    }

    onChange({
        isShared: true,
        sharedWith: finalSharedWith,
        myShare: myShare * 100,
        otherShare: otherShare * 100,
        myPercentage: myPercentage
    });

  }, [enabled, selectedUser, customName, myPercentage, total]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.username);
    setSearchResults([]);
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setCustomName('');
    setSearchResults([]);
  };

  return (
    <div className="bg-slate-700/20 border border-slate-700 p-4 rounded-xl mt-4">
      {/* 1. Checkbox Activador */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${enabled ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400 bg-transparent'}`}>
            {enabled && <Users size={12} className="text-white" />}
        </div>
        <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="hidden" />
        <span className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={16} className="text-indigo-400" /> ¿Gasto Compartido?
        </span>
      </label>

      {/* 2. Panel Desplegable */}
      {enabled && (
        <div className="mt-4 space-y-4 animate-fade-in">
            
            {/* A. Selector de Usuario */}
            <div className="relative z-20">
                <label className="text-[10px] uppercase text-slate-400 font-bold mb-1 block">Compartir con:</label>
                
                {!selectedUser ? (
                    <>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar usuario o escribir 'Otro'" 
                                className="input-pro pl-10 text-sm bg-slate-900 border-slate-700 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && <div className="absolute right-3 top-3 text-xs text-slate-400 animate-pulse">...</div>}
                        </div>

                        {/* Resultados */}
                        {(searchResults.length > 0 || searchTerm.length > 1) && (
                            <div className="absolute w-full bg-slate-800 border border-slate-700 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-glow z-30">
                                {searchResults.map(u => (
                                    <button 
                                        type="button"
                                        key={u._id} 
                                        onClick={() => handleSelectUser(u)}
                                        className="w-full text-left p-3 hover:bg-slate-700 text-slate-400 text-sm border-b border-slate-700 last:border-0 transition-colors"
                                    >
                                        <span className="font-bold text-white">{u.username}</span> <span className="text-xs opacity-70">({u.name})</span>
                                    </button>
                                ))}
                                <button 
                                    type="button"
                                    onClick={() => handleSelectUser({ _id: null, username: 'Otro' })}
                                    className="w-full text-left p-3 hover:bg-slate-700 text-indigo-400 font-bold text-sm transition-colors"
                                >
                                    Otro...
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex gap-2">
                        {/* Usuario Seleccionado */}
                        <div className="flex-1 bg-indigo-500/20 border border-indigo-500 text-white p-2 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span className="text-sm font-bold">{selectedUser.username}</span>
                            </div>
                            <button type="button" onClick={clearSelection} className="text-white/50 hover:text-white">✕</button>
                        </div>
                        
                        {/* Campo para nombre si es Otro */}
                        {!selectedUser._id && (
                            <input 
                                type="text" 
                                placeholder="Nombre..." 
                                className="input-pro text-sm flex-1 bg-slate-900 border-slate-700 focus:border-indigo-500"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                autoFocus
                            />
                        )}
                    </div>
                )}
            </div>

            {/* B. Splitter */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">
                    <span>Yo pago ({myPercentage}%)</span>
                    <span>Ellos pagan ({100 - myPercentage}%)</span>
                </div>
                
                <input 
                    type="range" 
                    min="0" max="100" step="5"
                    value={myPercentage}
                    onChange={(e) => setMyPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
                />

                <div className="flex justify-between items-center gap-4">
                    <div className="bg-slate-800 p-2 rounded-lg flex-1 text-center border border-indigo-500/30">
                        <p className="text-slate-400 text-[10px]">Mi parte</p>
                        <p className="text-white font-mono font-bold">${myShare}</p>
                    </div>
                    <div className="text-slate-400"><ArrowRightLeft size={14} /></div>
                    <div className="bg-slate-800 p-2 rounded-lg flex-1 text-center border border-white/5">
                        <p className="text-slate-400 text-[10px]">Su parte</p>
                        <p className="text-white font-mono font-bold">${otherShare}</p>
                    </div>
                </div>
            </div>

        </div>
      )}
    </div>
  );
};

export default SharedExpenseSelector;
