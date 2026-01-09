import { useState, useEffect } from 'react';

const PinScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [storedPin, setStoredPin] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('finanzapps_pin');
    if (saved) {
      setStoredPin(saved);
    } else {
      setIsSettingUp(true); // Primera vez: Configurar PIN
    }
  }, []);

  const handlePress = (num) => {
    const nextIndex = pin.findIndex(p => p === '');
    if (nextIndex === -1) return;

    const newPin = [...pin];
    newPin[nextIndex] = num;
    setPin(newPin);
    setError(false);

    // Si completó los 4 números
    if (nextIndex === 3) {
      const enteredPin = newPin.join('');
      
      if (isSettingUp) {
        localStorage.setItem('finanzapps_pin', enteredPin);
        setStoredPin(enteredPin);
        setIsSettingUp(false);
        setPin(['', '', '', '']);
        alert("¡PIN Configurado!");
        onUnlock(); // Entrar directo
      } else {
        if (enteredPin === storedPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(['', '', '', '']), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    const lastIndex = [...pin].reverse().findIndex(p => p !== '');
    if (lastIndex === -1) return;
    const realIndex = 3 - lastIndex;
    const newPin = [...pin];
    newPin[realIndex] = '';
    setPin(newPin);
  };

  return (
    <div className="fixed inset-0 bg-void z-50 flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center">
      <img 
          src="/logo.png" 
          alt="Logo FinanzApp" 
          className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-primary/20 object-contain drop-shadow-[0_0_20px_rgba(124,58,237,0.6)] animate-pulse-slow bg-void"
        />
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2 font-heading">
          Finanz<span className="text-primary">App</span>
        </h1>
        <p className="text-neon text-sm uppercase tracking-widest">
          {isSettingUp ? 'Crea tu PIN de acceso' : 'Ingresa tu PIN'}
        </p>
      </div>

      {/* Puntos del PIN */}
      <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
        {pin.map((p, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
            p !== '' ? 'bg-primary border-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'border-border bg-transparent'
          }`} />
        ))}
      </div>

      {/* Teclado Numérico */}
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
        <div className="w-20 h-20"></div> {/* Espacio vacío */}
        <button
          onClick={() => handlePress(0)}
          className="w-20 h-20 rounded-full bg-surface border border-border text-2xl font-bold text-white hover:bg-surfaceHighlight transition-all active:scale-95"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-20 h-20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          ⌫
        </button>
      </div>
    </div>
  );
};

export default PinScreen;