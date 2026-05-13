export interface SurgeryRoomUsageItem {
  nr: number;
  atliekamosOperacijosTipas: string;
  operacijos: SurgeryRoomScheduleItem[];
}

export interface SurgeryRoomScheduleItem {
  id: number;
  tipas: string;
  data: string;
  pradziosLaikas: string;
  trukmeMin: number;
  busena: string;
  pacientas: string;
  operacineNr: number;
}

export async function getOperatingRooms(): Promise<SurgeryRoomUsageItem[]> {
  const { fetchOperatingRoomsUsage } = await import(
    "@/src/Shared/repositories/SurgeryRoomRepository"
  );
  return fetchOperatingRoomsUsage();
}

export class SurgeryRoomService {
  static getSurgeryRoomsBySurgeries(
    surgeryRooms: SurgeryRoomUsageItem[],
    surgeries: import("@/src/Models/Surgery").SurgeryListItem[]
  ): SurgeryRoomUsageItem[] {
    void surgeries;
    return surgeryRooms;
  }
}
