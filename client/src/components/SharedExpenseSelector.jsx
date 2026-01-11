import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, User, Percent, Search, ArrowRightLeft } from 'lucide-react';

const SharedExpenseSelector = ({ totalAmount, onChange, initialData }) => {
  const [enabled, setEnabled] = useState(false);

  // Estados para búsqueda de usuario
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // { _id, username } OR { _id: null, username: 'Otro' }
  const [isSearching, setIsSearching] = useState(false);
  const [customName, setCustomName] = useState('');

  // Estados para split
  const [myPercentage, setMyPercentage] = useState(50);

  // Inicialización desde Edición
  useEffect(() => {
    if (initialData && initialData.isShared) {
        setEnabled(true);
        // Si es un ID (ObjectId de mongo tiene 24 chars)
        if (initialData.sharedWith && initialData.sharedWith.length === 24) {
             // Simulamos usuario seleccionado (No tenemos el nombre, mostraremos el ID o buscaremos si es necesario)
             // Para simplificar, asumiremos que si viene de editar, el backend NO devuelve el username poblado.
             // Podemos hacer un fetch rápido o mostrar "Usuario ID".
             // O mejor, si el usuario original guarda el nombre... no lo guarda.
             // Mostraremos "Usuario Asociado" si no podemos resolver.
             // PERO: para MVP, mostramos el ID o string.
             setSelectedUser({ _id: initialData.sharedWith, username: 'Usuario (ID)' });
        } else {
             // Es custom name
             setSelectedUser({ _id: null, username: 'Otro' });
             setCustomName(initialData.sharedWith);
        }

        // Calcular porcentaje basado en amount vs otherShare
        // initialData.amount es MI parte. initialData.otherShare es SU parte.
        // Total = amount + otherShare
        const total = initialData.amount + (initialData.otherShare || 0);
        if (total > 0) {
            setMyPercentage(Math.round((initialData.amount / total) * 100));
        }
    }
  }, [initialData]);

  // Efecto para debounce de búsqueda
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

  // Calcular montos
  const total = parseFloat(totalAmount) || 0;
  const myShare = Math.round((total * myPercentage) / 100);
  const otherShare = Math.round(total - myShare);

  // Notificar al padre cada vez que cambia algo relevante
  useEffect(() => {
    if (!enabled) {
        onChange(null); // Desactivado
        return;
    }

    // Datos válidos solo si hay un usuario seleccionado (o custom name si es Otro)
    let finalSharedWith = '';
    if (selectedUser) {
        if (selectedUser._id) finalSharedWith = selectedUser._id;
        else finalSharedWith = customName; // Si es "Otro"
    }

    onChange({
        isShared: true,
        sharedWith: finalSharedWith, // ID o Nombre
        myShare: myShare * 100, // Centavos
        otherShare: otherShare * 100 // Centavos
    });

  }, [enabled, selectedUser, customName, myPercentage, total]);

  // Helpers
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
    <div className="bg-surfaceHighlight/20 border border-border p-4 rounded-xl mt-4">
      {/* 1. Checkbox Activador */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${enabled ? 'bg-primary border-primary' : 'border-textMuted bg-transparent'}`}>
            {enabled && <Users size={12} className="text-white" />}
        </div>
        <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="hidden" />
        <span className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={16} className="text-primary" /> ¿Gasto Compartido?
        </span>
      </label>

      {/* 2. Panel Desplegable */}
      {enabled && (
        <div className="mt-4 space-y-4 animate-fade-in">

            {/* A. Selector de Usuario */}
            <div className="relative z-20">
                <label className="text-[10px] uppercase text-textMuted font-bold mb-1 block">Compartir con:</label>

                {!selectedUser ? (
                    <>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-textMuted" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar usuario o escribir 'Otro'"
                                className="input-pro pl-10 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && <div className="absolute right-3 top-3 text-xs text-textMuted animate-pulse">...</div>}
                        </div>

                        {/* Resultados */}
                        {(searchResults.length > 0 || searchTerm.length > 1) && (
                            <div className="absolute w-full bg-surface border border-border rounded-xl mt-1 max-h-40 overflow-y-auto shadow-glow z-30">
                                {searchResults.map(u => (
                                    <button
                                        key={u._id}
                                        onClick={() => handleSelectUser(u)}
                                        className="w-full text-left p-3 hover:bg-primary/20 hover:text-white text-textMuted text-sm border-b border-border/50 last:border-0 transition-colors"
                                    >
                                        <span className="font-bold">{u.username}</span> <span className="text-xs opacity-70">({u.name})</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleSelectUser({ _id: null, username: 'Otro' })}
                                    className="w-full text-left p-3 hover:bg-primary/20 hover:text-white text-primary font-bold text-sm transition-colors"
                                >
                                    Otro...
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex gap-2">
                        {/* Usuario Seleccionado */}
                        <div className="flex-1 bg-primary/20 border border-primary text-white p-2 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span className="text-sm font-bold">{selectedUser.username}</span>
                            </div>
                            <button onClick={clearSelection} className="text-white/50 hover:text-white">✕</button>
                        </div>

                        {/* Campo para nombre si es Otro */}
                        {!selectedUser._id && (
                            <input
                                type="text"
                                placeholder="Nombre..."
                                className="input-pro text-sm flex-1"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                autoFocus
                            />
                        )}
                    </div>
                )}
            </div>

            {/* B. Splitter */}
            <div className="bg-void/50 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-textMuted mb-2 uppercase font-bold tracking-wider">
                    <span>Yo pago ({myPercentage}%)</span>
                    <span>Ellos pagan ({100 - myPercentage}%)</span>
                </div>

                <input
                    type="range"
                    min="0" max="100" step="5"
                    value={myPercentage}
                    onChange={(e) => setMyPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-surfaceHighlight rounded-lg appearance-none cursor-pointer accent-primary mb-3"
                />

                <div className="flex justify-between items-center gap-4">
                    <div className="bg-surfaceHighlight p-2 rounded-lg flex-1 text-center border border-primary/30">
                        <p className="text-textMuted text-[10px]">Mi parte</p>
                        <p className="text-white font-mono font-bold">${myShare}</p>
                    </div>
                    <div className="text-textMuted"><ArrowRightLeft size={14} /></div>
                    <div className="bg-surfaceHighlight p-2 rounded-lg flex-1 text-center border border-white/5">
                        <p className="text-textMuted text-[10px]">Su parte</p>
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