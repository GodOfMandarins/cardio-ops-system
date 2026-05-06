import {
  getOperatingRooms,
  type SurgeryRoomUsageItem,
} from "@/src/Models/SurgeryRoom";

export interface SurgeryRoomWindowOpening {
  openWindow: true;
}

export interface SurgeryRoomsResult {
  operatingRooms: SurgeryRoomUsageItem[];
}

export function initiateWindowOpening(): SurgeryRoomWindowOpening {
  return openWindow();
}

export function openWindow(): SurgeryRoomWindowOpening {
  return { openWindow: true };
}

export async function getSurgeryRooms(): Promise<SurgeryRoomsResult> {
  const operatingRooms = await getOperatingRooms();
  return { operatingRooms };
}
