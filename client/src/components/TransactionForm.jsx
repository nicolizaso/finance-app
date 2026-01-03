import { useState } from 'react';
import axios from 'axios';

const CATEGORIES = ["Comida", "Casa", "Transporte", "Ocio", "Salud", "Suscripciones", "Ahorro", "Varios"];

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto (YYYY-MM-DD)
    status: 'COMPLETED' // Por defecto: Ya pagado
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 'COMPLETED' : 'PENDING') : e.target.value;
    
    // Si es el checkbox de estado, manejamos la lógica especial
    if (e.target.name === 'isPaid') {
       setFormData({ ...formData, status: value });
    } else {
       setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convertir a centavos
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount) * 100 
    };

    try {
      await axios.post('http://127.0.0.1:3000/api/transactions', payload);
      setMessage('✅ Movimiento guardado');
      if (onTransactionAdded) onTransactionAdded();
      
      // Reset (Mantenemos la fecha y el tipo para agilizar la carga)
      setFormData(prev => ({ 
        ...prev, 
        description: '', 
        amount: '' 
      }));
      
      // Borrar mensaje a los 3 segundos
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error(error);
      setMessage('❌ Error al guardar');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md mx-auto border border-gray-700">
      <h2 className="text-xl font-bold text-gray-200 mb-4">Nuevo Movimiento</h2>
      
      {message && <div className="p-2 mb-4 bg-blue-900 text-blue-200 text-sm rounded text-center">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Fila 1: Descripción */}
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción (ej. Internet)"
          className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Fila 2: Monto y Fecha */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="$ 0.00"
            step="0.01"
            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Fila: Selector de Categoría */}
        <div>
          <label className="block text-gray-400 text-sm mb-1">Categoría</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Fila 3: Tipo y Estado */}
        <div className="flex justify-between items-center bg-gray-750 p-2 rounded-lg">
          {/* Selector Gasto/Ingreso */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'EXPENSE'})}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${formData.type === 'EXPENSE' ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'INCOME'})}
              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${formData.type === 'INCOME' ? 'bg-green-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              Ingreso
            </button>
          </div>

          {/* Checkbox: ¿Ya se pagó? */}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-300">
              {formData.status === 'COMPLETED' ? '✅ Pagado' : '⏳ Pendiente'}
            </span>
            <input 
              type="checkbox" 
              name="isPaid"
              checked={formData.status === 'COMPLETED'}
              onChange={handleChange}
              className="accent-blue-500 w-5 h-5"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2"
        >
          Guardar
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;