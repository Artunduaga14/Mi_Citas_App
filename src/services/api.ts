import axios from 'axios';
import { environment } from '../../environment/environment.dev';
import { authService } from './Auth/AuthService';

const api = axios.create({
  baseURL: environment.apiUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🔒 Interceptor de request
api.interceptors.request.use(
  async (config) => {
    const token = await authService.getToken();
    const isAuth = await authService.isAuthenticated();

    if (token && isAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Token expirado. Intentando refresh...");
      const refreshed = await authService.refreshTokens();
      if (refreshed) {
        console.log("♻️ Refresh exitoso, reintentando petición");
        // 🔁 Reintenta la petición original con el nuevo token
        const newToken = await authService.getToken();
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        }
      } else {
        console.log("🚪 Refresh falló, cerrando sesión");
        await authService.logout();
      }
    }
    return Promise.reject(error);
  }
);


export default api;
