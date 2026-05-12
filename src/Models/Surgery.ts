export interface SurgeryListItem {
  id: number;
  tipas: string;
  prioritetas: string;
  data: string;
  pradziosLaikas: string;
  trukmeMin: number;
  busena: string;
  sudetingumas: string;
  pacientas: string;
  operacineNr: number;
}

export interface PlannedSurgeryListItem extends SurgeryListItem {
  gydytojuSkaicius: number;
}

export async function getSurgeries(): Promise<SurgeryListItem[]> {
  const { fetchSurgeries } = await import(
    "@/src/Shared/repositories/SurgeryRepository"
  );
  return fetchSurgeries();
}

export async function getPlannedSurgeries(): Promise<PlannedSurgeryListItem[]> {
  const { fetchPlannedSurgeries } = await import(
    "@/src/Shared/repositories/SurgeryRepository"
  );
  return fetchPlannedSurgeries();
}

export function CheckSurgeryType(surgery: Pick<SurgeryListItem, "tipas">): string {
  return surgery.tipas;
}
