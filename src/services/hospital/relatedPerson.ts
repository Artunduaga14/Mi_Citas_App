// src/services/hospital/relatedPerson.ts
import api from "../api";
import { HttpBaseService } from "../service-base";
import {
  RelatedPersonList,
  RelatedPersonCreate,
  RelatedPersonEdit,
} from "../../models/Gestion/RelatedPerson";

class RelatedPersonServiceClass extends HttpBaseService<
  RelatedPersonList,
  RelatedPersonCreate,
  RelatedPersonEdit
> {
  constructor() {
    super("RelatedPerson"); // 👈 tu endpoint base
  }

  // 📋 Listar todos los parientes
  async list(): Promise<RelatedPersonList[]> {
    const { data } = await api.get<RelatedPersonList[]>(`${this.urlBase}`);
    return Array.isArray(data) ? data : [];
  }

  // 📋 Listar por persona (usa personId)
  async listByPatientId(personId: number | string): Promise<RelatedPersonList[]> {
    const pid = typeof personId === "string" ? personId.trim() : personId;
    const { data } = await api.get<RelatedPersonList[]>(`${this.urlBase}/list`, {
      params: { personId: pid }, // 👈 tu backend espera `personId`
    });
    return Array.isArray(data) ? data : [];
  }

  // ➕ Crear persona relacionada
  async create(data: RelatedPersonCreate) {
    const res = await api.post(`${this.urlBase}`, data);
    return res.data;
  }
   async Update( body: RelatedPersonEdit): Promise<any> {
  const { data } = await api.put(`${this.urlBase}`, body);
  console.log("[PUT] RelatedPerson →", this.urlBase, body);
  return data;
}
}

export const RelatedPersonService = new RelatedPersonServiceClass();
