import {
  getTransplantationData as getTransplantationDataEntity,
  getTransplantations as getTransplantationsEntity,
  markTransplantationAsCompleted,
  markTransplantationAsFailed,
  saveUpdatedData,
  type TransplantationData,
  type TransplantationWindowListItem,
  type UpdateDataSaved,
} from "@/src/Models/Transplantation";
import {
  deleteCandidateList,
  rejectCandidate,
} from "@/src/Models/Candidate";
import { releaseOrgan } from "@/src/Models/Organ";

export interface TransplantationUpdateWindowOpening {
  showTransplantationDataForm: true;
  transplantacijaId: number;
}

export interface TransplantationUpdateResult {
  updateDataSaved?: UpdateDataSaved;
  errorMessage?: string;
}

export async function loadTransplantationsList(): Promise<
  TransplantationWindowListItem[]
> {
  return getTransplantationsEntity();
}

export function initiateTransplantationUpdateWindowOpening(
  transplantacijaId: number
): TransplantationUpdateWindowOpening {
  return showTransplantationDataForm(transplantacijaId);
}

export function showTransplantationDataForm(
  transplantacijaId: number
): TransplantationUpdateWindowOpening {
  return {
    showTransplantationDataForm: true,
    transplantacijaId,
  };
}

export async function openTransplantationData(
  transplantacijaId: number
): Promise<TransplantationData> {
  const transplantationData = await getTransplantationData(transplantacijaId);
  return provideTransplantationDataForm(transplantationData);
}

export async function getTransplantationData(
  transplantacijaId: number
): Promise<TransplantationData> {
  return getTransplantationDataEntity(transplantacijaId);
}

export function provideTransplantationDataForm(
  transplantationData: TransplantationData
): TransplantationData {
  return transplantationData;
}

function ensureReservedOrgan(transplantationData: TransplantationData): void {
  if (!transplantationData.organas || transplantationData.organas.busena !== "rezervuotas") {
    throw new Error(
      "Transplantacijos busena gali buti atnaujinama tik tada, kai susijes organas yra rezervuotas."
    );
  }
}

function ensureCandidate(transplantationData: TransplantationData): number {
  if (!transplantationData.kandidatas) {
    throw new Error("Organui priskirtas kandidatas nerastas.");
  }

  return transplantationData.kandidatas.id;
}

export async function confirmArrival(
  transplantacijaId: number
): Promise<TransplantationUpdateResult> {
  try {
    const transplantationData = await getTransplantationData(transplantacijaId);
    ensureReservedOrgan(transplantationData);

    await deleteCandidateList(ensureCandidate(transplantationData));
    await markTransplantationAsCompleted(transplantacijaId);
    const updateDataSaved = await saveUpdatedData();

    return { updateDataSaved };
  } catch (error) {
    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "Nepavyko issaugoti transplantacijos atnaujinimo.",
    };
  }
}

export async function confirmNoShow(
  transplantacijaId: number
): Promise<TransplantationUpdateResult> {
  try {
    const transplantationData = await getTransplantationData(transplantacijaId);
    ensureReservedOrgan(transplantationData);

    await Promise.all([
      releaseOrgan(transplantationData.organas!.id),
      rejectCandidate(ensureCandidate(transplantationData)),
      markTransplantationAsFailed(transplantacijaId),
    ]);
    const updateDataSaved = await saveUpdatedData();

    return { updateDataSaved };
  } catch (error) {
    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "Nepavyko issaugoti transplantacijos atnaujinimo.",
    };
  }
}
