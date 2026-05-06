import type { User } from "@/src/Models/User";

export type EmployeeRole =
  | "gydytojas"
  | "administratorius"
  | "laboratorijos darbuotojas";

export interface EmployeeFormData extends User {
  role: EmployeeRole;
  patirtiesMetai: number;
}

export interface EmployeeListItem {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
  elPastas: string;
  telNr: string | null;
  role: EmployeeRole;
  patirtiesMetai: number;
}

export interface DoctorPatientsListItem {
  patientCode: string;
}

export async function getDoctorPatientsList(
  gydytojas: string
): Promise<DoctorPatientsListItem[]> {
  const { fetchDoctorPatientCodes } = await import(
    "@/src/Shared/repositories/TestRepository"
  );
  return fetchDoctorPatientCodes(gydytojas);
}

// Saugoja naują darbuotoją į duomenų bazę
export async function submitEmployeeData(
  data: EmployeeFormData
): Promise<EmployeeListItem> {
  const { createEmployee } = await import(
    "@/src/Shared/repositories/AdminRepository"
  );
  return createEmployee(data);
}
