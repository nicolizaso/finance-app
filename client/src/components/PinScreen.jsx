import { useState, useEffect } from 'react';
import api from '../api/axios'; // Importamos la api

const PinScreen = ({ username, onLoginSuccess, onBack }) => { // <--- Nuevas props
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // ... (useEffects viejos borrados, ya no usamos localStorage para validar PIN localmente)

  const handlePress = async (num) => {
    if (loading) return;
    const nextIndex = pin.findIndex(p => p === '');
    if (nextIndex === -1) return;

    const newPin = [...pin];
    newPin[nextIndex] = num;
    setPin(newPin);
    setError(false);

    // Si completó el PIN
    if (nextIndex === 3) {
      const enteredPin = newPin.join('');
      setLoading(true);
      
      try {
        // VALIDAR CON BACKEND
        const res = await api.post('/users/login', { username, pin: enteredPin });
        
        if (res.data.success) {
            // Guardamos usuario completo en localStorage
            localStorage.setItem('finanzapp_user', JSON.stringify(res.data.user));
            onLoginSuccess(res.data.user);
        }
      } catch (err) {
        console.error(err);
        setError(true);
        // Vibrar si es móvil
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => {
            setPin(['', '', '', '']);
            setLoading(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if(loading) return;
    const lastIndex = [...pin].reverse().findIndex(p => p !== '');
    if (lastIndex === -1) return;
    const realIndex = 3 - lastIndex;
    const newPin = [...pin];
    newPin[realIndex] = '';
    setPin(newPin);
  };

  return (
    <div className="fixed inset-0 bg-void z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      {/* Botón Volver */}
      <button onClick={onBack} className="absolute top-6 left-6 text-textMuted hover:text-white">
        ← Cambiar usuario
      </button>

      <div className="mb-10 text-center">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-primary/20 object-contain shadow-glow bg-void" 
        />
        <h2 className="text-2xl font-bold text-white mb-1 capitalize">Hola, {username}</h2>
        <p className="text-textMuted text-xs uppercase tracking-widest">
           {loading ? 'Verificando...' : 'Ingresa tu PIN'}
        </p>
      </div>

      {/* Puntos del PIN */}
      <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
        {pin.map((p, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
            p !== '' ? 'bg-primary border-primary shadow-glow' : 'border-border bg-transparent'
          }`} />
        ))}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num)}
            className="w-20 h-20 rounded-full bg-surface border border-border text-2xl font-bold text-white hover:bg-surfaceHighlight hover:border-primary/50 transition-all active:scale-95"
          >
            {num}
          </button>
        ))}
        <div className="w-20 h-20"></div>
        <button onClick={() => handlePress(0)} className="w-20 h-20 rounded-full bg-surface border border-border text-2xl font-bold text-white hover:bg-surfaceHighlight transition-all active:scale-95">0</button>
        <button onClick={handleDelete} className="w-20 h-20 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors">⌫</button>
      </div>
    </div>
  );
};

export default PinScreen;