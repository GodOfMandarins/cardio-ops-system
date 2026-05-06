export type ExaminationType =
  | "Elektrofiziologinis tyrimas"
  | "Vaizdinis tyrimas"
  | "Laboratorinis tyrimas";

export type ExaminationState = "uzregistruotas" | "aktyvus" | "atliktas";

export interface ExaminationFormData {
  tipas: ExaminationType;
  data: string;
  kabinetas: number;
  pacientas: string;
}

export interface ExaminationListItem extends ExaminationFormData {
  id: number;
  busena: ExaminationState;
}

export interface DoctorPatientListItem {
  asmensKodas: string;
  vardas: string;
  pavarde: string;
}

export async function saveExaminationData(
  data: ExaminationFormData
): Promise<ExaminationListItem> {
  const { createExamination } = await import(
    "@/src/Shared/repositories/TestRepository"
  );
  return createExamination(data);
}
