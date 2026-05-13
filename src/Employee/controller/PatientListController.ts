import { getDoctorPatientsList } from "@/src/Models/Employee";
import { getDoctorPatients as getDoctorPatientsEntity } from "@/src/Models/Patient";
import type { PatientListItem } from "@/src/Models/Patient";

const DEMO_DOCTOR_ID = "11111111111";

export interface PatientWindowOpening {
  openWindow: true;
}

export interface DoctorPatientsDataResult {
  doctorPatientsData: PatientListItem[];
}

export function initiateWindowOpening(): PatientWindowOpening {
  return openWindow();
}

export function openWindow(): PatientWindowOpening {
  return { openWindow: true };
}

export async function getDoctorPatients(
  gydytojas: string = DEMO_DOCTOR_ID
): Promise<DoctorPatientsDataResult> {
  const doctorPatientsList = await getDoctorPatientsList(gydytojas);
  if (doctorPatientsList.length === 0) {
    throw new Error("Gydytojo pacientu sarasas tuscias.");
  }

  const doctorPatients = await getDoctorPatientsEntity(
    doctorPatientsList.map((patient) => patient.patientCode)
  );
  if (doctorPatients.length === 0) {
    throw new Error("Gydytojo pacientu sarasas tuscias.");
  }

  return {
    doctorPatientsData: doctorPatients,
  };
}
