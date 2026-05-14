export type SurgeryIndicator = 1 | 2 | 3 | 4 | 5;

export interface SurgeryResultFormData {
  operacijaId: number;
  pacientoStabilumas: SurgeryIndicator;
  komplikacijuSunkumas: SurgeryIndicator;
  skausmoLygis: SurgeryIndicator;
}

export interface SurgeryResultListItem {
  id: number;
  pacientoStabilumas: number;
  komplikacijuSunkumas: number;
  skausmoLygis: number;
  operacijaId: number;
  operacijosTipas: string;
  gydytojasId: string;
}

export function GetSurgeryResultsByDoctor(
  doctorId: string,
  surgeryResults: SurgeryResultListItem[]
): SurgeryResultListItem[] {
  return surgeryResults.filter(
    (surgeryResult) => surgeryResult.gydytojasId === doctorId
  );
}

export async function getResults(): Promise<SurgeryResultListItem[]> {
  const { fetchSurgeryResults } = await import(
    "@/src/Shared/repositories/SurgeryResultsRepository"
  );
  return fetchSurgeryResults();
}

export async function submitOperationsResultData(
  data: SurgeryResultFormData
): Promise<SurgeryResultListItem> {
  const { createSurgeryResult } = await import(
    "@/src/Shared/repositories/SurgeryResultsRepository"
  );
  return createSurgeryResult(data);
}
