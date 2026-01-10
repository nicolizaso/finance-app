require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Conectar a Base de Datos
connectDB();

// --- CONFIGURACIÓN DE CORS SEGURA ---
// Define aquí las URLs permitidas (Local y Producción)
const allowedOrigins = [
  'http://localhost:5173',      // Vite Local
  'http://127.0.0.1:5173',      // Vite Local (IP)
  'https://finance-app-liart-three.vercel.app' // <--- DESCOMENTAR Y AGREGAR TU URL DE VERCEL AQUÍ CUANDO SUBAS
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman o Mobile Apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Bloqueado por CORS:", origin); // Log para debug
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // <--- Esto permite que funcione withCredentials: true del cliente
}));
// -----------------------------------

app.use(express.json());

// --- RUTAS ---
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/fixed-expenses', require('./routes/fixedExpenses'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});