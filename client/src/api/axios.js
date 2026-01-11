import axios from 'axios';

// 1. Detectar si estamos en Prod (Vercel) o Dev (Local)
// Usamos '/api' relativo para desarrollo local (gracias al proxy de Vite)
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: baseURL,
  //withCredentials: true 
});

// 2. Interceptor para inyectar el usuario automáticamente
api.interceptors.request.use((config) => {
  // Aseguramos que no se dupliquen las barras //
  if (config.baseURL?.endsWith('/') && config.url?.startsWith('/')) {
      config.url = config.url.substring(1);
  }

  // Inyectar User ID
  const user = localStorage.getItem('finanzapp_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      config.headers['x-user-id'] = userData._id;
    } catch (e) {
      console.error("Error al leer usuario local", e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;