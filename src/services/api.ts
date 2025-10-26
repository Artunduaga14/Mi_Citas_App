// api.ts
import { environment } from '../../environment/environment.dev';
import axios from 'axios';


// Instancia base de Axios
const api = axios.create({
  baseURL: environment.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
