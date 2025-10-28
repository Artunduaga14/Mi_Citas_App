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
    super("RelatedPerson"); // -> base /RelatedPerson
  }

  // Extensiones específicas (si tu API las expone):
  async list(): Promise<RelatedPersonList[]> {
    // GET /RelatedPerson/list
    const { data } = await (await import("../api")).default.get<RelatedPersonList[]>(
      `${this.urlBase}/list`
    );
    return Array.isArray(data) ? data : [];
  }

  async listByPatientId(patientId: number | string): Promise<RelatedPersonList[]> {
    // GET /RelatedPerson/list?patientId=123
    const { data } = await (await import("../api")).default.get<RelatedPersonList[]>(
      `${this.urlBase}/list`,
      { params: { patientId } }
    );
    return Array.isArray(data) ? data : [];
  }
}

export const RelatedPersonService = new RelatedPersonServiceClass();
