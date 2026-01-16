const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware para procesar JSON
app.use(express.json());

// --- CONFIGURACIÓN DE CORS DINÁMICA ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://finance-app-liart-three.vercel.app' // Tu dominio principal
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir si no hay origen (Postman)
    if (!origin) return callback(null, true);

    // 1. Verificar si está en la lista fija
    const isAllowed = allowedOrigins.indexOf(origin) !== -1;
    
    // 2. Verificar si es una URL de previsualización de Vercel (Regex)
    // Esto acepta cualquier URL que contenga "finance-app" y termine en ".vercel.app"
    const isVercelPreview = origin.includes('finance-app') && origin.endsWith('.vercel.app');

    if (isAllowed || isVercelPreview) {
      callback(null, true);
    } else {
      console.log("🚫 Bloqueado por CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Conexión a MongoDB
const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    console.log("No MONGO_URI found, using Memory Server");
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }

  mongoose.connect(uri)
    .then(() => console.log('MongoDB Conectado'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));
}

connectDB();

// Rutas
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/fixed-expenses', require('./routes/fixedExpenses'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wealth', require('./routes/wealth'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/savings-goals', require('./routes/savings'));
app.use('/api/wishlist', require('./routes/wishlist'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
