import api from "./api";

export class UserService {
  
  // 👉 Obtiene el usuario por ID (del token)
  static async getById(id: number) {
    const res = await api.get(`/user/${id}`);
    return res.data;
  }

  // 👉 Activa / desactiva la reprogramación automática
  static async toggleRescheduling() {
    const res = await api.patch(`/user/Rescheduling`);
    return res.data;
  }
}

export default UserService;