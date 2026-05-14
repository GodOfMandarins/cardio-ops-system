import type { SurgeryListItem } from "@/src/Models/Surgery";
import {
  getResults as modelGetResults,
  submitOperationsResultData as entitySubmitOperationsResultData,
  type SurgeryIndicator,
  type SurgeryResultFormData,
  type SurgeryResultListItem,
} from "@/src/Models/SurgeryResults";
import { fetchSurgeries } from "@/src/Shared/repositories/SurgeryRepository";

export interface OperationsResultListOpening {
  surgeryResults: SurgeryResultListItem[];
  surgeries: SurgeryListItem[];
}

export interface OperationsResultDialog {
  dialog: true;
}

const ALLOWED_INDICATORS = new Set<SurgeryIndicator>([1, 2, 3, 4, 5]);

function getRegistrableSurgeries(
  surgeries: SurgeryListItem[],
  surgeryResults: SurgeryResultListItem[]
): SurgeryListItem[] {
  const resultSurgeryIds = new Set(
    surgeryResults.map((result) => result.operacijaId)
  );

  return surgeries.filter(
    (surgery) =>
      surgery.busena !== "atliktas" && !resultSurgeryIds.has(surgery.id)
  );
}

export async function openOperationsResultList(): Promise<OperationsResultListOpening> {
  const [surgeryResults, surgeries] = await Promise.all([
    modelGetResults(),
    fetchSurgeries(),
  ]);

  return {
    surgeryResults,
    surgeries: getRegistrableSurgeries(surgeries, surgeryResults),
  };
}

export function initiateOperationsResultOpening(): OperationsResultDialog {
  return { dialog: true };
}

export function validateData(
  data: SurgeryResultFormData,
  surgeries: SurgeryListItem[],
  surgeryResults: SurgeryResultListItem[]
): void {
  if (!Number.isInteger(data.operacijaId) || data.operacijaId <= 0) {
    throw new Error("Pasirinkite operacija.");
  }

  const surgery = surgeries.find((item) => item.id === data.operacijaId);
  if (!surgery) {
    throw new Error("Pasirinkta operacija nerasta.");
  }

  if (surgery.busena === "atliktas") {
    throw new Error("Pasirinktos operacijos rezultatai jau uzregistruoti.");
  }

  if (surgeryResults.some((result) => result.operacijaId === data.operacijaId)) {
    throw new Error("Pasirinktos operacijos rezultatai jau uzregistruoti.");
  }

  if (!ALLOWED_INDICATORS.has(data.pacientoStabilumas)) {
    throw new Error("Pasirinkite paciento stabiluma.");
  }

  if (!ALLOWED_INDICATORS.has(data.komplikacijuSunkumas)) {
    throw new Error("Pasirinkite komplikaciju sunkuma.");
  }

  if (!ALLOWED_INDICATORS.has(data.skausmoLygis)) {
    throw new Error("Pasirinkite skausmo lygi.");
  }
}

export async function submitOperationsResultData(
  payload: unknown
): Promise<SurgeryResultListItem> {
  const data = payload as SurgeryResultFormData;
  const [surgeries, surgeryResults] = await Promise.all([
    fetchSurgeries(),
    modelGetResults(),
  ]);
  validateData(data, surgeries, surgeryResults);
  return entitySubmitOperationsResultData(data);
}
