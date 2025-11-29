// models/Gestion/Register.ts

export enum Gender {
  Masculino = 1,
  Femenino = 2
}

export enum HealthRegime {
  Contributivo = 1,
  Subsidiado = 2,
  Excepcion = 3
}

export interface PersonUserCreateDto {
  fullName: string;
  fullLastName: string;
  documentTypeId: number;
  document: string;
  dateBorn: string;
  phoneNumber: string;
  gender: number; // ⭐ Cambiar a number
  healthRegime: number; // ⭐ Cambiar a number
  epsId: number;
  address?: string;
  email: string;
  password: string;
  rescheduling: boolean;
  restrictionPoint: number;
}

export interface DocumentTypes {
  id: number;
  name: string;
}

export interface Eps {
  id: number;
  name: string;
}