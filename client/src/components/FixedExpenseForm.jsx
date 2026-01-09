import { useState } from 'react';
import axios from 'axios';

const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const FixedExpenseForm = ({ onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dayOfMonth: 1, // Día 1 por defecto
    category: 'Casa'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Guardamos la regla (centavos)
      await axios.post('http://127.0.0.1:3000/api/fixed-expenses', {
        ...formData,
        amount: parseFloat(formData.amount) * 100
      });
      
      // Forzamos la generación inmediata de la transacción de este mes
      await axios.post('http://127.0.0.1:3000/api/fixed-expenses/generate');
      
      onSaved(); // Avisar al padre para recargar
      onClose(); // Cerrar formulario
    } catch (error) {
      console.error(error);
      alert('Error guardando gasto fijo');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-blue-900 mb-6 animate-fade-in">
      <h3 className="text-blue-400 font-bold mb-3">Nuevo Gasto Fijo Mensual</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        
        <input 
          type="text" 
          placeholder="Nombre (ej. Alquiler)" 
          className="w-full bg-gray-700 p-2 rounded text-white"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Monto Aprox.</label>
            <input 
              type="number" 
              className="w-full bg-gray-700 p-2 rounded text-white"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Día de Vto.</label>
            <input 
              type="number" 
              min="1" max="31"
              className="w-full bg-gray-700 p-2 rounded text-white"
              value={formData.dayOfMonth}
              onChange={e => setFormData({...formData, dayOfMonth: e.target.value})}
              required
            />
          </div>
        </div>

        <select 
          className="w-full bg-gray-700 p-2 rounded text-white"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
        >
           {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold">Guardar Regla</button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default FixedExpenseForm;