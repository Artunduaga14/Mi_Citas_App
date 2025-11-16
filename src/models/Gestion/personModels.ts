// src/models/Gestion/personModels.ts

// Lo que llega del backend para mostrar el perfil
export interface PersonList {
  id: number;
  fullName: string;
  fullLastName: string;
  documentTypeId: number;           // 👈 AÑADIDO
  documentTypeName: string | null;
  documentTypeAcronymName: string | null;
  document: string;
  dateBorn: string;
  phoneNumber: string;
  epsName: string | null;
  epsId: number;
  gender: string;
  healthRegime: string;
  isDeleted: boolean;
  registrationDate: string;
}

// Lo que se envía al backend para actualizar
export interface PersonUpdate {
  id: number;
  fullName: string;
  fullLastName: string;
  documentTypeId: number;
  document: string;
  dateBorn: string;
  phoneNumber: string;
  epsId: number;
  gender: string;
  healthRegime: string;
}

export interface UserDetailDto {
  fullName: string;
  fullLastName: string;
  document: string;
  phoneNumber: string;
  email: string;
  dateBorn: string;
  registerDate: string;
  gender: string;
  healthRegime: string;
  roles: string[];
}
