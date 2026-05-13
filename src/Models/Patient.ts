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

export async function checkIfPatientAlreadyRegistered(
  pacientas: string
): Promise<boolean> {
  const { isPatientInTransplantationWaitingList } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return isPatientInTransplantationWaitingList(pacientas);
}

export async function addPatientToWaitingList(data: {
  pacientas: string;
  prioritetas: string;
}): Promise<"success"> {
  const { addPatientToTransplantationWaitingList } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return addPatientToTransplantationWaitingList(data);
}

export async function removePatientFromWaitingList(
  pacientas: string
): Promise<"success"> {
  const { removePatientFromTransplantationWaitingList } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return removePatientFromTransplantationWaitingList(pacientas);
}
