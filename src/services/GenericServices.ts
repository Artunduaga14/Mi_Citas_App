import { LoginModel } from "../models/Models";
import api from "./api";

export const HttpService = {
  // GET → puede recibir params opcionales
 async get(endpoint: string, params?: any) {
  const fullUrl = `${api.defaults.baseURL}${endpoint}`;

  // 🪵 Log antes de la petición
  console.log("🌍 [HTTP GET]", fullUrl);
  if (params) console.log("🧩 Params:", JSON.stringify(params, null, 2));

  const response = await api.get(endpoint, { params });

  // 🧾 Log de respuesta
  console.log("📥 [HTTP GET]", fullUrl, "→", response.status, `(${response.statusText})`);
  console.log("🧾 Response (parsed):", JSON.stringify(response.data, null, 2));

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


async login(endpoint: string, data: LoginModel) {
  try {
    console.log("🚀 Sending login request to:", `${api.defaults.baseURL}/auth/login`);
    console.log("📦 Payload:", JSON.stringify(data, null, 2));

    const response = await api.post("/auth/login", data);
    console.log("✅ Login success:", response.data);
    return response;
  } catch (error: any) {
    console.log("💥 FULL AXIOS ERROR LOG START 💥");
    console.log("➡️ Message:", error.message);
    console.log("➡️ Name:", error.name);
    console.log("➡️ Config:", JSON.stringify(error.config, null, 2));

    if (error.response) {
      console.log("🔹 RESPONSE STATUS:", error.response.status);
      console.log("🔹 RESPONSE HEADERS:", JSON.stringify(error.response.headers, null, 2));
      console.log("🔹 RESPONSE DATA:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log("🔸 REQUEST SENT BUT NO RESPONSE");
      console.log("🔸 Request object:", error.request);
    } else {
      console.log("⚠️ ERROR SETUP:", error.message);
    }

    console.log("💥 FULL AXIOS ERROR LOG END 💥");
    throw error;
  }
},


  
  async forgotPassword(email:string){

    const response  = await api.post('user/forgot-password',email)
    return response;
  }


};