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

export async function getDoctorPatientsList(
  gydytojas: string
): Promise<DoctorPatientsListItem[]> {
  const { fetchDoctorPatientCodes } = await import(
    "@/src/Shared/repositories/TestRepository"
  );
  return fetchDoctorPatientCodes(gydytojas);
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

function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

export class EmployeeService {
  static toDateTime(date: string, time: string): Date {
    return toDateTime(date, time);
  }

  static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  static overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return overlaps(startA, endA, startB, endB);
  }

  static getDoctorsBySurgeries(
    context: import("@/src/Models/Surgery").PossibleTimeContext,
    start: Date,
    end: Date,
    ignoredSurgeryId: number | null
  ): DoctorListItem[] {
    const busySurgeryIds = context.surgeries
      .filter(
        (surgery) =>
          surgery.id !== ignoredSurgeryId &&
          overlaps(
            toDateTime(surgery.data, surgery.pradziosLaikas),
            addMinutes(toDateTime(surgery.data, surgery.pradziosLaikas), surgery.trukmeMin),
            start,
            end
          )
      )
      .map((surgery) => surgery.id);
    const busyIds = new Set(
      context.doctorAssignments
        .filter((assignment) => busySurgeryIds.includes(assignment.operacijaId))
        .map((assignment) => assignment.gydytojasId)
    );

    return context.doctors.filter((doctor) => !busyIds.has(doctor.asmensKodas));
  }
}

