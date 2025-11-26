import api from "./api";

export class ModificationRequestService {
  static async create(data: any) {

    // 👉 Consola para validar ruta + payload
    const url = "/modificationrequest";
    console.log("📡 POST →", url);
    console.log("📦 Payload enviado:", data);

    return api.post(url, data);
  }
}