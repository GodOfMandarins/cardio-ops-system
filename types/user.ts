export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export interface User {
  id: string;
  name: string;
  role: Role;
}