const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const transactionsRoutes = require('./routes/transaction');

// 1. Configuración de entorno
dotenv.config();

// 2. Conectar a Base de Datos
connectDB();

// 3. Inicializar App
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Middlewares (Capas de seguridad y utilidad)
app.use(helmet({
    contentSecurityPolicy: false
  })); // Protege headers HTTP
app.use(cors()); // Permite peticiones desde el Frontend
app.use(express.json()); // Permite leer JSON en los requests (body parser)
app.use(morgan('dev')); // Logger para ver peticiones en consola

// 5. Rutas (Endpoints de prueba)
// Rutas
app.use('/api/transactions', transactionsRoutes);

// 6. Arrancar Servidor
app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
});