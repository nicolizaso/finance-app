import { useState } from 'react';
import api from '../api/axios';

const PinScreen = ({ username, onLoginSuccess, onBack }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePress = async (num) => {
    if (loading) return;
    const nextIndex = pin.findIndex(p => p === '');
    if (nextIndex === -1) return;

    const newPin = [...pin];
    newPin[nextIndex] = num;
    setPin(newPin);
    setError(false);

    if (nextIndex === 3) {
      const enteredPin = newPin.join('');
      setLoading(true);
      
      try {
        const res = await api.post('/users/login', { username, pin: enteredPin });
        
        if (res.data.success) {
            localStorage.setItem('finanzapp_user', JSON.stringify(res.data.user));
            onLoginSuccess(res.data.user);
        }
      } catch (err) {
        console.error(err);
        setError(true);
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
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      {/* Botón Volver */}
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-white">
        ← Cambiar usuario
      </button>

      <div className="mb-10 text-center">
        <img 
          src="/logo.png"
          alt="Logo" 
          className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-indigo-500/20 object-contain shadow-glow bg-slate-900 p-4"
        />
        <h2 className="text-2xl font-bold text-white mb-1 capitalize">Hola, {username}</h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest">
           {loading ? 'Verificando...' : 'Ingresa tu PIN'}
        </p>
      </div>

      {/* Puntos del PIN */}
      <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
        {pin.map((p, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
            p !== '' ? 'bg-indigo-500 border-indigo-500 shadow-glow' : 'border-slate-700 bg-transparent'
          }`} />
        ))}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num)}
            className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 text-2xl font-bold text-white hover:bg-slate-700 hover:border-indigo-500/50 transition-all active:scale-95 shadow-lg"
          >
            {num}
          </button>
        ))}
        <div className="w-20 h-20"></div>
        <button onClick={() => handlePress(0)} className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 text-2xl font-bold text-white hover:bg-slate-700 transition-all active:scale-95 shadow-lg">0</button>
        <button onClick={handleDelete} className="w-20 h-20 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors">⌫</button>
      </div>
    </div>
  );
};

export default PinScreen;
