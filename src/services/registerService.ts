import { DocumentTypes, Eps, PersonUserCreateDto } from "../models/Gestion/Register";
import { HttpService } from "./GenericServices";

class RegisterService {
  /**
   * Crear usuario con persona
   */
 static async createPersonUser(data: PersonUserCreateDto): Promise<any> {
  const url = '/PersonUser/create-person-user';

  // 📌 Muestra exactamente a dónde está enviando la petición
  console.log('🔎 POST →', url);

  const response = await HttpService.post(url, data);

  return response;
}

  /**
   * Obtener tipos de documento
   */
  static async getDocumentTypes(): Promise<DocumentTypes[]> {
    try {
      console.log('🚀 Iniciando petición DocumentTypes...');
      const data = await HttpService.get('/DocumentType');
      console.log('✅ DocumentTypes recibidos DIRECTAMENTE:', data);
      console.log('📊 Tipo de data:', typeof data);
      console.log('📊 Es array?:', Array.isArray(data));
      console.log('📊 Cantidad:', data?.length);
      
      if (!data) {
        console.error('❌ Data es null/undefined');
        return [];
      }
      
      if (!Array.isArray(data)) {
        console.error('❌ Data NO es un array:', typeof data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error en getDocumentTypes:', error);
      return [];
    }
  }

  /**
   * Obtener EPS disponibles
   */
  static async getEpsList(): Promise<Eps[]> {
    try {
      console.log('🚀 Iniciando petición EPS...');
      const data = await HttpService.get('/Eps');
      console.log('✅ EPS recibidas DIRECTAMENTE:', data);
      console.log('📊 Tipo de data:', typeof data);
      console.log('📊 Es array?:', Array.isArray(data));
      console.log('📊 Cantidad:', data?.length);
      
      if (!data) {
        console.error('❌ Data es null/undefined');
        return [];
      }
      
      if (!Array.isArray(data)) {
        console.error('❌ Data NO es un array:', typeof data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error en getEpsList:', error);
      return [];
    }
  }
}

export default RegisterService;
