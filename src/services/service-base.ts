import api from "./api";

/**
 * ServiceBase análogo al de Angular:
 * TList: tipo para listar/obtener
 * TCreate: tipo para crear
 * TUpdate: tipo para actualizar
 */
export class HttpBaseService<TList, TCreate, TUpdate> {
  protected urlBase: string;

  constructor(url: string) {
    // ejemplo: new HttpBaseService("RelatedPerson") -> /RelatedPerson
    this.urlBase = `/${url}`;
  }

  async getAll(): Promise<TList[]> {
    const { data } = await api.get<TList[]>(this.urlBase);
    return data;
  }

  async getById(id: number | string): Promise<TList> {
    const { data } = await api.get<TList>(`${this.urlBase}/${id}`);
    return data;
  }

  async create(body: TCreate): Promise<any> {
    const { data } = await api.post(this.urlBase, body);
    return data;
  }

  async update(body: TUpdate): Promise<any> {
    const { data } = await api.put(this.urlBase, body);
    return data;
  }

  async delete(id: number | string): Promise<void> {
    await api.delete(`${this.urlBase}/${id}`);
  }
}
