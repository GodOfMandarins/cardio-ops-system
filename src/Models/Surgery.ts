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

export async function getSurgeries(): Promise<SurgeryListItem[]> {
  const { fetchSurgeries } = await import(
    "@/src/Shared/repositories/SurgeryRepository"
  );
  return fetchSurgeries();
}
