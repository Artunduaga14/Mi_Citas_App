import axios from "axios";
import { environment } from "../../../environment/environment.dev";
import { Horario } from "./socket.service";

export interface TimeBlockEstado {
  hora: string;
  estaDisponible: boolean;
}

class CoreCitationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${environment.apiUrl}/CitationCore`;
  }

  /** 🔹 Convierte fecha a formato YYYY-MM-DD */
  private toYMD(date: Date | string): string {
    if (typeof date === 'string') return date.slice(0, 10);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * 🔹 Obtiene bloques de horario desde la API.
   * @param typeCitationId Id del tipo de cita
   * @param date Fecha (Date o string)
   * @param incluirOcupados Si true, incluye ocupados
   */
  async getAvailableBlocks(
    typeCitationId: number,
    date: Date | string,
    incluirOcupados = false
  ): Promise<Horario[]> {
    try {
      const formattedDate = this.toYMD(date);

      const response = await axios.get<Horario[]>(`${this.baseUrl}/core`, {
        params: { typeCitationId, date: formattedDate, incluirOcupados },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener bloques disponibles:', error);
      throw new Error('No se pudieron cargar los bloques de horario');
    }
  }

  /**
   * 🔹 Versión simple (modelo reducido)
   */
  async getAvailableBlocks2(
    typeCitationId: number,
    date: Date | string,
    incluirOcupados = false
  ): Promise<TimeBlockEstado[]> {
    try {
      const formattedDate = this.toYMD(date);

      const response = await axios.get<TimeBlockEstado[]>(`${this.baseUrl}/core`, {
        params: { typeCitationId, date: formattedDate, incluirOcupados },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener bloques (versión simple):', error);
      throw new Error('No se pudieron cargar los bloques');
    }
  }
}

export const coreCitationService = new CoreCitationService();