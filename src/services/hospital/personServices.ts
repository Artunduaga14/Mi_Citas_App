import api from "../api"; // tu axios preconfigurado
// Si usas HttpBaseService, puedes extenderlo también.

import { PersonList, PersonUpdate, UserDetailDto } from "../../models/Gestion/personModels";

class PersonServiceClass {
  private base = "Person";

  async list(): Promise<PersonList[]> {
    const { data } = await api.get<PersonList[]>(`${this.base}/list`);
    return Array.isArray(data) ? data : [];
  }

  async getById(id: number): Promise<PersonList> {
    const { data } = await api.get<PersonList>(`${this.base}/${id}`);
    return data;
  }

  // Detalle enriquecido para el usuario logueado (si tu API lo expone)
  async getCurrentUserDetail(): Promise<UserDetailDto> {
    const { data } = await api.get<UserDetailDto>(`${this.base}/me`);
    return data;
  }

  async update(dto: PersonUpdate): Promise<void> {
    await api.put(`${this.base}/${dto.id}`, dto);
  }

  // (opcional) crear persona si tu API lo permite
  // async create(dto: PersonCreate): Promise<number> { ... }

  // (opcional) eliminar
  // async delete(id: number): Promise<void> { await api.delete(`${this.base}/${id}`) }
}

export const PersonService = new PersonServiceClass();
