// src/services/hospital/personServices.ts
import api from "../api";
import {
  PersonList,
  PersonUpdate,
  UserDetailDto,
} from "../../models/Gestion/personModels";
import { HttpService } from "../GenericServices";

class PersonServiceClass {
  private base = "Person"; // tu controlador PersonController

  async list(): Promise<PersonList[]> {
    const { data } = await api.get<PersonList[]>(`${this.base}/list`);
    return Array.isArray(data) ? data : [];
  }

  async getById(id: number): Promise<PersonList> {
    const { data } = await api.get<PersonList>(`${this.base}/${id}`);
    return data;
  }

  // Detalle del usuario actual (si tu API lo expone en /Person/me)
  async getCurrentUserDetail(): Promise<UserDetailDto> {
    const { data } = await api.get<UserDetailDto>(`${this.base}/me`);
    return data;
  }

  // 🔧 IMPORTANTE: usar el id de la URL, que debe coincidir con el del DTO
   async update(body: PersonUpdate): Promise<any> {
    const { data } = await api.put(`${this.base}`, body);
    console.log("[PUT] Person →", this.base, body);
    return data;
  }
}

export const PersonService = new PersonServiceClass();

// ===== Catálogos =====
export interface DocumentTypeDto {
  id: number;
  name: string;
  acronym?: string;
}

export interface EpsDto {
  id: number;
  name: string;
}

export const CatalogService = {
  async getDocumentTypes(): Promise<DocumentTypeDto[]> {
    const res = await HttpService.get("DocumentType");
    return Array.isArray(res) ? res : [];
  },

  async getEps(): Promise<EpsDto[]> {
    const res = await HttpService.get("EPS");
    return Array.isArray(res) ? res : [];
  },
};
