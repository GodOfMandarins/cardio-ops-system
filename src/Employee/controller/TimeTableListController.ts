import type { SurgeryListItem } from "@/src/Models/Surgery";
import { fetchSurgeries as modelGetSurgeries } from "@/src/Shared/repositories/SurgeryRepository";

export interface TimeTableWindowOpening {
  openWindow: true;
}

export interface SurgeriesResult {
  surgeriesList: SurgeryListItem[];
}

export function initiateWindowOpening(): TimeTableWindowOpening {
  return openWindow();
}

export function openWindow(): TimeTableWindowOpening {
  return { openWindow: true };
}

export async function getSurgeries(): Promise<SurgeriesResult> {
  const surgeriesList = await modelGetSurgeries();
  return { surgeriesList };
}
