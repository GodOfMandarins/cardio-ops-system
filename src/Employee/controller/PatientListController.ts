import { fetchDoctorPatientCodes as getDoctorPatientsList } from "@/src/Shared/repositories/TestRepository";
import { getDoctorPatients } from "@/src/Models/Patient";
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

export async function getDoctorPatientsData(
  gydytojas: string = DEMO_DOCTOR_ID
): Promise<DoctorPatientsDataResult> {
  const doctorPatientsList = await getDoctorPatientsList(gydytojas);
  const doctorPatients = await getDoctorPatients(
    doctorPatientsList.map((patient) => patient.patientCode)
  );

  return {
    doctorPatientsData: doctorPatients,
  };
}
