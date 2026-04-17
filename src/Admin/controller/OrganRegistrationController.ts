import {
  type OrganFormData,
  saveOrganData as modelSaveOrganData,
} from "@/src/Models/Organ";
import type { OrganListItem } from "@/src/Models/Organ";
import { fetchOrgans } from "@/src/Shared/repositories/AdminRepository";

const ALLOWED_TYPES = new Set<OrganFormData["tipas"]>(["sirdis"]);
const ALLOWED_BLOOD_TYPES = new Set<OrganFormData["kraujoGrupe"]>(["0", "A", "B", "AB"]);

export interface OrganRegistrationWindowOpening {
  showOrganRegistrationWindow: true;
}

export interface OrganRegistrationSubmitResult {
  organ: OrganListItem;
  showNewOrganFillDialog: true;
}

export function initiateOrganRegistrationWindowOpening(): OrganRegistrationWindowOpening {
  return showOrganRegistrationWindow();
}

export function showOrganRegistrationWindow(): OrganRegistrationWindowOpening {
  return { showOrganRegistrationWindow: true };
}

export function requestOrganRegistrationForm(): OrganFormData {
  return {
    tipas: "sirdis",
    kraujoGrupe: "0",
    gavimoData: new Date().toISOString().split("T")[0],
    donoroAmzius: 0,
  };
}

export async function loadOrgansList(): Promise<OrganListItem[]> {
  return fetchOrgans();
}

export function validateData(data: OrganFormData): void {
  if (!ALLOWED_TYPES.has(data.tipas)) {
    throw new Error("Pasirinktas organo tipas yra neteisingas.");
  }
  if (!ALLOWED_BLOOD_TYPES.has(data.kraujoGrupe)) {
    throw new Error("Pasirinkta kraujo grupe yra neteisinga.");
  }
  if (!data.gavimoData) {
    throw new Error("Gavimo data yra privaloma.");
  }

  const gavimoData = new Date(data.gavimoData);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (isNaN(gavimoData.getTime())) {
    throw new Error("Gavimo data yra neteisingo formato.");
  }
  if (gavimoData > today) {
    throw new Error("Gavimo data negali buti ateityje.");
  }

  if (!Number.isInteger(data.donoroAmzius)) {
    throw new Error("Donoro amzius turi buti sveikas skaicius.");
  }
  if (data.donoroAmzius < 1 || data.donoroAmzius > 100) {
    throw new Error("Donoro amzius turi buti tarp 1 ir 100 metu.");
  }
}

export async function saveOrganData(data: OrganFormData): Promise<OrganListItem> {
  return modelSaveOrganData(data);
}

export async function submitOrganData(
  payload: unknown
): Promise<OrganRegistrationSubmitResult> {
  const formData = (payload ?? {}) as OrganFormData;
  validateData(formData);
  const organ = await saveOrganData(formData);

  return {
    organ,
    showNewOrganFillDialog: true,
  };
}
