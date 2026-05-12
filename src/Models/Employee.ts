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

export interface DoctorListItem {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
  elPastas: string;
  telNr: string | null;
  patirtiesMetai: number;
}

export interface RecommendedDoctorListItem extends DoctorListItem {
  rodiklis: number;
  operacijuSkaicius: number;
  atlikoNorimoTipoOperacija: boolean;
}

interface SurgeryTypeResult {
  operacijosTipas: string;
  gydytojasId: string;
}

// 4. PickDoctorsBySurgeryType(Type) — filtruoja pagal operacijos tipą.
// Kai surgeryType tuščias, grąžina visus gydytojus su bet kokia operacine patirtimi (12 žingsnis).
export function PickDoctorsBySurgeryType(
  surgeryType: string,
  doctors: DoctorListItem[],
  surgeryResults: SurgeryTypeResult[]
): DoctorListItem[] {
  if (!surgeryType) {
    const doctorIds = new Set(surgeryResults.map((r) => r.gydytojasId));
    return doctors.filter((doctor) => doctorIds.has(doctor.asmensKodas));
  }

  const doctorIds = new Set(
    surgeryResults
      .filter((result) => result.operacijosTipas === surgeryType)
      .map((result) => result.gydytojasId)
  );

  return doctors.filter((doctor) => doctorIds.has(doctor.asmensKodas));
}

