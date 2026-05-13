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

export interface SurgeryEditFormData {
  tipas: string;
  prioritetas: string;
  data: string;
  pradziosLaikas: string;
  trukmeMin: number;
  busena: string;
  sudetingumas: string;
  operacineNr: number;
}

export function CheckSurgeryType(surgery: Pick<SurgeryListItem, "tipas">): string {
  return surgery.tipas;
}

