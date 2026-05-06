export interface PatientListItem {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
  kraujoGrupe: string;
  ugisCm: number;
  svorisKg: number;
  amzius: number;
}

export async function getDoctorPatients(
  patientCodes: string[]
): Promise<PatientListItem[]> {
  const { fetchPatientsByCodes } = await import(
    "@/src/Shared/repositories/PatientRepository"
  );
  return fetchPatientsByCodes(patientCodes);
}
