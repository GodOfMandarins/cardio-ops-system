export type TransplantationPriority = "1" | "2" | "3" | "4" | "5";

export type TransplantationState = "laukiama";

export interface TransplantationRegistrationFormData {
  registracijosData: string;
  prioritetas: TransplantationPriority;
  pacientas: string;
}

export interface TransplantationListItem
  extends TransplantationRegistrationFormData {
  id: number;
  busena: TransplantationState;
  vietaEileje: number;
}

export async function saveTransplantationData(
  data: TransplantationRegistrationFormData
): Promise<TransplantationListItem> {
  const { createTransplantation } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return createTransplantation(data);
}
