export interface LoginModel{

    email: string;
    password: string;
  }

export type FieldType = "text" | "password" | "email" | "select";

export interface FieldConfig {
  name: string;               // clave (ej: "email", "password")
  label: string;              // etiqueta visible
  placeholder?: string;
  type: FieldType;            // tipo de campo
  options?: string[];         // si es select, aquí van las opciones
  required?: boolean;         // si es obligatorio
}
