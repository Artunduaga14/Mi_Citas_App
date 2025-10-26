import { LoginModel } from "../models/Models";
import api from "./api";

export const HttpService = {
  // GET → puede recibir params opcionales
  async get(endpoint: string, params?: any) {
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  // POST → recibe el body
  async post(endpoint: string, body: any) {
    const response = await api.post(endpoint, body);
    return response.data;
  },

  // PUT → recibe id o params + body
  async put(endpoint: string, body: any) {
    const response = await api.put(endpoint, body);
    return response.data;
  },

  // DELETE → recibe opcionalmente params
  async delete(endpoint: string, params?: any) {
    const response = await api.delete(endpoint, { params });
    return response.data;
  },


  async login(endpoint:string, data:LoginModel){
     const response = await api.post('/auth/login', data);
     return response;
  },

  
  async forgotPassword(email:string){

    const response  = await api.post('user/forgot-password',email)
    return response;
  }


};