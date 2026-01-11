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