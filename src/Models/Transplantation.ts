import type { CandidateListItem } from "@/src/Models/Candidate";
import type { OrganListItem } from "@/src/Models/Organ";

export type TransplantationPriority = "1" | "2" | "3" | "4" | "5";

export type TransplantationState = "įvyko" | "nevyko" | "laukiama" | "rezervuota";

export type UpdateDataSaved = "updateDataSaved";

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

export interface TransplantationWindowListItem {
  id: number;
  registracijosData: string;
  prioritetas: TransplantationPriority;
  busena: TransplantationState;
  vietaEileje: number;
  organasId: number | null;
}

export interface TransplantationData extends TransplantationWindowListItem {
  organas: OrganListItem | null;
  kandidatas: CandidateListItem | null;
}

export async function saveTransplantationData(
  data: TransplantationRegistrationFormData
): Promise<TransplantationListItem> {
  const { createTransplantation } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return createTransplantation(data);
}

export async function getTransplantations(): Promise<
  TransplantationWindowListItem[]
> {
  const { fetchTransplantations } = await import(
    "@/src/Shared/repositories/TransplantationRepository"
  );
  return fetchTransplantations();
}

export async function getTransplantationData(
  transplantacijaId: number
): Promise<TransplantationData> {
  const { getTransplantationData: getTransplantationDataRepository } =
    await import("@/src/Shared/repositories/TransplantationRepository");
  return getTransplantationDataRepository(transplantacijaId);
}

export async function markTransplantationAsCompleted(
  transplantacijaId: number
): Promise<"transplantationCompleted"> {
  const {
    markTransplantationAsCompleted:
      markTransplantationAsCompletedRepository,
  } = await import("@/src/Shared/repositories/TransplantationRepository");
  return markTransplantationAsCompletedRepository(transplantacijaId);
}

export async function markTransplantationAsFailed(
  transplantacijaId: number
): Promise<"transplantationFailed"> {
  const {
    markTransplantationAsFailed: markTransplantationAsFailedRepository,
  } = await import("@/src/Shared/repositories/TransplantationRepository");
  return markTransplantationAsFailedRepository(transplantacijaId);
}

export async function saveUpdatedData(): Promise<UpdateDataSaved> {
  return "updateDataSaved";
}
