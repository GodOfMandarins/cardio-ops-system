import type { SurgeryListItem, SurgeryEditFormData } from "@/src/Models/Surgery";
import { updateSurgery as submitEditedData } from "@/src/Shared/repositories/SurgeryRepository";

export interface SurgeryEditDialog {
  openDialog: true;
  surgery: SurgeryListItem;
}

export interface SurgeryEditSuccess {
  success: true;
  message: string;
}

export interface SurgeryEditError {
  success: false;
  message: string;
}

export function initiateFormOpening(surgery: SurgeryListItem): SurgeryEditDialog {
  return { openDialog: true, surgery };
}

export function validateData(data: SurgeryEditFormData): void {
  if (!data.tipas) throw new Error("Tipas privalomas.");
  if (!data.prioritetas) throw new Error("Prioritetas privalomas.");
  if (!data.data) throw new Error("Data privaloma.");
  if (!data.pradziosLaikas) throw new Error("Pradžios laikas privalomas.");
  if (!Number.isInteger(data.trukmeMin) || data.trukmeMin <= 0)
    throw new Error("Trukmė turi būti teigiamas sveikasis skaičius.");
  if (!data.busena) throw new Error("Būsena privaloma.");
  if (!data.sudetingumas) throw new Error("Sudėtingumas privalomas.");
  if (!Number.isInteger(data.operacineNr) || data.operacineNr <= 0)
    throw new Error("Operacinės numeris turi būti teigiamas sveikasis skaičius.");
}

export async function submitEditedSurgery(
  id: number,
  payload: unknown
): Promise<SurgeryEditSuccess> {
  const data = (payload ?? {}) as SurgeryEditFormData;

  validateData(data);

  await submitEditedData(id, data);
  return { success: true, message: "Operacija sėkmingai atnaujinta." };
}
